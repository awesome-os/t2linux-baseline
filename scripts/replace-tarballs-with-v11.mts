#!/usr/bin/env node
/**
 * @file scripts/replace-tarballs-with-v11.mts
 * @description Replaces legacy .tar.* download URLs for all live-tracked libraries in
 * catalog/v11-package-universe.json with canonical live-max repository:// and
 * cas://v11/trees/<pkg>@<maxVersion> URIs, writing catalog/v11-tarball-replacement-manifest.json.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compareVersions } from './generate-max-version-lock.mts';

interface UpstreamRec {
  pkg: string;
  repo: string;
  upstreamTag: string;
  upstreamVersion: string;
}

interface V11Pkg {
  name: string;
  category: string;
  version: string;
  license: string;
  mode: string;
  tarballs: string[];
  v11TreeUri?: string;
  repositoryUri?: string;
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tracker = JSON.parse(
  readFileSync(join(repoRoot, 'catalog', 'live-upstream-tracker.json'), 'utf8'),
) as { libraries: UpstreamRec[] };

const uniPath = join(repoRoot, 'catalog', 'v11-package-universe.json');
const uni = JSON.parse(readFileSync(uniPath, 'utf8')) as {
  packages: V11Pkg[];
  tarballReplacementAt?: string;
};

const upstreamMap = new Map(tracker.libraries.map((l) => [l.pkg.toLowerCase(), l]));
const replacements: Array<{
  pkg: string;
  version: string;
  bumpedFrom: string | null;
  retiredTarballs: number;
  repositoryUri: string;
  v11TreeUri: string;
}> = [];

let totalTarballsRetired = 0;

for (const pkg of uni.packages) {
  const u = upstreamMap.get(pkg.name.toLowerCase());
  if (!u) continue;

  let bumpedFrom: string | null = null;
  if (compareVersions(u.upstreamVersion, pkg.version) > 0) {
    bumpedFrom = pkg.version;
    pkg.version = u.upstreamVersion;
  }

  const retired = Array.isArray(pkg.tarballs)
    ? pkg.tarballs.filter((t) => /\.(tar|tgz|tbz2|txz|zip)/i.test(t)).length
    : 0;
  totalTarballsRetired += retired;

  const repositoryUri = `repository://github.com/${u.repo}@${u.upstreamTag}`;
  const v11TreeUri = `cas://v11/trees/${pkg.name}@${pkg.version}`;
  pkg.repositoryUri = repositoryUri;
  pkg.v11TreeUri = v11TreeUri;
  pkg.tarballs = [v11TreeUri, repositoryUri];

  replacements.push({
    pkg: pkg.name,
    version: pkg.version,
    bumpedFrom,
    retiredTarballs: retired,
    repositoryUri,
    v11TreeUri,
  });
}

uni.tarballReplacementAt = new Date().toISOString();
writeFileSync(uniPath, JSON.stringify(uni, null, 2) + '\n', 'utf8');

const manifest = {
  schema: 'awesome-os.v11-tarball-replacement.v1',
  abiMagic: '0x33564742',
  casLayout: 'v11',
  generatedAt: new Date().toISOString(),
  librariesReplaced: replacements.length,
  totalLegacyTarballsRetired: totalTarballsRetired,
  replacements,
};

const outPath = join(repoRoot, 'catalog', 'v11-tarball-replacement-manifest.json');
writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(
  `[v11 TARBALL REPLACEMENT] Replaced legacy tarballs for ${replacements.length} core libraries (${totalTarballsRetired} .tar.* URLs retired -> cas://v11/trees/ + repository:// at live max).`,
);
