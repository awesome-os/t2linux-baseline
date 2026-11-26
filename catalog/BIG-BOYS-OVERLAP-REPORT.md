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
| **GNOME Wayland (GTK 4.24 / libadwaita 1.10)** | 16 | 16 | **100%** | _(0 — 100% covered)_ |
| **KDE Plasma 6.8 (KWin 6.8.3 / Qt 6.12.1)** | 17 | 17 | **100%** | _(0 — 100% covered)_ |
| **Omarchy / Hyprland 0.57 (wlroots 0.20)** | 15 | 15 | **100%** | _(0 — 100% covered)_ |

## 2. Top Shared Libraries Deduplicated Once in `v11` CAS (41 libs shared by 2–5 runtimes)

| Library | Shared By | Runtimes | Pinned Max Version (`v11`) |
| :--- | ---: | :--- | :--- |
| `zlib` | 15/15 | chromium, firefox, electron, nwjs, nodejs, deno, bun, ladybird, lo, colibri, llama-cpp, vllm, gnome-wayland, kde-plasma, hyprland-omarchy | `1.4` |
| `openssl` | 14/15 | chromium, electron, nwjs, nodejs, deno, bun, ladybird, lo, colibri, llama-cpp, vllm, gnome-wayland, kde-plasma, hyprland-omarchy | `4.1.0 (ahead-of-chrome upstream max)` |
| `sqlite` | 13/15 | chromium, firefox, electron, nwjs, nodejs, deno, bun, ladybird, lo, colibri, vllm, gnome-wayland, kde-plasma | `3.54.1` |
| `zstd` | 13/15 | chromium, firefox, electron, nwjs, nodejs, deno, bun, colibri, llama-cpp, vllm, gnome-wayland, kde-plasma, hyprland-omarchy | `1.6.0 (ahead-of-chrome upstream max)` |
| `vulkan-loader` | 11/15 | chromium, firefox, electron, nwjs, deno, ladybird, colibri, llama-cpp, gnome-wayland, kde-plasma, hyprland-omarchy | `1.4.369` |
| `icu4c` | 10/15 | chromium, firefox, electron, nwjs, nodejs, deno, bun, ladybird, gnome-wayland, kde-plasma | `79.1` |
| `libjpeg-turbo` | 9/15 | chromium, firefox, electron, nwjs, ladybird, vllm, gnome-wayland, kde-plasma, hyprland-omarchy | `3.2.1` |
| `libpng` | 9/15 | chromium, firefox, electron, nwjs, ladybird, vllm, gnome-wayland, kde-plasma, hyprland-omarchy | `1.6.59` |
| `brotli` | 8/15 | chromium, firefox, electron, nwjs, nodejs, deno, bun, ladybird | `1.2.1` |
| `libwebp` | 7/15 | chromium, firefox, electron, nwjs, ladybird, vllm, gnome-wayland | `1.6.0` |
| `vulkan-headers` | 7/15 | chromium, electron, nwjs, ladybird, colibri, llama-cpp, hyprland-omarchy | `1.4.369` |
| `curl` | 6/15 | chromium, ladybird, lo, colibri, llama-cpp, vllm | `8.23.0` |
| `ffmpeg` | 6/15 | chromium, firefox, electron, nwjs, ladybird, vllm | `9.1` |
| `nghttp2` | 6/15 | chromium, electron, nwjs, nodejs, bun, ladybird | `1.71.0` |
| `v8` | 6/15 | chromium, electron, nwjs, nodejs, deno, lo | `16.0.88+ (awesome-os/libv8_monolith / Chromium 160 Canary)` |
| `dav1d` | 5/15 | chromium, firefox, electron, nwjs, ladybird | `1.5.5` |
| `harfbuzz` | 5/15 | chromium, firefox, gnome-wayland, kde-plasma, hyprland-omarchy | `15.2.0 (ahead-of-chrome upstream max)` |
| `libuv` | 5/15 | electron, nwjs, nodejs, deno, vllm | `1.53.0 (awesome-os/libuv live upstream)` |
| `simdutf` | 5/15 | electron, nodejs, bun, ladybird, lo | `9.5.0` |
| `glslang` | 4/15 | ladybird, colibri, llama-cpp, hyprland-omarchy | `16.6.0` |
| `libavif` | 4/15 | chromium, electron, nwjs, ladybird | `1.4.2` |
| `libffi` | 4/15 | firefox, deno, lo, vllm | `3.8.2` |
| `mimalloc` | 4/15 | bun, ladybird, colibri, llama-cpp | `3.7.1 (ahead-of-chrome upstream max)` |
| `python` | 4/15 | lo, colibri, llama-cpp, vllm | `3.14.8` |
| `skia` | 4/15 | chromium, electron, nwjs, ladybird | `148` |
| `dbus` | 3/15 | gnome-wayland, kde-plasma, hyprland-omarchy | `1.16.4` |
| `pipewire` | 3/15 | gnome-wayland, kde-plasma, hyprland-omarchy | `1.6.11` |
| `simdjson` | 3/15 | electron, nodejs, ladybird | `5.3.0` |
| `wayland` | 3/15 | gnome-wayland, kde-plasma, hyprland-omarchy | `1.26.0` |
| `wayland-protocols` | 3/15 | gnome-wayland, kde-plasma, hyprland-omarchy | `1.50` |
| `ada` | 2/15 | nodejs, lo | `4.1.1 (ahead-of-chrome upstream max)` |
| `aom` | 2/15 | chromium, firefox | `3.15.2` |
| `c-ares` | 2/15 | nodejs, bun | `1.34.9` |
| `cmake` | 2/15 | llama-cpp, vllm | `4.5.1` |
| `expat` | 2/15 | chromium, firefox | `2.11.0 (ahead-of-chrome upstream max)` |
| `fontconfig` | 2/15 | chromium, firefox | `2.17.1` |
| `freetype` | 2/15 | chromium, firefox | `2.13.3` |
| `libdeflate` | 2/15 | bun, lo | `1.26` |
| `libopus` | 2/15 | chromium, firefox | `1.6.1` |
| `libvpx` | 2/15 | chromium, firefox | `1.17.0` |
| `ninja` | 2/15 | llama-cpp, vllm | `1.13.2` |
