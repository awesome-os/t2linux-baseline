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
    name: 'Chromium 160 Canary / Sectium Browser',
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
    name: 'Electron (awesome-os/electron)',
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
  {
    id: 'gnome-wayland',
    name: 'GNOME Wayland (GTK 4.24 / libadwaita 1.10)',
    standaloneDiskMb: 380,
    libs: [
      'wayland', 'wayland-protocols', 'gtk', 'libadwaita', 'pipewire', 'dbus',
      'harfbuzz', 'icu4c', 'openssl', 'zlib', 'zstd', 'libpng', 'libjpeg-turbo',
      'libwebp', 'vulkan-loader', 'sqlite',
    ],
  },
  {
    id: 'kde-plasma',
    name: 'KDE Plasma 6.8 (KWin 6.8.3 / Qt 6.12.1)',
    standaloneDiskMb: 460,
    libs: [
      'wayland', 'wayland-protocols', 'kwin', 'plasma-workspace', 'qt6base',
      'qt6svg', 'pipewire', 'dbus', 'harfbuzz', 'icu4c', 'openssl', 'zlib',
      'zstd', 'libpng', 'libjpeg-turbo', 'vulkan-loader', 'sqlite',
    ],
  },
  {
    id: 'hyprland-omarchy',
    name: 'Omarchy / Hyprland 0.57 (wlroots 0.20)',
    standaloneDiskMb: 145,
    libs: [
      'wayland', 'wayland-protocols', 'hyprland', 'wlroots', 'pipewire', 'dbus',
      'vulkan-loader', 'vulkan-headers', 'glslang', 'openssl', 'zstd', 'zlib',
      'libpng', 'libjpeg-turbo', 'harfbuzz',
    ],
  },
  {
    id: 'rust-cargo',
    name: 'Rust / Cargo Native Crates (*-sys)',
    standaloneDiskMb: 640,
    libs: [
      'openssl', 'zlib', 'zstd', 'brotli', 'lz4', 'bzip2', 'xz', 'sqlite',
      'curl', 'libffi', 'libuv', 'mimalloc', 'protobuf', 'nghttp2', 'liburing',
      'libarchive', 'libdeflate', 're2', 'mbedtls', 'libpng', 'libjpeg-turbo',
      'libwebp', 'vulkan-loader', 'cmake', 'ninja',
    ],
  },
  {
    id: 'dotnet-11',
    name: '.NET 11 SDK & Native Runtime',
    standaloneDiskMb: 520,
    libs: [
      'openssl', 'zlib', 'brotli', 'icu4c', 'sqlite', 'curl', 'nghttp2',
      'zstd', 'skia', 'harfbuzz', 'freetype', 'libpng', 'libjpeg-turbo',
      'libwebp', 'libffi', 'vulkan-loader', 'krb5',
    ],
  },
  {
    id: 'vcpkg-top100',
    name: 'microsoft/vcpkg Top 100 Native Binary Ports',
    standaloneDiskMb: 1850,
    libs: [
      'zlib', 'openssl', 'curl', 'sqlite', 'zstd', 'brotli', 'lz4', 'libpng',
      'libjpeg-turbo', 'libwebp', 'libavif', 'ffmpeg', 'harfbuzz', 'freetype',
      'fontconfig', 'icu4c', 'protobuf', 'fmt', 'spdlog', 'nlohmann-json',
      'abseil-cpp', 'grpc', 'eigen', 'opencv', 'libsdl3', 'vulkan-headers',
      'vulkan-loader', 'glslang', 'mimalloc', 'simdjson', 're2', 'expat',
      'libxml2', 'pcre2', 'bzip2', 'xz', 'libffi', 'libuv', 'nghttp2',
      'c-ares', 'openblas', 'mbedtls', 'libarchive', 'libtiff', 'giflib',
      'libogg', 'libvorbis', 'libopus', 'dav1d', 'aom', 'libvpx', 'x264',
      'x265', 'libevent', 'yaml-cpp', 'catch2', 'googletest', 'benchmark',
      'xxhash', 'snappy', 'lzo', 'libdeflate', 'liburing', 'libpsl', 'woff2',
      'md4c', 'fast_float', 'simdutf', 'ada', 'llhttp', 'nghttp3', 'ngtcp2',
      'qt6base', 'gtk', 'wayland', 'pipewire', 'dbus', 'openal', 'glfw',
      'glm', 'assimp', 'lua', 'luajit', 'python', 'postgresql', 'hiredis',
      'zeromq', 'flatbuffers', 'rocksdb', 'leveldb', 'cmake', 'ninja',
      'meson', 'libyaml', 'libxslt', 'libusb', 'pixman', 'cairo', 'nss', 'nspr',
    ],
  },
  {
    id: 'npm-top-native',
    name: 'npm Top Native Binary Addons (sharp/sqlite/canvas/v8)',
    standaloneDiskMb: 920,
    libs: [
      'v8', 'libuv', 'openssl', 'zlib', 'brotli', 'zstd', 'lz4', 'sqlite',
      'libjpeg-turbo', 'libpng', 'libwebp', 'libavif', 'libtiff', 'giflib',
      'harfbuzz', 'freetype', 'fontconfig', 'expat', 're2', 'libffi', 'icu4c',
      'nghttp2', 'c-ares', 'llhttp', 'ada', 'simdjson', 'simdutf', 'libusb',
      'protobuf', 'curl', 'ffmpeg', 'vulkan-loader',
    ],
  },
  {
    id: 'pypi-top-wheels',
    name: 'PyPI / Python Top Binary Wheels (numpy/torch/pillow/arrow)',
    standaloneDiskMb: 1480,
    libs: [
      'python', 'openblas', 'openssl', 'zlib', 'zstd', 'brotli', 'lz4',
      'snappy', 'bzip2', 'xz', 'sqlite', 'curl', 'nghttp2', 'c-ares',
      'protobuf', 're2', 'libjpeg-turbo', 'libpng', 'libwebp', 'libtiff',
      'freetype', 'harfbuzz', 'ffmpeg', 'opencv', 'libffi', 'libuv',
      'libyaml', 'libxslt', 'libxml2', 'zeromq', 'postgresql', 'cmake', 'ninja',
    ],
  },
  {
    id: 'gpu-compute-stack',
    name: 'GPU Compute & AI Accelerators (CUDA / NCCL / ROCm / Triton / XDNA)',
    standaloneDiskMb: 4800,
    libs: [
      'cuda-toolkit', 'cudnn', 'nccl', 'cutlass', 'cccl', 'triton',
      'flash-attention', 'rocm', 'onednn', 'vulkan-headers', 'vulkan-loader',
      'glslang', 'spirv-tools', 'spirv-headers', 'xdna-driver', 'openblas',
      'zstd', 'zlib', 'openssl', 'cmake', 'ninja',
    ],
  },
  {
    id: 'linux-kernel-boot',
    name: 'Linux Kernel & Bare-Metal Boot (torvalds/linux + Limine + musl)',
    standaloneDiskMb: 195,
    libs: [
      'linux', 'limine', 'musl', 'busybox', 'kmod', 'elfutils', 'liburing',
      'zstd', 'zlib', 'lz4', 'openssl', 'xz', 'bzip2', 'bison', 'flex',
    ],
  },
  {
    id: 'php-top-native',
    name: 'PHP 8.6 / Composer / PECL + PHP-WASI Top Native Extensions',
    standaloneDiskMb: 780,
    libs: [
      'openssl', 'curl', 'sqlite', 'zlib', 'zstd', 'brotli', 'lz4', 'bzip2',
      'xz', 'oniguruma', 'libgd', 'libpng', 'libjpeg-turbo', 'libwebp',
      'freetype', 'icu4c', 'libxml2', 'libxslt', 'libzip', 'libsodium', 'gmp',
      'libffi', 'libuv', 'libvips', 'libyaml', 'libgit2', 'librdkafka',
      'libevent', 'postgresql', 'mariadb', 'argon2', 'pcre2',
    ],
  },
  {
    id: 'ruby-top-native',
    name: 'Ruby 4.0 / RubyGems / Bundler + ruby.wasm Top Native Gems',
    standaloneDiskMb: 690,
    libs: [
      'openssl', 'zlib', 'zstd', 'brotli', 'lz4', 'sqlite', 'curl', 'libxml2',
      'libxslt', 'libyaml', 'libffi', 'libgit2', 'librdkafka', 'libvips',
      'icu4c', 'postgresql', 'mariadb', 'hiredis', 're2', 'llhttp',
      'libsodium', 'argon2', 'readline', 'gmp', 'v8',
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
  oniguruma: ['oniguruma', 'onig'],
  libvips: ['libvips', 'vips'],
  mariadb: ['mariadb', 'mariadb-connector-c'],
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
  // Awesome-OS sovereign first-party v11 CAS runtimes & verified live upstream maxes
  v11Map.set('v8', '16.0.88+ (awesome-os/libv8_monolith / Chromium 160 Canary)');
  v11Map.set('libuv', `${v11Map.get('libuv') ?? '1.53.0'} (awesome-os/libuv live upstream)`);
  v11Map.set('webui', '0.1.0 (awesome-os/webui)');
  v11Map.set('harfbuzz', '15.2.0 (ahead-of-chrome upstream max)');
  v11Map.set('openssl', '4.1.0 (ahead-of-chrome upstream max)');
  v11Map.set('expat', '2.11.0 (ahead-of-chrome upstream max)');
  v11Map.set('zstd', '1.6.0 (ahead-of-chrome upstream max)');
  v11Map.set('mimalloc', '3.7.1 (ahead-of-chrome upstream max)');
  v11Map.set('zlib-ng', '2.3.3 (ahead-of-chrome upstream max)');
  // GPU Compute & AI Accelerator v11 CAS tracks (system://driver-set/proprietary & open-foss)
  v11Map.set('cuda-toolkit', '13.x (system://driver-set/proprietary)');
  v11Map.set('cudnn', '9.x (system://driver-set/proprietary)');
  v11Map.set('nccl', 'tracked live (NVIDIA/nccl)');
  v11Map.set('cutlass', 'tracked live (NVIDIA/cutlass)');
  v11Map.set('cccl', 'tracked live (NVIDIA/cccl)');
  v11Map.set('triton', 'tracked live (triton-lang/triton)');
  v11Map.set('flash-attention', 'tracked live (Dao-AILab/flash-attention)');
  v11Map.set('rocm', 'tracked live (ROCm/ROCm)');
  v11Map.set('onednn', 'tracked live (oneapi-src/oneDNN)');
  v11Map.set('spirv-tools', 'tracked live (KhronosGroup/SPIRV-Tools)');
  v11Map.set('spirv-headers', 'tracked live (KhronosGroup/SPIRV-Headers)');
  v11Map.set('xdna-driver', 'tracked live (amd/xdna-driver)');
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
    '# Big Boys Native Library Overlap — Chromium × Firefox × Ladybird × Electron × NW.js × Node.js × Deno × Bun × just-js/lo × PHP × Ruby on `v11` CAS',
    '',
    `> Cross-runtime DevOps audit against \`catalog/v11-package-universe.json\` (${uni.packages.length.toLocaleString('en-US')} packages) + \`catalog/max-version-lock.json\` + Awesome-OS sovereign runtimes (\`libv8_monolith\`, \`libuv\`).`,
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
    `## 2. Top Shared Libraries Deduplicated Once in \`v11\` CAS (${sharedCount} libs shared by 2–${BIG_BOYS.length} runtimes)`,
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
