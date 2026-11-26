# Big Boys Native Library Overlap — Chromium × Firefox × Ladybird × Electron × NW.js × Node.js × Deno × Bun × just-js/lo on `v11` CAS

> Cross-runtime DevOps audit against `catalog/v11-package-universe.json` (5,070 packages) + `catalog/max-version-lock.json` + Awesome-OS sovereign runtimes (`libv8_monolith`, `libuv`).

## 1. Per-Runtime `v11` CAS Coverage

| Runtime | Core Native Libs | Covered in `v11` CAS | Coverage | Missing / Custom |
| :--- | ---: | ---: | ---: | :--- |
| **Chromium / Sectium Browser** | 27 | 26 | **96.3%** | `libxml2` |
| **Firefox (Gecko / SpiderMonkey)** | 24 | 22 | **91.7%** | `pixman`, `cairo` |
| **Electron (awesome-os/sectium-electron)** | 20 | 20 | **100%** | _(0 — 100% covered)_ |
| **NW.js (holo-display-nwjs)** | 18 | 18 | **100%** | _(0 — 100% covered)_ |
| **Node.js** | 16 | 15 | **93.8%** | `ngtcp2` |
| **Deno** | 10 | 10 | **100%** | _(0 — 100% covered)_ |
| **Bun** | 12 | 12 | **100%** | _(0 — 100% covered)_ |
| **Ladybird (awesome-os/ladybird)** | 23 | 23 | **100%** | _(0 — 100% covered)_ |
| **just-js/lo (lo/lib/*)** | 19 | 19 | **100%** | _(0 — 100% covered)_ |

## 2. Top Shared Libraries Deduplicated Once in `v11` CAS (33 libs shared by 2–5 runtimes)

| Library | Shared By | Runtimes | Pinned Max Version (`v11`) |
| :--- | ---: | :--- | :--- |
| `sqlite` | 9/9 | chromium, firefox, electron, nwjs, nodejs, deno, bun, ladybird, lo | `3.54.1` |
| `zlib` | 9/9 | chromium, firefox, electron, nwjs, nodejs, deno, bun, ladybird, lo | `1.4` |
| `brotli` | 8/9 | chromium, firefox, electron, nwjs, nodejs, deno, bun, ladybird | `1.2.1` |
| `icu4c` | 8/9 | chromium, firefox, electron, nwjs, nodejs, deno, bun, ladybird | `79.1` |
| `openssl` | 8/9 | chromium, electron, nwjs, nodejs, deno, bun, ladybird, lo | `4.1.0 (ahead-of-chrome upstream max)` |
| `zstd` | 7/9 | chromium, firefox, electron, nwjs, nodejs, deno, bun | `1.6.0 (ahead-of-chrome upstream max)` |
| `nghttp2` | 6/9 | chromium, electron, nwjs, nodejs, bun, ladybird | `1.71.0` |
| `v8` | 6/9 | chromium, electron, nwjs, nodejs, deno, lo | `16.0.88 / latest (awesome-os/libv8_monolith)` |
| `vulkan-loader` | 6/9 | chromium, firefox, electron, nwjs, deno, ladybird | `1.4.369` |
| `dav1d` | 5/9 | chromium, firefox, electron, nwjs, ladybird | `1.5.5` |
| `ffmpeg` | 5/9 | chromium, firefox, electron, nwjs, ladybird | `9.1` |
| `libjpeg-turbo` | 5/9 | chromium, firefox, electron, nwjs, ladybird | `3.2.1` |
| `libpng` | 5/9 | chromium, firefox, electron, nwjs, ladybird | `1.6.59` |
| `libwebp` | 5/9 | chromium, firefox, electron, nwjs, ladybird | `1.6.0` |
| `simdutf` | 5/9 | electron, nodejs, bun, ladybird, lo | `9.5.0` |
| `libavif` | 4/9 | chromium, electron, nwjs, ladybird | `1.4.2` |
| `libuv` | 4/9 | electron, nwjs, nodejs, deno | `1.51.0 (awesome-os/libuv)` |
| `skia` | 4/9 | chromium, electron, nwjs, ladybird | `148` |
| `vulkan-headers` | 4/9 | chromium, electron, nwjs, ladybird | `1.4.369` |
| `curl` | 3/9 | chromium, ladybird, lo | `8.23.0` |
| `libffi` | 3/9 | firefox, deno, lo | `3.8.1` |
| `simdjson` | 3/9 | electron, nodejs, ladybird | `5.3.0` |
| `ada` | 2/9 | nodejs, lo | `4.1.1 (ahead-of-chrome upstream max)` |
| `aom` | 2/9 | chromium, firefox | `3.15.2` |
| `c-ares` | 2/9 | nodejs, bun | `1.34.9` |
| `expat` | 2/9 | chromium, firefox | `2.11.0 (ahead-of-chrome upstream max)` |
| `fontconfig` | 2/9 | chromium, firefox | `2.17.1` |
| `freetype` | 2/9 | chromium, firefox | `2.13.3` |
| `harfbuzz` | 2/9 | chromium, firefox | `15.2.0 (ahead-of-chrome upstream max)` |
| `libdeflate` | 2/9 | bun, lo | `1.26` |
| `libopus` | 2/9 | chromium, firefox | `1.6.1` |
| `libvpx` | 2/9 | chromium, firefox | `1.17.0` |
| `mimalloc` | 2/9 | bun, ladybird | `3.7.1 (ahead-of-chrome upstream max)` |
