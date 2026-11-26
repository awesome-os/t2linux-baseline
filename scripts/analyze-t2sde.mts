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
  let downloads = 0;

  for (const line of raw.split(/\r?\n/)) {
    if (line.startsWith('[V] ')) version = line.slice(4).trim();
    else if (line.startsWith('[L] ')) license = line.slice(4).trim();
    else if (line.startsWith('[F] ')) flags.push(...line.slice(4).trim().split(/\s+/).filter(Boolean));
    else if (line.startsWith('[D] ')) downloads++;
  }
  return { name, category, version, license, flags, downloads };
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
  writeFileSync(join(repoRoot, 'dist', 't2sde-ecosystem-analysis.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

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
