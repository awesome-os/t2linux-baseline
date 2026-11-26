#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

interface RemapPolicy {
  readonly exclude: readonly string[];
  readonly remap: Readonly<Record<string, string>>;
}

interface PackageRecord {
  readonly name: string;
  readonly category: string;
  readonly version: string;
  readonly license: string;
  readonly flags: readonly string[];
  readonly downloads: number;
  readonly tarballs: readonly string[];
  readonly classification: 'excluded-legacy' | 'remapped-awesome-os' | 'v11-cas-modern' | 'legacy-autotools-review';
  readonly remappedTo?: string;
}

const LEGACY_CATEGORIES = new Set(['xorg', 'x11', 'x11-legacy', 'attic', 'enlightenment', 'xfce4', 'lxde']);
const LEGACY_NAME_PATTERNS = [
  /^xorg-/i,
  /^xf86-/i,
  /^libx/i,
  /^gtk2/i,
  /^qt5/i,
  /^python2/i,
  /^perl-/i,
  /^(sysvinit|systemd|texinfo|groff|gettext|man-db|linux-firmware|akonadi|baloo|tracker-miner-fs|evolution-data-server)$/i,
];

function parseDesc(filePath: string, category: string, name: string): Omit<PackageRecord, 'classification' | 'remappedTo'> {
  const raw = readFileSync(filePath, 'utf8');
  let version = '';
  let license = '';
  const flags: string[] = [];
  const tarballs: string[] = [];

  for (const line of raw.split(/\r?\n/)) {
    if (line.startsWith('[V] ')) version = line.slice(4).trim();
    else if (line.startsWith('[L] ')) license = line.slice(4).trim();
    else if (line.startsWith('[F] ')) flags.push(...line.slice(4).trim().split(/\s+/).filter(Boolean));
    else if (line.startsWith('[D] ')) {
      const parts = line.slice(4).trim().split(/\s+/);
      if (parts.length >= 3) tarballs.push(`${parts[2]}${parts[1]}`);
      else if (parts.length >= 2) tarballs.push(parts[1]);
    }
  }
  return { name, category, version, license, flags, downloads: tarballs.length, tarballs };
}

function main(): void {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const t2Dir = process.argv[2] ? resolve(process.argv[2]) : join(repoRoot, 't2-trunk');
  const pkgRoot = join(t2Dir, 'package');
  if (!existsSync(pkgRoot)) {
    throw new Error(`T2 SDE package directory not found at ${pkgRoot}. Clone https://github.com/rxrbln/t2sde.git into t2-trunk/ first.`);
  }

  const policyPath = join(repoRoot, 'target', 'baseline', 't2-remap-policy.json');
  const policy = JSON.parse(readFileSync(policyPath, 'utf8')) as RemapPolicy;
  const excludeSet = new Set(policy.exclude.map((s) => s.toLowerCase()));

  const t0 = performance.now();
  const records: PackageRecord[] = [];
  const byCategory: Record<string, number> = {};
  const byClass: Record<PackageRecord['classification'], number> = {
    'excluded-legacy': 0,
    'remapped-awesome-os': 0,
    'v11-cas-modern': 0,
    'legacy-autotools-review': 0,
  };
  let totalDownloads = 0;
  let crossCapable = 0;

  for (const catEnt of readdirSync(pkgRoot, { withFileTypes: true })) {
    if (!catEnt.isDirectory()) continue;
    const cat = catEnt.name;
    const catPath = join(pkgRoot, cat);
    for (const pkgEnt of readdirSync(catPath, { withFileTypes: true })) {
      if (!pkgEnt.isDirectory()) continue;
      const pkg = pkgEnt.name;
      const descPath = join(catPath, pkg, `${pkg}.desc`);
      if (!existsSync(descPath)) continue;

      const parsed = parseDesc(descPath, cat, pkg);
      byCategory[cat] = (byCategory[cat] ?? 0) + 1;
      totalDownloads += parsed.downloads;
      if (parsed.flags.includes('CROSS')) crossCapable++;

      const lower = pkg.toLowerCase();
      let classification: PackageRecord['classification'] = 'v11-cas-modern';
      let remappedTo: string | undefined;

      if (policy.remap[lower] || (lower === 'coreutils' && policy.remap['gnu-coreutils'])) {
        classification = 'remapped-awesome-os';
        remappedTo = policy.remap[lower] ?? policy.remap['gnu-coreutils'];
      } else if (excludeSet.has(lower) || LEGACY_CATEGORIES.has(cat) || LEGACY_NAME_PATTERNS.some((rx) => rx.test(pkg))) {
        classification = 'excluded-legacy';
      } else if (!parsed.flags.includes('CROSS')) {
        classification = 'legacy-autotools-review';
      }

      byClass[classification]++;
      records.push({ ...parsed, classification, remappedTo });
    }
  }

  const elapsedMs = Number((performance.now() - t0).toFixed(1));
  const topCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  const summary = {
    schema: 'awesome-os.t2sde-ecosystem-analysis.v1',
    scannedPackages: records.length,
    totalCategories: Object.keys(byCategory).length,
    totalUpstreamTarballs: totalDownloads,
    crossCompilablePackages: crossCapable,
    crossPercent: Number(((crossCapable / Math.max(1, records.length)) * 100).toFixed(1)),
    classification: byClass,
    eliminatedOrRemappedPercent: Number(
      (((byClass['excluded-legacy'] + byClass['remapped-awesome-os']) / Math.max(1, records.length)) * 100).toFixed(1),
    ),
    topCategories,
    elapsedMs,
  };

  mkdirSync(join(repoRoot, 'dist'), { recursive: true });
  mkdirSync(join(repoRoot, 'catalog'), { recursive: true });
  writeFileSync(join(repoRoot, 'dist', 't2sde-ecosystem-analysis.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

  // 1. Export unified v11-package-universe.json (all modern CROSS-ready + remapped packages)
  const universe = {
    schema: 'awesome-os.v11-package-universe.v1',
    abiMagic: '0x33564742',
    casLayout: 'v11',
    source: 'https://github.com/rxrbln/t2sde',
    totalPackages: byClass['v11-cas-modern'] + byClass['remapped-awesome-os'],
    packages: records
      .filter((r) => r.classification === 'v11-cas-modern' || r.classification === 'remapped-awesome-os')
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((r) => ({
        name: r.name,
        category: r.category,
        version: r.version,
        license: r.license,
        mode: r.classification === 'remapped-awesome-os' ? 'remapped' : 'v11-cas-cross',
        ...(r.remappedTo ? { remappedTo: r.remappedTo } : {}),
        tarballs: r.tarballs,
      })),
  };
  writeFileSync(join(repoRoot, 'catalog', 'v11-package-universe.json'), `${JSON.stringify(universe, null, 2)}\n`, 'utf8');

  // 1b. Export frozen opt-in catalog/packages-legacy.json (X11, Xorg, SysV, GTK2, Qt5 — build once, freeze in v11 CAS forever!)
  const excludedPkgs = records.filter((r) => r.classification === 'excluded-legacy');
  const legacyCatalog = {
    schema: 'awesome-os.packages-legacy.v1',
    abiMagic: '0x33564742',
    casLayout: 'v11',
    policy: 'frozen-opt-in-overlay',
    notes: 'Frozen legacy packages (Xorg/X11, SysV, GTK2, Qt5, retro stacks). Opt-in via --overlay packages-legacy; zero impact on modern Wayland/musl builds.',
    totalPackages: excludedPkgs.length,
    packages: excludedPkgs
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((r) => ({
        name: r.name,
        category: r.category,
        version: r.version,
        license: r.license,
        crossCapable: r.flags.includes('CROSS'),
        tarballs: r.tarballs,
      })),
  };
  writeFileSync(join(repoRoot, 'catalog', 'packages-legacy.json'), `${JSON.stringify(legacyCatalog, null, 2)}\n`, 'utf8');

  // 2. Export constructive Upstream T2 SDE Modernization & Debloat Wishlist
  const nonCrossPkgs = records.filter((r) => r.classification === 'legacy-autotools-review');
  const exclByCat: Record<string, string[]> = {};
  for (const p of excludedPkgs) {
    (exclByCat[p.category] ??= []).push(p.name);
  }
  const nonCrossByCat: Record<string, string[]> = {};
  for (const p of nonCrossPkgs) {
    (nonCrossByCat[p.category] ??= []).push(p.name);
  }
  const topExclCats = Object.entries(exclByCat).sort((a, b) => b[1].length - a[1].length).slice(0, 12);
  const topNonCrossCats = Object.entries(nonCrossByCat).sort((a, b) => b[1].length - a[1].length).slice(0, 12);

  const wishlistMd = [
    '# T2 SDE Modernization & Debloat Wishlist',
    '',
    `> Generated automatically from **${summary.scannedPackages}** upstream \`rxrbln/t2sde\` package recipes across **${summary.totalCategories}** categories.`,
    '> Designed as a constructive, data-driven checklist for both Awesome-OS `v11` CAS builds and upstream T2 SDE modernization.',
    '',
    '## Summary',
    '',
    `- **Modern \`[F] CROSS\` + \`v11\` CAS Ready:** \`${byClass['v11-cas-modern']}\` packages (\`${((byClass['v11-cas-modern'] / summary.scannedPackages) * 100).toFixed(1)}%\`) — exported to [\`catalog/v11-package-universe.json\`](v11-package-universe.json).`,
    `- **Excluded Legacy Bloat Candidates:** \`${excludedPkgs.length}\` packages (legacy Xorg/X11, GTK2, Qt5, Python2, Perl legacy, SysV/Groff/Texinfo).`,
    `- **Non-\`CROSS\` Packages Needing Build-Script / Path Modernization:** \`${nonCrossPkgs.length}\` packages.`,
    '',
    '## 1. Legacy Bloat & Archive-Overlay Candidates (Top Categories)',
    '',
    'Moving these into an opt-in legacy overlay (e.g., `target/x11-legacy` / `attic`) keeps modern Wayland/musl targets fast and clean:',
    '',
    '| Category | Excluded Count | Sample Packages |',
    '| :--- | ---: | :--- |',
    ...topExclCats.map(([c, list]) => `| \`${c}\` | ${list.length} | ${list.slice(0, 8).map((x) => `\`${x}\``).join(', ')}${list.length > 8 ? ', …' : ''} |`),
    '',
    '## 2. Non-`CROSS` Packages Wishlist (Sysroot & Path Fixes)',
    '',
    'Adding `[F] CROSS` + sysroot-relative `pkg-config` / removing hardcoded `/usr/lib64` & `.la` paths unlocks native cross-compilation:',
    '',
    '| Category | Non-CROSS Count | Sample Packages |',
    '| :--- | ---: | :--- |',
    ...topNonCrossCats.map(([c, list]) => `| \`${c}\` | ${list.length} | ${list.slice(0, 8).map((x) => `\`${x}\``).join(', ')}${list.length > 8 ? ', …' : ''} |`),
    '',
    '## 3. High-Leverage Upstream Wins',
    '',
    '1. **Split Legacy X11 (`xorg` + `x11` = `' + ((byCategory.xorg ?? 0) + (byCategory.x11 ?? 0)) + '` packages)** into an optional overlay so Wayland workstations (`GNOME`, `KDE`, `Omarchy`, `Noctalia`, `ChonkStep`) never touch X11.',
    '2. **Eliminate `.la` libtool & hardcoded `/usr/lib64` paths** by routing `pkg-config` and `CC`/`CXX` through a single sysroot-relative wrapper (`holo-compiler` / `zig cc`).',
    '3. **Pin `[D]` tarballs by `sha512` in a `v11` CAS mirror** so upstream mirror 404s never break builds.',
    '',
  ].join('\n');

  writeFileSync(join(repoRoot, 'catalog', 'T2SDE-MODERNIZATION-WISHLIST.md'), wishlistMd, 'utf8');
  console.log(`Exported catalog/v11-package-universe.json (${universe.totalPackages} packages)`);
  console.log(`Exported catalog/T2SDE-MODERNIZATION-WISHLIST.md (${excludedPkgs.length} legacy + ${nonCrossPkgs.length} non-CROSS)`);

  console.log(`\n=== AWESOME-OS T2 SDE FULL-ECOSYSTEM BATTLE-TEST ANALYSIS (${elapsedMs} ms) ===`);
  console.log(`Scanned Packages       : ${summary.scannedPackages} across ${summary.totalCategories} categories`);
  console.log(`Upstream Tarballs [D]  : ${summary.totalUpstreamTarballs}`);
  console.log(`CROSS-Flagged Packages : ${summary.crossCompilablePackages} (${summary.crossPercent}%)`);
  console.log(`\nPolicy Classification (t2-remap-policy.json):`);
  console.log(`  Excluded Legacy Bloat    : ${byClass['excluded-legacy']}`);
  console.log(`  Remapped -> Awesome-OS   : ${byClass['remapped-awesome-os']}`);
  console.log(`  Modern v11 CAS Ready     : ${byClass['v11-cas-modern']}`);
  console.log(`  Non-CROSS Legacy Review  : ${byClass['legacy-autotools-review']}`);
  console.log(`\nTop Categories:`);
  for (const [cat, count] of topCategories) {
    console.log(`  ${cat.padEnd(20)} ${count}`);
  }
}

main();
