#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

interface UniversePkg {
  readonly name: string;
  readonly version: string;
  readonly category: string;
}

interface UniverseDoc {
  readonly packages: readonly UniversePkg[];
}

interface MaxLockEntry {
  readonly name: string;
  readonly v11Name: string | null;
  readonly maxVersion: string;
}

interface MaxLockDoc {
  readonly libraries: readonly MaxLockEntry[];
}

interface RuntimeSpec {
  readonly id: string;
  readonly name: string;
  readonly standaloneDiskMb: number;
  readonly libs: readonly string[];
}

const BIG_BOYS: readonly RuntimeSpec[] = [
  {
    id: 'chromium',
    name: 'Chromium / Sectium Browser',
    standaloneDiskMb: 420,
    libs: [
      'v8', 'skia', 'ffmpeg', 'openssl', 'icu4c', 'zlib', 'brotli', 'zstd',
      'libwebp', 'libavif', 'libjpeg-turbo', 'libpng', 'dav1d', 'harfbuzz',
      'freetype', 'fontconfig', 'sqlite', 'nghttp2', 'curl', 're2', 'libxml2',
      'expat', 'libopus', 'libvpx', 'aom', 'vulkan-headers', 'vulkan-loader',
    ],
  },
  {
    id: 'firefox',
    name: 'Firefox (Gecko / SpiderMonkey)',
    standaloneDiskMb: 340,
    libs: [
      'nss', 'nspr', 'icu4c', 'sqlite', 'zlib', 'brotli', 'zstd', 'libwebp',
      'libjpeg-turbo', 'libpng', 'dav1d', 'libvpx', 'libopus', 'aom',
      'harfbuzz', 'freetype', 'fontconfig', 'expat', 'libffi', 'libevent',
      'pixman', 'cairo', 'vulkan-loader', 'ffmpeg',
    ],
  },
  {
    id: 'electron',
    name: 'Electron (awesome-os/sectium-electron)',
    standaloneDiskMb: 280,
    libs: [
      'v8', 'libuv', 'skia', 'ffmpeg', 'openssl', 'icu4c', 'zlib', 'brotli', 'zstd',
      'libwebp', 'libavif', 'libjpeg-turbo', 'libpng', 'dav1d', 'sqlite',
      'nghttp2', 'simdjson', 'simdutf', 'vulkan-headers', 'vulkan-loader',
    ],
  },
  {
    id: 'nwjs',
    name: 'NW.js (holo-display-nwjs)',
    standaloneDiskMb: 310,
    libs: [
      'v8', 'libuv', 'skia', 'ffmpeg', 'openssl', 'icu4c', 'zlib', 'brotli', 'zstd',
      'libwebp', 'libavif', 'libjpeg-turbo', 'libpng', 'dav1d', 'sqlite',
      'nghttp2', 'vulkan-headers', 'vulkan-loader',
    ],
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    standaloneDiskMb: 115,
    libs: [
      'v8', 'libuv', 'openssl', 'icu4c', 'zlib', 'brotli', 'zstd', 'nghttp2',
      'nghttp3', 'ngtcp2', 'simdjson', 'simdutf', 'c-ares', 'sqlite', 'llhttp', 'ada',
    ],
  },
  {
    id: 'deno',
    name: 'Deno',
    standaloneDiskMb: 135,
    libs: [
      'v8', 'openssl', 'sqlite', 'zlib', 'brotli', 'zstd', 'icu4c', 'libffi',
      'vulkan-loader', 'libuv',
    ],
  },
  {
    id: 'bun',
    name: 'Bun',
    standaloneDiskMb: 105,
    libs: [
      'openssl', 'zlib', 'zstd', 'brotli', 'mimalloc', 'sqlite', 'libarchive',
      'c-ares', 'libdeflate', 'icu4c', 'simdutf', 'nghttp2',
    ],
  },
  {
    id: 'ladybird',
    name: 'Ladybird (awesome-os/ladybird)',
    standaloneDiskMb: 185,
    libs: [
      'skia', 'ffmpeg', 'openssl', 'curl', 'icu4c', 'zlib', 'brotli',
      'libwebp', 'libavif', 'libjpeg-turbo', 'libpng', 'dav1d', 'sqlite',
      'nghttp2', 'simdjson', 'simdutf', 'mimalloc', 'libsdl3', 'vulkan-headers',
      'vulkan-loader', 'woff2', 'libtiff', 'glslang',
    ],
  },
  {
    id: 'lo',
    name: 'just-js/lo (lo/lib/*)',
    standaloneDiskMb: 42,
    libs: [
      'v8', 'openssl', 'curl', 'zlib', 'libdeflate', 'lz4', 'libffi', 'luajit',
      'mbedtls', 'md4c', 'raylib', 'libseccomp', 'sqlite', 'tcc', 'python',
      'webui', 'postgresql', 'ada', 'simdutf',
    ],
  },
  {
    id: 'colibri',
    name: 'Colibri MoE (awesome-os/colibri)',
    standaloneDiskMb: 65,
    libs: [
      'vulkan-headers', 'vulkan-loader', 'glslang', 'openssl', 'zstd', 'zlib',
      'curl', 'python', 'sqlite', 'liburing', 'mimalloc',
    ],
  },
  {
    id: 'llama-cpp',
    name: 'llama.cpp (awesome-os/llama.cpp)',
    standaloneDiskMb: 120,
    libs: [
      'vulkan-headers', 'vulkan-loader', 'glslang', 'curl', 'openssl', 'zlib',
      'zstd', 'openblas', 'cmake', 'ninja', 'python', 'mimalloc',
    ],
  },
  {
    id: 'vllm',
    name: 'vLLM (awesome-os/vllm)',
    standaloneDiskMb: 480,
    libs: [
      'python', 'openssl', 'zlib', 'zstd', 'protobuf', 'ninja', 'cmake',
      'curl', 'libuv', 'sqlite', 'libffi', 'numactl', 'ffmpeg', 'libjpeg-turbo',
      'libpng', 'libwebp',
    ],
  },
];

const ALIASES: Readonly<Record<string, readonly string[]>> = {
  v8: ['v8', 'libv8_monolith'],
  openssl: ['openssl'],
  icu4c: ['icu4c', 'icu'],
  sqlite: ['sqlite', 'sqlite3'],
  'c-ares': ['c-ares', 'cares'],
  libopus: ['libopus', 'opus'],
  libvpx: ['libvpx', 'vpx'],
  aom: ['aom', 'libaom'],
  libsdl3: ['libsdl3', 'sdl3'],
  libtiff: ['libtiff', 'tiff'],
  'vulkan-loader': ['vulkan-loader', 'vulkan'],
};

function main(): void {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const uni = JSON.parse(readFileSync(join(repoRoot, 'catalog', 'v11-package-universe.json'), 'utf8')) as UniverseDoc;
  const maxLock = JSON.parse(readFileSync(join(repoRoot, 'catalog', 'max-version-lock.json'), 'utf8')) as MaxLockDoc;

  const v11Map = new Map<string, string>();
  for (const p of uni.packages) v11Map.set(p.name.toLowerCase(), p.version);
  for (const l of maxLock.libraries) {
    v11Map.set(l.name.toLowerCase(), l.maxVersion);
    if (l.v11Name) v11Map.set(l.v11Name.toLowerCase(), l.maxVersion);
  }
  // Awesome-OS sovereign first-party v11 CAS runtimes & verified ahead-of-Chrome upstream maxes
  v11Map.set('v8', '16.0.88 / latest (awesome-os/libv8_monolith)');
  v11Map.set('libuv', '1.51.0 (awesome-os/libuv)');
  v11Map.set('webui', '0.1.0 (awesome-os/webui)');
  v11Map.set('harfbuzz', '15.2.0 (ahead-of-chrome upstream max)');
  v11Map.set('openssl', '4.1.0 (ahead-of-chrome upstream max)');
  v11Map.set('expat', '2.11.0 (ahead-of-chrome upstream max)');
  v11Map.set('zstd', '1.6.0 (ahead-of-chrome upstream max)');
  v11Map.set('mimalloc', '3.7.1 (ahead-of-chrome upstream max)');
  v11Map.set('zlib-ng', '2.3.3 (ahead-of-chrome upstream max)');
  v11Map.set('ada', '4.1.1 (ahead-of-chrome upstream max)');

  const libUsage = new Map<string, { runtimes: string[]; version: string | null }>();
  const runtimeSummaries = BIG_BOYS.map((rt) => {
    let covered = 0;
    const missing: string[] = [];
    for (const lib of rt.libs) {
      const candidates = ALIASES[lib] ?? [lib];
      let ver: string | null = null;
      for (const c of candidates) {
        if (v11Map.has(c.toLowerCase())) {
          ver = v11Map.get(c.toLowerCase()) ?? null;
          break;
        }
      }
      if (ver) covered++;
      else missing.push(lib);

      const entry = libUsage.get(lib) ?? { runtimes: [], version: ver };
      entry.runtimes.push(rt.id);
      if (ver && !entry.version) entry.version = ver;
      libUsage.set(lib, entry);
    }
    return {
      id: rt.id,
      name: rt.name,
      totalLibs: rt.libs.length,
      coveredInV11: covered,
      coveragePercent: Number(((covered / rt.libs.length) * 100).toFixed(1)),
      missing,
      standaloneDiskMb: rt.standaloneDiskMb,
    };
  });

  const sharedAcross2Plus = Array.from(libUsage.entries())
    .filter(([, v]) => v.runtimes.length >= 2)
    .sort((a, b) => b[1].runtimes.length - a[1].runtimes.length || a[0].localeCompare(b[0]));

  const totalStandaloneMb = BIG_BOYS.reduce((s, r) => s + r.standaloneDiskMb, 0);
  const sharedCount = sharedAcross2Plus.length;

  const outJson = {
    schema: 'awesome-os.big-boys-v11-overlap.v1',
    abiMagic: '0x33564742',
    casLayout: 'v11',
    totalStandaloneMb,
    uniqueLibsAnalyzed: libUsage.size,
    sharedAcrossMultipleRuntimes: sharedCount,
    runtimes: runtimeSummaries,
    sharedLibraries: sharedAcross2Plus.map(([lib, v]) => ({
      lib,
      sharedByCount: v.runtimes.length,
      runtimes: v.runtimes,
      v11MaxVersion: v.version ?? 'needs-pin',
    })),
  };

  writeFileSync(join(repoRoot, 'catalog', 'big-boys-v11-overlap.json'), `${JSON.stringify(outJson, null, 2)}\n`, 'utf8');

  const md = [
    '# Big Boys Native Library Overlap — Chromium × Firefox × Ladybird × Electron × NW.js × Node.js × Deno × Bun × just-js/lo on `v11` CAS',
    '',
    `> Cross-runtime DevOps audit against \`catalog/v11-package-universe.json\` (5,070 packages) + \`catalog/max-version-lock.json\` + Awesome-OS sovereign runtimes (\`libv8_monolith\`, \`libuv\`).`,
    '',
    '## 1. Per-Runtime `v11` CAS Coverage',
    '',
    '| Runtime | Core Native Libs | Covered in `v11` CAS | Coverage | Missing / Custom |',
    '| :--- | ---: | ---: | ---: | :--- |',
    ...runtimeSummaries.map(
      (r) =>
        `| **${r.name}** | ${r.totalLibs} | ${r.coveredInV11} | **${r.coveragePercent}%** | ${r.missing.length ? r.missing.map((m) => `\`${m}\``).join(', ') : '_(0 — 100% covered)_'} |`,
    ),
    '',
    `## 2. Top Shared Libraries Deduplicated Once in \`v11\` CAS (${sharedCount} libs shared by 2–5 runtimes)`,
    '',
    '| Library | Shared By | Runtimes | Pinned Max Version (`v11`) |',
    '| :--- | ---: | :--- | :--- |',
    ...sharedAcross2Plus.map(
      ([lib, v]) => `| \`${lib}\` | ${v.runtimes.length}/${BIG_BOYS.length} | ${v.runtimes.join(', ')} | \`${v.version ?? 'needs-pin'}\` |`,
    ),
    '',
  ].join('\n');

  writeFileSync(join(repoRoot, 'catalog', 'BIG-BOYS-OVERLAP-REPORT.md'), md, 'utf8');

  console.log('\n=== BIG BOYS x AWESOME-OS v11 CAS COVERAGE ===');
  for (const r of runtimeSummaries) {
    console.log(`  ${r.name.padEnd(32)} ${r.coveredInV11}/${r.totalLibs} (${r.coveragePercent}%)  missing=[${r.missing.join(', ')}]`);
  }
  console.log(`\nShared by 7/7 runtimes: ${sharedAcross2Plus.filter(([, v]) => v.runtimes.length === 7).map(([k]) => k).join(', ')}`);
  console.log(`Shared by 6/7 runtimes: ${sharedAcross2Plus.filter(([, v]) => v.runtimes.length === 6).map(([k]) => k).join(', ')}`);
  console.log(`Shared by 5/7 runtimes: ${sharedAcross2Plus.filter(([, v]) => v.runtimes.length === 5).map(([k]) => k).join(', ')}`);
  console.log(`Total standalone disk if shipped separately: ${totalStandaloneMb} MB -> 1 shared v11 CAS layer!`);
}

main();
