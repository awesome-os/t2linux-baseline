# Big Boys Native Library Overlap — Chromium × Electron × NW.js × Node.js × Deno × Bun × Ladybird × just-js/lo on `v11` CAS

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
| **just-js/lo (lo/lib/*)** | 19 | 18 | **94.7%** | `ada` |

## 2. Top Shared Libraries Deduplicated Once in `v11` CAS (26 libs shared by 2–5 runtimes)

| Library | Shared By | Runtimes | Pinned Max Version (`v11`) |
| :--- | ---: | :--- | :--- |
| `openssl` | 8/8 | chromium, electron, nwjs, nodejs, deno, bun, ladybird, lo | `3.6.5` |
| `sqlite` | 8/8 | chromium, electron, nwjs, nodejs, deno, bun, ladybird, lo | `3.54.1` |
| `zlib` | 8/8 | chromium, electron, nwjs, nodejs, deno, bun, ladybird, lo | `1.4` |
| `brotli` | 7/8 | chromium, electron, nwjs, nodejs, deno, bun, ladybird | `1.2.1` |
| `icu4c` | 7/8 | chromium, electron, nwjs, nodejs, deno, bun, ladybird | `79.1` |
| `nghttp2` | 6/8 | chromium, electron, nwjs, nodejs, bun, ladybird | `1.71.0` |
| `v8` | 6/8 | chromium, electron, nwjs, nodejs, deno, lo | `15.8 (awesome-os/libv8_monolith)` |
| `zstd` | 6/8 | chromium, electron, nwjs, nodejs, deno, bun | `1.5.7` |
| `simdutf` | 5/8 | electron, nodejs, bun, ladybird, lo | `9.5.0` |
| `vulkan-loader` | 5/8 | chromium, electron, nwjs, deno, ladybird | `1.4.369` |
| `dav1d` | 4/8 | chromium, electron, nwjs, ladybird | `1.5.5` |
| `ffmpeg` | 4/8 | chromium, electron, nwjs, ladybird | `9.1` |
| `libavif` | 4/8 | chromium, electron, nwjs, ladybird | `1.4.2` |
| `libjpeg-turbo` | 4/8 | chromium, electron, nwjs, ladybird | `3.2.1` |
| `libpng` | 4/8 | chromium, electron, nwjs, ladybird | `1.6.59` |
| `libuv` | 4/8 | electron, nwjs, nodejs, deno | `1.51.0 (awesome-os/libuv)` |
| `libwebp` | 4/8 | chromium, electron, nwjs, ladybird | `1.6.0` |
| `skia` | 4/8 | chromium, electron, nwjs, ladybird | `148` |
| `vulkan-headers` | 4/8 | chromium, electron, nwjs, ladybird | `1.4.369` |
| `curl` | 3/8 | chromium, ladybird, lo | `8.23.0` |
| `simdjson` | 3/8 | electron, nodejs, ladybird | `5.3.0` |
| `ada` | 2/8 | nodejs, lo | `needs-pin` |
| `c-ares` | 2/8 | nodejs, bun | `1.34.9` |
| `libdeflate` | 2/8 | bun, lo | `1.26` |
| `libffi` | 2/8 | deno, lo | `3.8.1` |
| `mimalloc` | 2/8 | bun, ladybird | `3.7.0` |
