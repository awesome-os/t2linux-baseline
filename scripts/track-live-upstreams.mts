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
  // Core Runtimes, Async I/O, Crypto & Compression
  { pkg: 'libuv', repo: 'libuv/libuv' },
  { pkg: 'openssl', repo: 'openssl/openssl' },
  { pkg: 'mbedtls', repo: 'Mbed-TLS/mbedtls' },
  { pkg: 'zstd', repo: 'facebook/zstd' },
  { pkg: 'zlib', repo: 'madler/zlib' },
  { pkg: 'zlib-ng', repo: 'zlib-ng/zlib-ng' },
  { pkg: 'brotli', repo: 'google/brotli' },
  { pkg: 'lz4', repo: 'lz4/lz4' },
  { pkg: 'libdeflate', repo: 'ebiggers/libdeflate' },
  { pkg: 'libarchive', repo: 'libarchive/libarchive' },
  { pkg: 'mimalloc', repo: 'microsoft/mimalloc' },
  { pkg: 'liburing', repo: 'axboe/liburing' },
  { pkg: 'libffi', repo: 'libffi/libffi' },
  // Networking, URL, Parsing & Data
  { pkg: 'curl', repo: 'curl/curl' },
  { pkg: 'nghttp2', repo: 'nghttp2/nghttp2' },
  { pkg: 'nghttp3', repo: 'ngtcp2/nghttp3' },
  { pkg: 'ngtcp2', repo: 'ngtcp2/ngtcp2' },
  { pkg: 'c-ares', repo: 'c-ares/c-ares' },
  { pkg: 'llhttp', repo: 'nodejs/llhttp' },
  { pkg: 'ada', repo: 'ada-url/ada' },
  { pkg: 'expat', repo: 'libexpat/libexpat' },
  { pkg: 'simdjson', repo: 'simdjson/simdjson' },
  { pkg: 'simdutf', repo: 'simdutf/simdutf' },
  { pkg: 'fast_float', repo: 'fastfloat/fast_float' },
  { pkg: 're2', repo: 'google/re2' },
  { pkg: 'md4c', repo: 'mity/md4c' },
  { pkg: 'protobuf', repo: 'protocolbuffers/protobuf' },
  { pkg: 'icu4c', repo: 'unicode-org/icu' },
  { pkg: 'sqlite', repo: 'sqlite/sqlite' },
  // Graphics, Fonts, Media & GPU (Browsers + Desktop + Colibri)
  { pkg: 'harfbuzz', repo: 'harfbuzz/harfbuzz' },
  { pkg: 'woff2', repo: 'google/woff2' },
  { pkg: 'vulkan-headers', repo: 'KhronosGroup/Vulkan-Headers' },
  { pkg: 'vulkan-loader', repo: 'KhronosGroup/Vulkan-Loader' },
  { pkg: 'glslang', repo: 'KhronosGroup/glslang' },
  { pkg: 'libsdl3', repo: 'libsdl-org/SDL' },
  { pkg: 'libpng', repo: 'pnggroup/libpng' },
  { pkg: 'libjpeg-turbo', repo: 'libjpeg-turbo/libjpeg-turbo' },
  { pkg: 'libwebp', repo: 'webmproject/libwebp' },
  { pkg: 'libavif', repo: 'AOMediaCodec/libavif' },
  { pkg: 'dav1d', repo: 'videolan/dav1d' },
  { pkg: 'ffmpeg', repo: 'FFmpeg/FFmpeg' },
  // AI/Math & Build Toolchains
  { pkg: 'openblas', repo: 'OpenMathLib/OpenBLAS' },
  { pkg: 'cmake', repo: 'Kitware/CMake' },
  { pkg: 'ninja', repo: 'ninja-build/ninja' },
  { pkg: 'meson', repo: 'mesonbuild/meson' },
];

function normalizeTag(raw: string): string {
  const s = raw.trim();
  // Handle tags like "v1.53.0", "openssl-4.1.0", "curl-8_23_0", "R_2_11_0", "vulkan-sdk-1.4.369.0", "liburing-2.14"
  const m = s.match(/(\d+[._]\d+(?:[._]\d+){0,2})/);
  if (!m) return s;
  return m[1].replace(/_/g, '.');
}

function fetchLatestGithubVersion(repo: string): { tag: string; version: string } | null {
  const candidates: Array<{ tag: string; version: string }> = [];
  try {
    const out = execFileSync('gh', ['api', `repos/${repo}/releases/latest`, '--jq', '.tag_name'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (out) candidates.push({ tag: out, version: normalizeTag(out) });
  } catch {
    // ignore
  }
  try {
    const out = execFileSync('gh', ['api', `repos/${repo}/tags?per_page=10`, '--jq', '.[].name'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    for (const line of out.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || /rc|alpha|beta|pre|dev/i.test(t)) continue;
      const v = normalizeTag(t);
      if (/^\d+\.\d+/.test(v)) candidates.push({ tag: t, version: v });
    }
  } catch {
    // ignore
  }
  // For KhronosGroup Vulkan repos, also check weekly v1.* spec tags directly
  if (repo.startsWith('KhronosGroup/Vulkan-')) {
    try {
      const out = execFileSync('gh', ['api', `repos/${repo}/git/matching-refs/tags/v1.`, '--jq', '.[-5:][].ref'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();
      for (const line of out.split(/\r?\n/)) {
        const t = line.replace('refs/tags/', '').trim();
        if (!t) continue;
        const v = normalizeTag(t);
        if (/^\d+\.\d+/.test(v)) candidates.push({ tag: t, version: v });
      }
    } catch {
      // ignore
    }
  }
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => compareVersions(b.version, a.version));
  return candidates[0];
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
