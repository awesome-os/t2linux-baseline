# Big Boys Native Library Overlap — Chromium × Firefox × Ladybird × Electron × NW.js × Node.js × Deno × Bun × just-js/lo on `v11` CAS

> Cross-runtime DevOps audit against `catalog/v11-package-universe.json` (5,070 packages) + `catalog/max-version-lock.json` + Awesome-OS sovereign runtimes (`libv8_monolith`, `libuv`).

## 1. Per-Runtime `v11` CAS Coverage

| Runtime | Core Native Libs | Covered in `v11` CAS | Coverage | Missing / Custom |
| :--- | ---: | ---: | ---: | :--- |
| **Chromium 160 Canary / Sectium Browser** | 27 | 26 | **96.3%** | `libxml2` |
| **Firefox (Gecko / SpiderMonkey)** | 24 | 22 | **91.7%** | `pixman`, `cairo` |
| **Electron (awesome-os/electron)** | 20 | 20 | **100%** | _(0 — 100% covered)_ |
| **NW.js (holo-display-nwjs)** | 18 | 18 | **100%** | _(0 — 100% covered)_ |
| **Node.js** | 16 | 15 | **93.8%** | `ngtcp2` |
| **Deno** | 10 | 10 | **100%** | _(0 — 100% covered)_ |
| **Bun** | 12 | 12 | **100%** | _(0 — 100% covered)_ |
| **Ladybird (awesome-os/ladybird)** | 23 | 23 | **100%** | _(0 — 100% covered)_ |
| **just-js/lo (lo/lib/*)** | 19 | 19 | **100%** | _(0 — 100% covered)_ |
| **Colibri MoE (awesome-os/colibri)** | 11 | 11 | **100%** | _(0 — 100% covered)_ |
| **llama.cpp (awesome-os/llama.cpp)** | 12 | 12 | **100%** | _(0 — 100% covered)_ |
| **vLLM (awesome-os/vllm)** | 16 | 16 | **100%** | _(0 — 100% covered)_ |

## 2. Top Shared Libraries Deduplicated Once in `v11` CAS (37 libs shared by 2–5 runtimes)

| Library | Shared By | Runtimes | Pinned Max Version (`v11`) |
| :--- | ---: | :--- | :--- |
| `zlib` | 12/12 | chromium, firefox, electron, nwjs, nodejs, deno, bun, ladybird, lo, colibri, llama-cpp, vllm | `1.4` |
| `openssl` | 11/12 | chromium, electron, nwjs, nodejs, deno, bun, ladybird, lo, colibri, llama-cpp, vllm | `4.1.0 (ahead-of-chrome upstream max)` |
| `sqlite` | 11/12 | chromium, firefox, electron, nwjs, nodejs, deno, bun, ladybird, lo, colibri, vllm | `3.54.1` |
| `zstd` | 10/12 | chromium, firefox, electron, nwjs, nodejs, deno, bun, colibri, llama-cpp, vllm | `1.6.0 (ahead-of-chrome upstream max)` |
| `brotli` | 8/12 | chromium, firefox, electron, nwjs, nodejs, deno, bun, ladybird | `1.2.1` |
| `icu4c` | 8/12 | chromium, firefox, electron, nwjs, nodejs, deno, bun, ladybird | `79.1` |
| `vulkan-loader` | 8/12 | chromium, firefox, electron, nwjs, deno, ladybird, colibri, llama-cpp | `1.4.369` |
| `curl` | 6/12 | chromium, ladybird, lo, colibri, llama-cpp, vllm | `8.23.0` |
| `ffmpeg` | 6/12 | chromium, firefox, electron, nwjs, ladybird, vllm | `9.1` |
| `libjpeg-turbo` | 6/12 | chromium, firefox, electron, nwjs, ladybird, vllm | `3.2.1` |
| `libpng` | 6/12 | chromium, firefox, electron, nwjs, ladybird, vllm | `1.6.59` |
| `libwebp` | 6/12 | chromium, firefox, electron, nwjs, ladybird, vllm | `1.6.0` |
| `nghttp2` | 6/12 | chromium, electron, nwjs, nodejs, bun, ladybird | `1.71.0` |
| `v8` | 6/12 | chromium, electron, nwjs, nodejs, deno, lo | `16.0.88+ (awesome-os/libv8_monolith / Chromium 160 Canary)` |
| `vulkan-headers` | 6/12 | chromium, electron, nwjs, ladybird, colibri, llama-cpp | `1.4.369` |
| `dav1d` | 5/12 | chromium, firefox, electron, nwjs, ladybird | `1.5.5` |
| `libuv` | 5/12 | electron, nwjs, nodejs, deno, vllm | `1.53.0 (awesome-os/libuv live upstream)` |
| `simdutf` | 5/12 | electron, nodejs, bun, ladybird, lo | `9.5.0` |
| `libavif` | 4/12 | chromium, electron, nwjs, ladybird | `1.4.2` |
| `libffi` | 4/12 | firefox, deno, lo, vllm | `3.8.1` |
| `mimalloc` | 4/12 | bun, ladybird, colibri, llama-cpp | `3.7.1 (ahead-of-chrome upstream max)` |
| `python` | 4/12 | lo, colibri, llama-cpp, vllm | `3.14.8` |
| `skia` | 4/12 | chromium, electron, nwjs, ladybird | `148` |
| `glslang` | 3/12 | ladybird, colibri, llama-cpp | `16.6.0` |
| `simdjson` | 3/12 | electron, nodejs, ladybird | `5.3.0` |
| `ada` | 2/12 | nodejs, lo | `4.1.1 (ahead-of-chrome upstream max)` |
| `aom` | 2/12 | chromium, firefox | `3.15.2` |
| `c-ares` | 2/12 | nodejs, bun | `1.34.9` |
| `cmake` | 2/12 | llama-cpp, vllm | `4.5.1` |
| `expat` | 2/12 | chromium, firefox | `2.11.0 (ahead-of-chrome upstream max)` |
| `fontconfig` | 2/12 | chromium, firefox | `2.17.1` |
| `freetype` | 2/12 | chromium, firefox | `2.13.3` |
| `harfbuzz` | 2/12 | chromium, firefox | `15.2.0 (ahead-of-chrome upstream max)` |
| `libdeflate` | 2/12 | bun, lo | `1.26` |
| `libopus` | 2/12 | chromium, firefox | `1.6.1` |
| `libvpx` | 2/12 | chromium, firefox | `1.17.0` |
| `ninja` | 2/12 | llama-cpp, vllm | `1.13.2` |
