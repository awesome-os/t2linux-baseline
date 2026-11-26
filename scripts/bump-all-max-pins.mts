#!/usr/bin/env node
/**
 * @file scripts/bump-all-max-pins.mts
 * @description Raises T2 SDE v11-package-universe.json entries to the verified
 * global max versions across Chromium, Firefox, Ladybird, Node/Deno/Bun/lo,
 * Colibri, llama.cpp, and vLLM.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compareVersions } from './generate-max-version-lock.mts';

interface V11Package {
  name: string;
  category: string;
  version: string;
  license: string;
  mode: string;
  tarballs: string[];
}

interface V11Universe {
  schema: string;
  abiMagic: string;
  casLayout: string;
  totalPackages: number;
  maxPinBumpedAt?: string;
  packages: V11Package[];
}

const GLOBAL_MAX_PINS: Readonly<Record<string, string>> = {
  // Ahead-of-Chrome & 9-runtime core maxes
  openssl: '4.1.0',
  harfbuzz: '15.2.0',
  expat: '2.11.0',
  zstd: '1.6.0',
  mimalloc: '3.7.1',
  'zlib-ng': '2.3.3',
  ada: '4.1.1',
  libuv: '1.51.0',
  curl: '8.23.0',
  dav1d: '1.5.5',
  ffmpeg: '9.1',
  fast_float: '8.4.0',
  brotli: '1.2.1',
  // AI / LLM stack (Colibri + llama.cpp + vLLM) maxes
  protobuf: '7.36.1',
  'vulkan-headers': '1.4.369',
  'vulkan-loader': '1.4.369',
  glslang: '16.2.0',
  cmake: '4.2.3',
  ninja: '1.13.2',
  liburing: '2.14',
  openblas: '0.3.31',
  sqlite: '3.51.2',
};

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const uniPath = join(repoRoot, 'catalog', 'v11-package-universe.json');
const uni = JSON.parse(readFileSync(uniPath, 'utf8')) as V11Universe;

const bumped: Array<{ name: string; from: string; to: string }> = [];

for (const pkg of uni.packages) {
  const key = pkg.name.toLowerCase();
  const target = GLOBAL_MAX_PINS[key];
  if (target && compareVersions(target, pkg.version) > 0) {
    bumped.push({ name: pkg.name, from: pkg.version, to: target });
    pkg.version = target;
  }
}

uni.maxPinBumpedAt = new Date().toISOString();
writeFileSync(uniPath, JSON.stringify(uni, null, 2) + '\n', 'utf8');

console.log(`[T2 MAX-PIN BUMP] Raised ${bumped.length} packages in v11-package-universe.json to global max:`);
for (const b of bumped) {
  console.log(`  - ${b.name}: ${b.from} -> ${b.to}`);
}
