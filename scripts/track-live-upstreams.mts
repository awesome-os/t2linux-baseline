#!/usr/bin/env node
/**
 * @file scripts/track-live-upstreams.mts
 * @description Queries real live upstream GitHub Releases (and Chromium Dash)
 * for every core shared library in the 12-Big-Boys stack, writes
 * catalog/live-upstream-tracker.json, and auto-bumps catalog/v11-package-universe.json
 * to the true live upstream max version.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compareVersions } from './generate-max-version-lock.mts';

interface UpstreamTarget {
  readonly pkg: string;
  readonly repo: string;
}

const UPSTREAMS: readonly UpstreamTarget[] = [
  { pkg: 'libuv', repo: 'libuv/libuv' },
  { pkg: 'openssl', repo: 'openssl/openssl' },
  { pkg: 'harfbuzz', repo: 'harfbuzz/harfbuzz' },
  { pkg: 'zstd', repo: 'facebook/zstd' },
  { pkg: 'mimalloc', repo: 'microsoft/mimalloc' },
  { pkg: 'zlib-ng', repo: 'zlib-ng/zlib-ng' },
  { pkg: 'expat', repo: 'libexpat/libexpat' },
  { pkg: 'ada', repo: 'ada-url/ada' },
  { pkg: 'curl', repo: 'curl/curl' },
  { pkg: 'vulkan-headers', repo: 'KhronosGroup/Vulkan-Headers' },
  { pkg: 'vulkan-loader', repo: 'KhronosGroup/Vulkan-Loader' },
  { pkg: 'glslang', repo: 'KhronosGroup/glslang' },
  { pkg: 'brotli', repo: 'google/brotli' },
  { pkg: 'simdjson', repo: 'simdjson/simdjson' },
  { pkg: 'simdutf', repo: 'simdutf/simdutf' },
  { pkg: 'protobuf', repo: 'protocolbuffers/protobuf' },
  { pkg: 'liburing', repo: 'axboe/liburing' },
  { pkg: 'openblas', repo: 'OpenMathLib/OpenBLAS' },
  { pkg: 'cmake', repo: 'Kitware/CMake' },
  { pkg: 'ninja', repo: 'ninja-build/ninja' },
  { pkg: 'nghttp2', repo: 'nghttp2/nghttp2' },
];

function normalizeTag(raw: string): string {
  const s = raw.trim();
  // Handle tags like "v1.53.0", "openssl-4.1.0", "curl-8_23_0", "R_2_11_0", "vulkan-sdk-1.4.369.0", "liburing-2.14"
  const m = s.match(/(\d+[._]\d+(?:[._]\d+){0,2})/);
  if (!m) return s;
  return m[1].replace(/_/g, '.');
}

function fetchLatestGithubVersion(repo: string): { tag: string; version: string } | null {
  try {
    const out = execFileSync('gh', ['api', `repos/${repo}/releases/latest`, '--jq', '.tag_name'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (out) return { tag: out, version: normalizeTag(out) };
  } catch {
    // Fallback to tags if repo does not use GitHub Releases
  }
  try {
    const out = execFileSync('gh', ['api', `repos/${repo}/tags?per_page=1`, '--jq', '.[0].name'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (out) return { tag: out, version: normalizeTag(out) };
  } catch {
    return null;
  }
  return null;
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const uniPath = join(repoRoot, 'catalog', 'v11-package-universe.json');
const uni = JSON.parse(readFileSync(uniPath, 'utf8')) as {
  packages: Array<{ name: string; version: string }>;
  liveUpstreamSyncedAt?: string;
};

const pkgMap = new Map(uni.packages.map((p) => [p.name.toLowerCase(), p]));
const results: Array<{
  pkg: string;
  repo: string;
  upstreamTag: string;
  upstreamVersion: string;
  previousV11: string | null;
  bumped: boolean;
}> = [];

for (const u of UPSTREAMS) {
  const live = fetchLatestGithubVersion(u.repo);
  if (!live) {
    console.log(`  [SKIP] ${u.pkg.padEnd(16)} (${u.repo}) -> unavailable`);
    continue;
  }
  const existing = pkgMap.get(u.pkg.toLowerCase());
  const prev = existing?.version ?? null;
  let bumped = false;
  if (existing && compareVersions(live.version, existing.version) > 0) {
    existing.version = live.version;
    bumped = true;
  }
  results.push({
    pkg: u.pkg,
    repo: u.repo,
    upstreamTag: live.tag,
    upstreamVersion: live.version,
    previousV11: prev,
    bumped,
  });
  const mark = bumped ? `BUMP ${prev} -> ${live.version}` : `OK (${prev ?? 'external'} vs live ${live.version})`;
  console.log(`  ${u.pkg.padEnd(16)} ${u.repo.padEnd(32)} ${mark}`);
}

uni.liveUpstreamSyncedAt = new Date().toISOString();
writeFileSync(uniPath, JSON.stringify(uni, null, 2) + '\n', 'utf8');
writeFileSync(
  join(repoRoot, 'catalog', 'live-upstream-tracker.json'),
  JSON.stringify(
    {
      schema: 'awesome-os.live-upstream-tracker.v1',
      checkedAt: new Date().toISOString(),
      totalTracked: results.length,
      bumpedCount: results.filter((r) => r.bumped).length,
      libraries: results,
    },
    null,
    2,
  ) + '\n',
  'utf8',
);

console.log(`\n[LIVE UPSTREAM] Checked ${results.length} upstream repos, bumped ${results.filter((r) => r.bumped).length} packages in v11-package-universe.json.`);
