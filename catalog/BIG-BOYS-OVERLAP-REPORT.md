# Big Boys Native Library Overlap — Chromium × Electron × NW.js × Node.js × Deno × Bun × Ladybird on `v11` CAS

> Cross-runtime DevOps audit against `catalog/v11-package-universe.json` (5,070 packages) + `catalog/max-version-lock.json` + Awesome-OS sovereign runtimes (`libv8_monolith`, `libuv`).

## 1. Per-Runtime `v11` CAS Coverage

| Runtime | Core Native Libs | Covered in `v11` CAS | Coverage | Missing / Custom |
| :--- | ---: | ---: | ---: | :--- |
| **Chromium / Sectium Browser** | 27 | 26 | **96.3%** | `libxml2` |
| **Electron (awesome-os/sectium-electron)** | 20 | 20 | **100%** | _(0 — 100% covered)_ |
| **NW.js (holo-display-nwjs)** | 18 | 18 | **100%** | _(0 — 100% covered)_ |
| **Node.js** | 16 | 14 | **87.5%** | `ngtcp2`, `ada` |
| **Deno** | 10 | 10 | **100%** | _(0 — 100% covered)_ |
| **Bun** | 12 | 12 | **100%** | _(0 — 100% covered)_ |
| **Ladybird (awesome-os/ladybird)** | 23 | 23 | **100%** | _(0 — 100% covered)_ |

## 2. Top Shared Libraries Deduplicated Once in `v11` CAS (23 libs shared by 2–5 runtimes)

| Library | Shared By | Runtimes | Pinned Max Version (`v11`) |
| :--- | ---: | :--- | :--- |
| `brotli` | 7/7 | chromium, electron, nwjs, nodejs, deno, bun, ladybird | `1.2.1` |
| `icu4c` | 7/7 | chromium, electron, nwjs, nodejs, deno, bun, ladybird | `79.1` |
| `openssl` | 7/7 | chromium, electron, nwjs, nodejs, deno, bun, ladybird | `3.6.5` |
| `sqlite` | 7/7 | chromium, electron, nwjs, nodejs, deno, bun, ladybird | `3.54.1` |
| `zlib` | 7/7 | chromium, electron, nwjs, nodejs, deno, bun, ladybird | `1.4` |
| `nghttp2` | 6/7 | chromium, electron, nwjs, nodejs, bun, ladybird | `1.71.0` |
| `zstd` | 6/7 | chromium, electron, nwjs, nodejs, deno, bun | `1.5.7` |
| `v8` | 5/7 | chromium, electron, nwjs, nodejs, deno | `15.8 (awesome-os/libv8_monolith)` |
| `vulkan-loader` | 5/7 | chromium, electron, nwjs, deno, ladybird | `1.4.369` |
| `dav1d` | 4/7 | chromium, electron, nwjs, ladybird | `1.5.5` |
| `ffmpeg` | 4/7 | chromium, electron, nwjs, ladybird | `9.1` |
| `libavif` | 4/7 | chromium, electron, nwjs, ladybird | `1.4.2` |
| `libjpeg-turbo` | 4/7 | chromium, electron, nwjs, ladybird | `3.2.1` |
| `libpng` | 4/7 | chromium, electron, nwjs, ladybird | `1.6.59` |
| `libuv` | 4/7 | electron, nwjs, nodejs, deno | `1.51.0 (awesome-os/libuv)` |
| `libwebp` | 4/7 | chromium, electron, nwjs, ladybird | `1.6.0` |
| `simdutf` | 4/7 | electron, nodejs, bun, ladybird | `9.5.0` |
| `skia` | 4/7 | chromium, electron, nwjs, ladybird | `148` |
| `vulkan-headers` | 4/7 | chromium, electron, nwjs, ladybird | `1.4.369` |
| `simdjson` | 3/7 | electron, nodejs, ladybird | `5.3.0` |
| `c-ares` | 2/7 | nodejs, bun | `1.34.9` |
| `curl` | 2/7 | chromium, ladybird | `8.23.0` |
| `mimalloc` | 2/7 | bun, ladybird | `3.7.0` |
