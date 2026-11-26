#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

interface V11Package {
  readonly name: string;
  readonly category: string;
  readonly version: string;
  readonly license: string;
  readonly mode: string;
  readonly tarballs: readonly string[];
}

interface V11Universe {
  readonly schema: string;
  readonly abiMagic: string;
  readonly casLayout: string;
  readonly totalPackages: number;
  readonly packages: readonly V11Package[];
}

interface VcpkgDependencyObject {
  readonly name: string;
  readonly platform?: string;
  readonly features?: readonly (string | { readonly name: string; readonly platform?: string })[];
  readonly 'default-features'?: boolean;
}

type VcpkgDependency = string | VcpkgDependencyObject;

interface VcpkgOverride {
  readonly name: string;
  readonly version?: string;
  readonly 'version-date'?: string;
  readonly 'version-semver'?: string;
  readonly 'version-string'?: string;
}

interface VcpkgManifest {
  readonly 'builtin-baseline'?: string;
  readonly dependencies?: readonly VcpkgDependency[];
  readonly features?: Readonly<Record<string, { readonly dependencies?: readonly VcpkgDependency[] }>>;
  readonly overrides?: readonly VcpkgOverride[];
}

type Winner = 'v11-universe' | 'ladybird-vcpkg' | 'equal' | 'ladybird-only';

interface LockedLibrary {
  readonly name: string;
  readonly v11Name: string | null;
  readonly ladybirdVersion: string | null;
  readonly v11Version: string | null;
  readonly maxVersion: string;
  readonly winner: Winner;
  readonly sharedBy: readonly string[];
}

interface MaxVersionLockSummary {
  readonly totalLadybirdDeps: number;
  readonly coveredInV11: number;
  readonly overlapPercent: number;
  readonly raisedFromV11: number;
  readonly raisedFromLadybird: number;
  readonly equalAtMax: number;
  readonly ladybirdCustomPins: number;
}

interface MaxVersionLock {
  readonly schema: 'awesome-os.max-version-lock.v1';
  readonly abiMagic: '0x33564742';
  readonly casLayout: 'v11';
  readonly generatedAt: string;
  readonly sources: {
    readonly v11Universe: string;
    readonly ladybirdVcpkg: string;
    readonly vcpkgBaseline: string | null;
  };
  readonly summary: MaxVersionLockSummary;
  readonly libraries: readonly LockedLibrary[];
}

const VCPKG_TO_V11_ALIASES: Readonly<Record<string, string>> = {
  sqlite3: 'sqlite',
  qtbase: 'qt6base',
  qtsvg: 'qt6svg',
  qtpositioning: 'qt6positioning',
  qtserialport: 'qt6serialport',
  vulkan: 'vulkan-loader',
  libpng: 'libpng',
  freetype: 'freetype',
  fontconfig: 'fontconfig',
  harfbuzz: 'harfbuzz',
  icu: 'icu4c',
  sdl3: 'libsdl3',
  tiff: 'libtiff',
  'fast-float': 'fast_float',
  'vcpkg-tool-meson': 'meson',
};

export function stripPortSuffix(version: string): string {
  return version.trim().replace(/#\d+$/, '');
}

function isPureDateVersion(version: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(version) || /^\d{8}(?:[-.]|$)/.test(version);
}

function normalizeDateToken(version: string): string {
  const m = version.match(/^(\d{4})-(\d{2})-(\d{2})(.*)$/);
  if (m) {
    return `${m[1]}${m[2]}${m[3]}${m[4]}`;
  }
  return version;
}

function parseNumericSegments(version: string): number[] {
  const normalized = normalizeDateToken(stripPortSuffix(version));
  const matches = normalized.match(/\d+/g);
  if (!matches) return [];
  return matches.map((part) => Number.parseInt(part, 10));
}

/**
 * Compares two version strings (stripping `#N` vcpkg port suffixes).
 * Returns:
 *   > 0 if a > b
 *   < 0 if a < b
 *   0 if equal
 */
export function compareVersions(a: string, b: string): number {
  const cleanA = stripPortSuffix(a);
  const cleanB = stripPortSuffix(b);
  if (cleanA === cleanB) return 0;

  const aIsDate = isPureDateVersion(cleanA);
  const bIsDate = isPureDateVersion(cleanB);

  // If one side is a date-stamped vcpkg meta-port (e.g. vulkan 2023-12-17) and
  // the other side is a real semver library version (e.g. vulkan-loader 1.4.369),
  // prefer the real semver release over the legacy date wrapper.
  if (aIsDate && !bIsDate) return -1;
  if (!aIsDate && bIsDate) return 1;

  const segA = parseNumericSegments(cleanA);
  const segB = parseNumericSegments(cleanB);
  const maxLen = Math.max(segA.length, segB.length);

  for (let i = 0; i < maxLen; i++) {
    const numA = segA[i] ?? 0;
    const numB = segB[i] ?? 0;
    if (numA !== numB) {
      return numA > numB ? 1 : -1;
    }
  }

  return cleanA.localeCompare(cleanB);
}

function extractOverrideVersion(override: VcpkgOverride): string | null {
  return override.version ?? override['version-semver'] ?? override['version-date'] ?? override['version-string'] ?? null;
}

function collectLadybirdDeps(vcpkg: VcpkgManifest): Map<string, string | null> {
  const depVersions = new Map<string, string | null>();

  for (const dep of vcpkg.dependencies ?? []) {
    const name = typeof dep === 'string' ? dep : dep.name;
    if (!depVersions.has(name)) depVersions.set(name, null);
  }

  for (const feature of Object.values(vcpkg.features ?? {})) {
    for (const dep of feature.dependencies ?? []) {
      const name = typeof dep === 'string' ? dep : dep.name;
      if (!depVersions.has(name)) depVersions.set(name, null);
    }
  }

  for (const override of vcpkg.overrides ?? []) {
    depVersions.set(override.name, extractOverrideVersion(override));
  }

  return depVersions;
}

function resolveV11Package(name: string, v11Map: ReadonlyMap<string, V11Package>): V11Package | null {
  const direct = v11Map.get(name);
  if (direct) return direct;

  const aliased = VCPKG_TO_V11_ALIASES[name];
  if (aliased) {
    const hit = v11Map.get(aliased);
    if (hit) return hit;
  }

  return null;
}

function resolveVcpkgPath(repoRoot: string): string {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--vcpkg' && args[i + 1]) {
      return resolve(args[i + 1]);
    }
    if (arg.startsWith('--vcpkg=')) {
      return resolve(arg.slice('--vcpkg='.length));
    }
    if (!arg.startsWith('-')) {
      return resolve(arg);
    }
  }
  return resolve(repoRoot, '..', 'ladybird', 'vcpkg.json');
}

function pad(text: string, width: number): string {
  return text.length >= width ? text.slice(0, width) : text + ' '.repeat(width - text.length);
}

function printSummaryTable(lock: MaxVersionLock): void {
  const { summary, libraries } = lock;
  console.log('');
  console.log(`Awesome-OS Max-Version Unified Lock (${lock.schema} | ABI ${lock.abiMagic} | CAS ${lock.casLayout})`);
  console.log('='.repeat(102));
  console.log(
    `Total Ladybird Deps : ${summary.totalLadybirdDeps}  |  Covered in v11 : ${summary.coveredInV11} (${summary.overlapPercent.toFixed(2)}%)`,
  );
  console.log(
    `Raised from v11     : ${summary.raisedFromV11}  |  Raised from Ladybird : ${summary.raisedFromLadybird}  |  Equal : ${summary.equalAtMax}  |  Ladybird-only : ${summary.ladybirdCustomPins}`,
  );
  console.log('='.repeat(102));
  console.log(
    `${pad('Library', 25)} ${pad('v11 Package', 18)} ${pad('Ladybird', 16)} ${pad('v11', 14)} ${pad('Max', 14)} Winner`,
  );
  console.log('-'.repeat(102));

  for (const lib of libraries) {
    const lbVer = lib.ladybirdVersion ? stripPortSuffix(lib.ladybirdVersion) : '-';
    const v11Ver = lib.v11Version ?? '-';
    const v11Name = lib.v11Name ?? '-';
    console.log(
      `${pad(lib.name, 25)} ${pad(v11Name, 18)} ${pad(lbVer, 16)} ${pad(v11Ver, 14)} ${pad(lib.maxVersion, 14)} ${lib.winner}`,
    );
  }
  console.log('-'.repeat(102));
}

function main(): void {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const v11Path = join(repoRoot, 'catalog', 'v11-package-universe.json');
  const vcpkgPath = resolveVcpkgPath(repoRoot);
  const outPath = join(repoRoot, 'catalog', 'max-version-lock.json');

  if (!existsSync(v11Path)) {
    throw new Error(`v11 package universe not found at ${v11Path}`);
  }
  if (!existsSync(vcpkgPath)) {
    throw new Error(`Ladybird vcpkg.json not found at ${vcpkgPath}`);
  }

  const v11Universe = JSON.parse(readFileSync(v11Path, 'utf8')) as V11Universe;
  const vcpkg = JSON.parse(readFileSync(vcpkgPath, 'utf8')) as VcpkgManifest;

  const v11Map = new Map<string, V11Package>();
  for (const pkg of v11Universe.packages) {
    v11Map.set(pkg.name, pkg);
  }

  const ladybirdDeps = collectLadybirdDeps(vcpkg);
  const sortedNames = [...ladybirdDeps.keys()].sort((a, b) => a.localeCompare(b));

  const libraries: LockedLibrary[] = [];
  let coveredInV11 = 0;
  let raisedFromV11 = 0;
  let raisedFromLadybird = 0;
  let equalAtMax = 0;
  let ladybirdCustomPins = 0;

  for (const name of sortedNames) {
    const rawLadybirdVersion = ladybirdDeps.get(name) ?? null;
    const cleanLadybirdVersion = rawLadybirdVersion ? stripPortSuffix(rawLadybirdVersion) : null;
    const v11Pkg = resolveV11Package(name, v11Map);

    if (!v11Pkg) {
      ladybirdCustomPins++;
      libraries.push({
        name,
        v11Name: null,
        ladybirdVersion: rawLadybirdVersion,
        v11Version: null,
        maxVersion: cleanLadybirdVersion ?? 'unpinned',
        winner: 'ladybird-only',
        sharedBy: ['ladybird'],
      });
      continue;
    }

    coveredInV11++;
    const v11Version = v11Pkg.version;
    let winner: Winner;
    let maxVersion: string;

    if (!cleanLadybirdVersion) {
      winner = 'v11-universe';
      maxVersion = v11Version;
      raisedFromV11++;
    } else {
      const cmp = compareVersions(v11Version, cleanLadybirdVersion);
      if (cmp > 0) {
        winner = 'v11-universe';
        maxVersion = v11Version;
        raisedFromV11++;
      } else if (cmp < 0) {
        winner = 'ladybird-vcpkg';
        maxVersion = cleanLadybirdVersion;
        raisedFromLadybird++;
      } else {
        winner = 'equal';
        maxVersion = v11Version;
        equalAtMax++;
      }
    }

    libraries.push({
      name,
      v11Name: v11Pkg.name,
      ladybirdVersion: rawLadybirdVersion,
      v11Version,
      maxVersion,
      winner,
      sharedBy: ['t2linux-v11', 'ladybird'],
    });
  }

  const totalLadybirdDeps = sortedNames.length;
  const overlapPercent =
    totalLadybirdDeps === 0 ? 0 : Math.round((coveredInV11 / totalLadybirdDeps) * 10000) / 100;

  const lock: MaxVersionLock = {
    schema: 'awesome-os.max-version-lock.v1',
    abiMagic: '0x33564742',
    casLayout: 'v11',
    generatedAt: new Date().toISOString(),
    sources: {
      v11Universe: 'catalog/v11-package-universe.json',
      ladybirdVcpkg: vcpkgPath,
      vcpkgBaseline: vcpkg['builtin-baseline'] ?? null,
    },
    summary: {
      totalLadybirdDeps,
      coveredInV11,
      overlapPercent,
      raisedFromV11,
      raisedFromLadybird,
      equalAtMax,
      ladybirdCustomPins,
    },
    libraries,
  };

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(lock, null, 2)}\n`, 'utf8');

  printSummaryTable(lock);
  console.log(`Wrote ${outPath}`);
}

main();
