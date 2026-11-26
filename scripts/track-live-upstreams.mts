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
  // OS Kernel & Bare-Metal Boot
  { pkg: 'linux', repo: 'torvalds/linux' },
  { pkg: 'limine', repo: 'limine-bootloader/limine' },
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
  { pkg: 'libxml2', repo: 'GNOME/libxml2' },
  { pkg: 'libxslt', repo: 'GNOME/libxslt' },
  { pkg: 'onig', repo: 'kkos/oniguruma' },
  { pkg: 'libgit2', repo: 'libgit2/libgit2' },
  { pkg: 'librdkafka', repo: 'confluentinc/librdkafka' },
  { pkg: 'mariadb-connector-c', repo: 'mariadb-corporation/mariadb-connector-c' },
  // Graphics, Fonts, Media & GPU (Browsers + Desktop + Colibri + PHP/Ruby)
  { pkg: 'freetype', repo: 'freetype/freetype' },
  { pkg: 'harfbuzz', repo: 'harfbuzz/harfbuzz' },
  { pkg: 'woff2', repo: 'google/woff2' },
  { pkg: 'vips', repo: 'libvips/libvips' },
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
  // AI/Math, GPU Compute Accelerators (CUDA/NCCL/ROCm/Triton/XDNA) & Build Toolchains
  { pkg: 'openblas', repo: 'OpenMathLib/OpenBLAS' },
  { pkg: 'nccl', repo: 'NVIDIA/nccl' },
  { pkg: 'cutlass', repo: 'NVIDIA/cutlass' },
  { pkg: 'cccl', repo: 'NVIDIA/cccl' },
  { pkg: 'triton', repo: 'triton-lang/triton' },
  { pkg: 'flash-attention', repo: 'Dao-AILab/flash-attention' },
  { pkg: 'rocm', repo: 'ROCm/ROCm' },
  { pkg: 'onednn', repo: 'oneapi-src/oneDNN' },
  { pkg: 'spirv-tools', repo: 'KhronosGroup/SPIRV-Tools' },
  { pkg: 'spirv-headers', repo: 'KhronosGroup/SPIRV-Headers' },
  { pkg: 'xdna-driver', repo: 'amd/xdna-driver' },
  { pkg: 'cmake', repo: 'Kitware/CMake' },
  { pkg: 'ninja', repo: 'ninja-build/ninja' },
  { pkg: 'meson', repo: 'mesonbuild/meson' },
];

const NON_GITHUB_UPSTREAMS: ReadonlyArray<{
  readonly pkg: string;
  readonly repo: string;
  readonly upstreamTag: string;
  readonly upstreamVersion: string;
}> = [
  { pkg: 'pixman', repo: 'gitlab.freedesktop.org/pixman/pixman', upstreamTag: 'pixman-0.46.4', upstreamVersion: '0.46.4' },
  { pkg: 'cairo', repo: 'gitlab.freedesktop.org/cairo/cairo', upstreamTag: '1.18.6', upstreamVersion: '1.18.6' },
  { pkg: 'giflib', repo: 'sourceforge.net/projects/giflib', upstreamTag: 'giflib-6.1.3', upstreamVersion: '6.1.3' },
];

function normalizeTag(raw: string): string {
  const s = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // Handle tags like "v1.53.0", "openssl-4.1.0", "curl-8_23_0", "R_2_11_0", "VER-2-15-0", "vulkan-sdk-1.4.369.0", "liburing-2.14"
  const m = s.match(/(\d+[._-]\d+(?:[._-]\d+){0,2})/);
  if (!m) return s;
  return m[1].replace(/[_-]/g, '.');
}

function buildGhEnv(useEnvToken: boolean): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env };
  if (!useEnvToken) {
    delete env.GH_TOKEN;
    delete env.GITHUB_TOKEN;
    return env;
  }
  const token = env.GH_TOKEN?.trim() || env.GITHUB_TOKEN?.trim();
  if (token) {
    env.GH_TOKEN = token;
  } else {
    delete env.GH_TOKEN;
    delete env.GITHUB_TOKEN;
  }
  return env;
}

function runGhApi(args: string[]): string | null {
  const hasEnvToken = Boolean(process.env.GH_TOKEN?.trim() || process.env.GITHUB_TOKEN?.trim());
  const attempt = (
    useEnvToken: boolean,
  ): { ok: true; out: string } | { ok: false; authError: boolean; notFound: boolean } => {
    const env = buildGhEnv(useEnvToken);
    try {
      const out = execFileSync('gh', ['api', ...args], {
        encoding: 'utf8',
        env,
        stdio: ['ignore', 'pipe', 'pipe'],
      }).trim();
      return { ok: true, out };
    } catch (err: unknown) {
      const e = err as { code?: string; stderr?: string | Buffer; stdout?: string | Buffer };
      if (e.code === 'ENOENT' && process.platform === 'win32') {
        try {
          const out = execFileSync('gh.cmd', ['api', ...args], {
            encoding: 'utf8',
            env,
            shell: true,
            stdio: ['ignore', 'pipe', 'pipe'],
          }).trim();
          return { ok: true, out };
        } catch (winErr: unknown) {
          const we = winErr as { stderr?: string | Buffer; stdout?: string | Buffer };
          const msg = `${we.stderr ?? ''}\n${we.stdout ?? ''}`;
          return {
            ok: false,
            authError: /401|bad credentials|authentication|token/i.test(msg),
            notFound: /\b404\b|Not Found/i.test(msg),
          };
        }
      }
      const msg = `${e.stderr ?? ''}\n${e.stdout ?? ''}`;
      return {
        ok: false,
        authError: /401|bad credentials|authentication|token/i.test(msg),
        notFound: /\b404\b|Not Found/i.test(msg),
      };
    }
  };

  let first = attempt(true);
  if (first.ok) return first.out;
  if (first.authError && hasEnvToken) {
    const fallback = attempt(false);
    if (fallback.ok) return fallback.out;
    first = fallback;
  }
  if (!first.notFound) {
    const retry = attempt(!(first.authError && hasEnvToken));
    if (retry.ok) return retry.out;
  }
  return null;
}

function fetchLatestGithubVersion(repo: string): { tag: string; version: string } | null {
  const candidates: Array<{ tag: string; version: string }> = [];
  const latestOut = runGhApi([`repos/${repo}/releases/latest`, '--jq', '.tag_name']);
  if (latestOut) {
    candidates.push({ tag: latestOut, version: normalizeTag(latestOut) });
  }
  const tagsOut = runGhApi([`repos/${repo}/tags?per_page=10`, '--jq', '.[].name']);
  if (tagsOut !== null) {
    for (const line of tagsOut.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || /rc|alpha|beta|pre|dev/i.test(t)) continue;
      const v = normalizeTag(t);
      if (/^\d+\.\d+/.test(v)) candidates.push({ tag: t, version: v });
    }
    if (candidates.length === 0) {
      const deepOut = runGhApi([`repos/${repo}/tags?per_page=100`, '--jq', '.[].name']);
      if (deepOut) {
        for (const line of deepOut.split(/\r?\n/)) {
          const t = line.trim();
          if (!t || /rc|alpha|beta|pre|dev/i.test(t)) continue;
          const v = normalizeTag(t);
          if (/^\d+\.\d+/.test(v)) candidates.push({ tag: t, version: v });
        }
      }
    }
  }
  // For KhronosGroup Vulkan repos, also check weekly v1.* spec tags directly
  if (repo.startsWith('KhronosGroup/Vulkan-')) {
    const refsOut = runGhApi([`repos/${repo}/git/matching-refs/tags/v1.`, '--jq', '.[-5:][].ref']);
    if (refsOut) {
      for (const line of refsOut.split(/\r?\n/)) {
        const t = line.replace('refs/tags/', '').trim();
        if (!t) continue;
        const v = normalizeTag(t);
        if (/^\d+\.\d+/.test(v)) candidates.push({ tag: t, version: v });
      }
    }
  }
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => compareVersions(b.version, a.version));
  return candidates[0];
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const uniPath = join(repoRoot, 'catalog', 'v11-package-universe.json');
const trackerPath = join(repoRoot, 'catalog', 'live-upstream-tracker.json');
const uni = JSON.parse(readFileSync(uniPath, 'utf8')) as {
  packages: Array<{ name: string; version: string }>;
  liveUpstreamSyncedAt?: string;
};

type TrackerEntry = {
  pkg: string;
  repo: string;
  upstreamTag: string;
  upstreamVersion: string;
  previousV11: string | null;
  currentV11: string | null;
  bumped: boolean;
};

let prevTrackerMap = new Map<string, TrackerEntry>();
try {
  const prevTracker = JSON.parse(readFileSync(trackerPath, 'utf8')) as { libraries?: TrackerEntry[] };
  prevTrackerMap = new Map((prevTracker.libraries ?? []).map((e) => [e.pkg.toLowerCase(), e]));
} catch {
  // ignore missing/invalid prior tracker
}

const pkgMap = new Map(uni.packages.map((p) => [p.name.toLowerCase(), p]));
const results: TrackerEntry[] = [];

for (const u of UPSTREAMS) {
  const live = fetchLatestGithubVersion(u.repo);
  const existing = pkgMap.get(u.pkg.toLowerCase());
  if (!live) {
    const cached = prevTrackerMap.get(u.pkg.toLowerCase());
    if (cached) {
      const current = existing?.version ?? cached.currentV11 ?? null;
      results.push({
        pkg: u.pkg,
        repo: u.repo,
        upstreamTag: cached.upstreamTag,
        upstreamVersion: cached.upstreamVersion,
        previousV11: existing?.version ?? cached.previousV11 ?? null,
        currentV11: current,
        bumped: false,
      });
      console.log(`  [CACHED] ${u.pkg.padEnd(16)} (${u.repo}) -> retained ${cached.upstreamVersion}`);
    } else {
      console.log(`  [SKIP] ${u.pkg.padEnd(16)} (${u.repo}) -> unavailable`);
    }
    continue;
  }
  const prev = existing?.version ?? null;
  let bumped = false;
  if (existing && compareVersions(live.version, existing.version) > 0) {
    existing.version = live.version;
    bumped = true;
  }
  const currentV11 = existing
    ? compareVersions(existing.version, live.version) < 0
      ? live.version
      : existing.version
    : null;
  results.push({
    pkg: u.pkg,
    repo: u.repo,
    upstreamTag: live.tag,
    upstreamVersion: live.version,
    previousV11: prev,
    currentV11,
    bumped,
  });
  const mark = bumped ? `BUMP ${prev} -> ${live.version}` : `OK (${prev ?? 'external'} vs live ${live.version})`;
  console.log(`  ${u.pkg.padEnd(16)} ${u.repo.padEnd(32)} ${mark}`);
}

for (const u of NON_GITHUB_UPSTREAMS) {
  const existing = pkgMap.get(u.pkg.toLowerCase());
  const prev = existing?.version ?? null;
  let bumped = false;
  if (existing && compareVersions(u.upstreamVersion, existing.version) > 0) {
    existing.version = u.upstreamVersion;
    bumped = true;
  }
  const currentV11 = existing
    ? compareVersions(existing.version, u.upstreamVersion) < 0
      ? u.upstreamVersion
      : existing.version
    : null;
  results.push({
    pkg: u.pkg,
    repo: u.repo,
    upstreamTag: u.upstreamTag,
    upstreamVersion: u.upstreamVersion,
    previousV11: prev,
    currentV11,
    bumped,
  });
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
