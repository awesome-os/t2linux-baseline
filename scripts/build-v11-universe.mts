#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, linkSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type WaveName = 'core' | 'wayland' | 'devtools' | 'all';
type TargetArch = 'x86_64' | 'aarch64';

interface UniversePackage {
  readonly name: string;
  readonly category: string;
  readonly version: string;
  readonly license: string;
  readonly mode: string;
  readonly tarballs: readonly string[];
}

interface PackageUniverseCatalog {
  readonly schema: string;
  readonly abiMagic: string;
  readonly casLayout: string;
  readonly source: string;
  readonly totalPackages: number;
  readonly packages: readonly UniversePackage[];
}

interface QueuedPackage {
  readonly name: string;
  readonly category: string;
  readonly version: string;
  readonly license: string;
  readonly mode: string;
  readonly arch: TargetArch;
  readonly tarballs: readonly string[];
  readonly recipeSha512: string;
  readonly casRecipeKey: string;
}

interface SmokeBuildResult {
  readonly compiler: string;
  readonly arch: TargetArch;
  readonly source: string;
  readonly binaryBytes: number;
  readonly sha512: string;
  readonly casPath: string;
  readonly sysrootPath: string;
  readonly inode: string;
  readonly nlink: number;
  readonly hardlinkVerified: boolean;
}

interface CliOptions {
  readonly wave: WaveName;
  readonly limit: number;
  readonly arch: TargetArch;
  readonly dryRun: boolean;
  readonly smokeBuild: boolean;
}

const WAVE_CATEGORIES: Readonly<Record<Exclude<WaveName, 'all'>, ReadonlySet<string>>> = {
  core: new Set(['base', 'filesystem', 'archiver', 'security', 'network']),
  wayland: new Set(['wayland', 'graphic', 'gnome', 'kde', 'multimedia', 'audio']),
  devtools: new Set(['develop', 'rust', 'python']),
};

function parseArgs(argv: readonly string[]): CliOptions {
  let wave: WaveName = 'core';
  let limit = 50;
  let arch: TargetArch = 'x86_64';
  let dryRunExplicit: boolean | undefined;
  let smokeBuild = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--wave') {
      const val = argv[++i];
      if (val !== 'core' && val !== 'wayland' && val !== 'devtools' && val !== 'all') {
        throw new Error(`Invalid --wave "${val ?? ''}". Expected: core | wayland | devtools | all`);
      }
      wave = val;
    } else if (arg.startsWith('--wave=')) {
      const val = arg.slice('--wave='.length);
      if (val !== 'core' && val !== 'wayland' && val !== 'devtools' && val !== 'all') {
        throw new Error(`Invalid --wave "${val}". Expected: core | wayland | devtools | all`);
      }
      wave = val;
    } else if (arg === '--limit') {
      const val = Number(argv[++i]);
      if (!Number.isInteger(val) || val < 0) {
        throw new Error(`Invalid --limit "${val}". Expected a non-negative integer (0 = unlimited).`);
      }
      limit = val;
    } else if (arg.startsWith('--limit=')) {
      const val = Number(arg.slice('--limit='.length));
      if (!Number.isInteger(val) || val < 0) {
        throw new Error(`Invalid --limit "${val}". Expected a non-negative integer (0 = unlimited).`);
      }
      limit = val;
    } else if (arg === '--arch') {
      const val = argv[++i];
      if (val !== 'x86_64' && val !== 'aarch64') {
        throw new Error(`Invalid --arch "${val ?? ''}". Expected: x86_64 | aarch64`);
      }
      arch = val;
    } else if (arg.startsWith('--arch=')) {
      const val = arg.slice('--arch='.length);
      if (val !== 'x86_64' && val !== 'aarch64') {
        throw new Error(`Invalid --arch "${val}". Expected: x86_64 | aarch64`);
      }
      arch = val;
    } else if (arg === '--dry-run') {
      dryRunExplicit = true;
    } else if (arg === '--smoke-build') {
      smokeBuild = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(
        [
          'Usage: build-v11-universe.mts [options]',
          '  --wave core|wayland|devtools|all   Package wave filter (default: core)',
          '  --limit <N>                        Max queued packages, 0 = unlimited (default: 50)',
          '  --arch x86_64|aarch64              Target architecture (default: x86_64)',
          '  --dry-run                          Compute queue without compiling (default unless --smoke-build)',
          '  --smoke-build                      Compile src/t2_mininit.c into v11 CAS and verify hardlink projection',
        ].join('\n'),
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown CLI argument: ${arg}`);
    }
  }

  const dryRun = dryRunExplicit ?? !smokeBuild;
  return { wave, limit, arch, dryRun, smokeBuild };
}

function matchesWave(pkg: UniversePackage, wave: WaveName): boolean {
  if (wave === 'all') return true;
  return WAVE_CATEGORIES[wave].has(pkg.category);
}

function computeRecipeSha512(pkg: UniversePackage, arch: TargetArch, abiMagic: string): string {
  const canonical = JSON.stringify({
    abiMagic,
    arch,
    casLayout: 'v11',
    category: pkg.category,
    license: pkg.license,
    mode: pkg.mode,
    name: pkg.name,
    tarballs: pkg.tarballs,
    version: pkg.version,
  });
  return createHash('sha512').update(canonical, 'utf8').digest('hex');
}

function spawnTool(cmd: string, args: readonly string[], isCmdShim: boolean): ReturnType<typeof spawnSync> {
  if (isCmdShim) {
    return spawnSync('cmd.exe', ['/d', '/s', '/c', cmd, ...args], {
      stdio: 'pipe',
      encoding: 'utf8',
      shell: false,
    });
  }
  return spawnSync(cmd, args, {
    stdio: 'pipe',
    encoding: 'utf8',
    shell: false,
  });
}

function commandExists(cmd: string, args: readonly string[], isCmdShim: boolean): boolean {
  const res = spawnTool(cmd, args, isCmdShim);
  return !res.error && res.status === 0;
}

function resolveCompiler(arch: TargetArch): { readonly label: string; readonly cmd: string; readonly args: readonly string[]; readonly isCmdShim: boolean } {
  const isWin = process.platform === 'win32';
  const zigCandidates = isWin
    ? [resolve('e:\\awesome-os\\bin\\zig.cmd'), 'zig']
    : ['zig'];

  for (const zigCmd of zigCandidates) {
    if (zigCmd.includes('\\') && !existsSync(zigCmd)) continue;
    const isCmdShim = isWin && zigCmd.toLowerCase().endsWith('.cmd');
    if (commandExists(zigCmd, ['version'], isCmdShim)) {
      return {
        label: `zig cc (${arch}-linux-musl)`,
        cmd: zigCmd,
        args: ['cc', '-target', `${arch}-linux-musl`, '-static', '-Os', '-s', '-Wall', '-Wextra', '-Werror'],
        isCmdShim,
      };
    }
  }

  if (!isWin && commandExists('musl-gcc', ['--version'], false)) {
    return {
      label: 'musl-gcc',
      cmd: 'musl-gcc',
      args: ['-static', '-Os', '-s', '-Wall', '-Wextra', '-Werror'],
      isCmdShim: false,
    };
  }

  throw new Error('No supported C compiler found for --smoke-build. Expected `zig cc` (or e:\\awesome-os\\bin\\zig.cmd on Windows) or `musl-gcc`.');
}

function runSmokeBuild(repoRoot: string, arch: TargetArch): SmokeBuildResult {
  const srcPath = join(repoRoot, 'src', 't2_mininit.c');
  if (!existsSync(srcPath)) {
    throw new Error(`Smoke-build source missing: ${srcPath}`);
  }

  const buildDir = join(repoRoot, 'build');
  const stageBin = join(buildDir, `t2-mininit-${arch}`);
  mkdirSync(buildDir, { recursive: true });

  const compiler = resolveCompiler(arch);
  const compileArgs = [...compiler.args, srcPath, '-o', stageBin];
  const res = spawnTool(compiler.cmd, compileArgs, compiler.isCmdShim);

  if (res.error || res.status !== 0) {
    throw new Error(
      `Smoke-build compilation failed (${compiler.label}, status=${res.status ?? 'error'}):\n${res.stderr || res.error?.message || 'unknown error'}`,
    );
  }

  const binBytes = readFileSync(stageBin);
  const sha512 = createHash('sha512').update(binBytes).digest('hex');

  const casDir = join(repoRoot, 'build', 'cas', 'v11', 'files', sha512.slice(0, 2));
  const casPath = join(casDir, `${sha512}-exec`);
  mkdirSync(casDir, { recursive: true });
  copyFileSync(stageBin, casPath);

  const sysrootBinDir = join(repoRoot, 'build', 'sysroot', 'usr', 'bin');
  const sysrootPath = join(sysrootBinDir, 't2-mininit');
  mkdirSync(sysrootBinDir, { recursive: true });
  if (existsSync(sysrootPath)) {
    rmSync(sysrootPath, { force: true });
  }
  linkSync(casPath, sysrootPath);

  const casStat = statSync(casPath, { bigint: true });
  const sysrootStat = statSync(sysrootPath, { bigint: true });
  const hardlinkVerified =
    casStat.size > 0n &&
    casStat.size === sysrootStat.size &&
    casStat.ino === sysrootStat.ino &&
    casStat.nlink >= 2n;

  if (!hardlinkVerified) {
    throw new Error(
      `Hardlink verification failed: cas(ino=${casStat.ino}, size=${casStat.size}, nlink=${casStat.nlink}) vs sysroot(ino=${sysrootStat.ino}, size=${sysrootStat.size}, nlink=${sysrootStat.nlink})`,
    );
  }

  return {
    compiler: compiler.label,
    arch,
    source: relative(repoRoot, srcPath).replace(/\\/g, '/'),
    binaryBytes: Number(casStat.size),
    sha512,
    casPath: relative(repoRoot, casPath).replace(/\\/g, '/'),
    sysrootPath: relative(repoRoot, sysrootPath).replace(/\\/g, '/'),
    inode: casStat.ino.toString(),
    nlink: Number(casStat.nlink),
    hardlinkVerified,
  };
}

function main(): void {
  const opts = parseArgs(process.argv.slice(2));
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const catalogPath = join(repoRoot, 'catalog', 'v11-package-universe.json');

  if (!existsSync(catalogPath)) {
    throw new Error(`Catalog not found at ${catalogPath}. Run scripts/analyze-t2sde.mts first.`);
  }

  const catalog = JSON.parse(readFileSync(catalogPath, 'utf8')) as PackageUniverseCatalog;
  const waveCounts: Record<WaveName, number> = {
    core: 0,
    wayland: 0,
    devtools: 0,
    all: catalog.packages.length,
  };

  for (const pkg of catalog.packages) {
    if (WAVE_CATEGORIES.core.has(pkg.category)) waveCounts.core++;
    if (WAVE_CATEGORIES.wayland.has(pkg.category)) waveCounts.wayland++;
    if (WAVE_CATEGORIES.devtools.has(pkg.category)) waveCounts.devtools++;
  }

  const matching = catalog.packages.filter((pkg) => matchesWave(pkg, opts.wave));
  const selected = opts.limit === 0 ? matching : matching.slice(0, opts.limit);

  const queue: QueuedPackage[] = selected.map((pkg) => {
    const recipeSha512 = computeRecipeSha512(pkg, opts.arch, catalog.abiMagic);
    return {
      name: pkg.name,
      category: pkg.category,
      version: pkg.version,
      license: pkg.license,
      mode: pkg.mode,
      arch: opts.arch,
      tarballs: pkg.tarballs,
      recipeSha512,
      casRecipeKey: `v11/recipes/${recipeSha512.slice(0, 2)}/${recipeSha512}.json`,
    };
  });

  const smokeBuildResult = opts.smokeBuild ? runSmokeBuild(repoRoot, opts.arch) : null;

  const distDir = join(repoRoot, 'dist');
  mkdirSync(distDir, { recursive: true });
  const queueOutPath = join(distDir, 'v11-build-queue.json');

  const payload = {
    schema: 'awesome-os.v11-build-queue.v1',
    abiMagic: catalog.abiMagic,
    casLayout: catalog.casLayout,
    source: catalog.source,
    wave: opts.wave,
    arch: opts.arch,
    dryRun: opts.dryRun,
    smokeBuild: opts.smokeBuild,
    limit: opts.limit,
    totalUniversePackages: catalog.packages.length,
    waveTotalPackages: matching.length,
    queuedPackages: queue.length,
    waveCounts,
    smokeBuildResult,
    queue,
  };

  writeFileSync(queueOutPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log(
    `[v11-universe] wave=${opts.wave} arch=${opts.arch} dryRun=${opts.dryRun} smokeBuild=${opts.smokeBuild} matched=${matching.length}/${catalog.packages.length} queued=${queue.length}`,
  );
  console.log(
    `[v11-universe] waveCounts: core=${waveCounts.core} wayland=${waveCounts.wayland} devtools=${waveCounts.devtools} all=${waveCounts.all}`,
  );
  if (smokeBuildResult) {
    console.log(
      `[v11-universe] smoke-build PASS: ${smokeBuildResult.compiler} -> ${smokeBuildResult.casPath} (${smokeBuildResult.binaryBytes} B, ino=${smokeBuildResult.inode}, nlink=${smokeBuildResult.nlink}) == ${smokeBuildResult.sysrootPath}`,
    );
  }
  console.log(`[v11-universe] wrote ${relative(repoRoot, queueOutPath).replace(/\\/g, '/')}`);
}

main();
