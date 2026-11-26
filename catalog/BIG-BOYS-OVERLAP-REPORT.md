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
| **Rust / Cargo Native Crates (*-sys)** | 25 | 25 | **100%** | _(0 — 100% covered)_ |
| **.NET 11 SDK & Native Runtime** | 17 | 17 | **100%** | _(0 — 100% covered)_ |
| **microsoft/vcpkg Top 100 Native Binary Ports** | 100 | 89 | **89%** | `libxml2`, `giflib`, `googletest`, `ngtcp2`, `glfw`, `zeromq`, `rocksdb`, `leveldb`, `libxslt`, `pixman`, `cairo` |
| **npm Top Native Binary Addons (sharp/sqlite/canvas/v8)** | 32 | 31 | **96.9%** | `giflib` |
| **PyPI / Python Top Binary Wheels (numpy/torch/pillow/arrow)** | 33 | 30 | **90.9%** | `libxslt`, `libxml2`, `zeromq` |
| **GPU Compute & AI Accelerators (CUDA / NCCL / ROCm / Triton / XDNA)** | 21 | 21 | **100%** | _(0 — 100% covered)_ |

## 2. Top Shared Libraries Deduplicated Once in `v11` CAS (74 libs shared by 2–5 runtimes)

| Library | Shared By | Runtimes | Pinned Max Version (`v11`) |
| :--- | ---: | :--- | :--- |
| `zlib` | 21/21 | chromium, firefox, electron, nwjs, nodejs, deno, bun, ladybird, lo, colibri, llama-cpp, vllm, gnome-wayland, kde-plasma, hyprland-omarchy, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels, gpu-compute-stack | `1.4` |
| `openssl` | 20/21 | chromium, electron, nwjs, nodejs, deno, bun, ladybird, lo, colibri, llama-cpp, vllm, gnome-wayland, kde-plasma, hyprland-omarchy, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels, gpu-compute-stack | `4.1.0 (ahead-of-chrome upstream max)` |
| `zstd` | 19/21 | chromium, firefox, electron, nwjs, nodejs, deno, bun, colibri, llama-cpp, vllm, gnome-wayland, kde-plasma, hyprland-omarchy, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels, gpu-compute-stack | `1.6.0 (ahead-of-chrome upstream max)` |
| `sqlite` | 18/21 | chromium, firefox, electron, nwjs, nodejs, deno, bun, ladybird, lo, colibri, vllm, gnome-wayland, kde-plasma, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels | `3.54.1` |
| `vulkan-loader` | 16/21 | chromium, firefox, electron, nwjs, deno, ladybird, colibri, llama-cpp, gnome-wayland, kde-plasma, hyprland-omarchy, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, gpu-compute-stack | `1.4.369` |
| `libjpeg-turbo` | 14/21 | chromium, firefox, electron, nwjs, ladybird, vllm, gnome-wayland, kde-plasma, hyprland-omarchy, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels | `3.2.1` |
| `libpng` | 14/21 | chromium, firefox, electron, nwjs, ladybird, vllm, gnome-wayland, kde-plasma, hyprland-omarchy, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels | `1.6.59` |
| `brotli` | 13/21 | chromium, firefox, electron, nwjs, nodejs, deno, bun, ladybird, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels | `1.2.1` |
| `icu4c` | 13/21 | chromium, firefox, electron, nwjs, nodejs, deno, bun, ladybird, gnome-wayland, kde-plasma, dotnet-11, vcpkg-top100, npm-top-native | `79.1` |
| `libwebp` | 12/21 | chromium, firefox, electron, nwjs, ladybird, vllm, gnome-wayland, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels | `1.6.0` |
| `curl` | 11/21 | chromium, ladybird, lo, colibri, llama-cpp, vllm, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels | `8.23.0` |
| `nghttp2` | 11/21 | chromium, electron, nwjs, nodejs, bun, ladybird, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels | `1.71.0` |
| `ffmpeg` | 9/21 | chromium, firefox, electron, nwjs, ladybird, vllm, vcpkg-top100, npm-top-native, pypi-top-wheels | `9.1` |
| `harfbuzz` | 9/21 | chromium, firefox, gnome-wayland, kde-plasma, hyprland-omarchy, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels | `15.2.0 (ahead-of-chrome upstream max)` |
| `libffi` | 9/21 | firefox, deno, lo, vllm, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels | `3.8.2` |
| `libuv` | 9/21 | electron, nwjs, nodejs, deno, vllm, rust-cargo, vcpkg-top100, npm-top-native, pypi-top-wheels | `1.53.0 (awesome-os/libuv live upstream)` |
| `vulkan-headers` | 9/21 | chromium, electron, nwjs, ladybird, colibri, llama-cpp, hyprland-omarchy, vcpkg-top100, gpu-compute-stack | `1.4.369` |
| `simdutf` | 7/21 | electron, nodejs, bun, ladybird, lo, vcpkg-top100, npm-top-native | `9.5.0` |
| `v8` | 7/21 | chromium, electron, nwjs, nodejs, deno, lo, npm-top-native | `16.0.88+ (awesome-os/libv8_monolith / Chromium 160 Canary)` |
| `cmake` | 6/21 | llama-cpp, vllm, rust-cargo, vcpkg-top100, pypi-top-wheels, gpu-compute-stack | `4.5.1` |
| `dav1d` | 6/21 | chromium, firefox, electron, nwjs, ladybird, vcpkg-top100 | `1.5.5` |
| `freetype` | 6/21 | chromium, firefox, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels | `2.13.3` |
| `glslang` | 6/21 | ladybird, colibri, llama-cpp, hyprland-omarchy, vcpkg-top100, gpu-compute-stack | `16.6.0` |
| `libavif` | 6/21 | chromium, electron, nwjs, ladybird, vcpkg-top100, npm-top-native | `1.4.2` |
| `mimalloc` | 6/21 | bun, ladybird, colibri, llama-cpp, rust-cargo, vcpkg-top100 | `3.7.1 (ahead-of-chrome upstream max)` |
| `ninja` | 6/21 | llama-cpp, vllm, rust-cargo, vcpkg-top100, pypi-top-wheels, gpu-compute-stack | `1.13.2` |
| `python` | 6/21 | lo, colibri, llama-cpp, vllm, vcpkg-top100, pypi-top-wheels | `3.14.8` |
| `c-ares` | 5/21 | nodejs, bun, vcpkg-top100, npm-top-native, pypi-top-wheels | `1.34.9` |
| `lz4` | 5/21 | lo, rust-cargo, vcpkg-top100, npm-top-native, pypi-top-wheels | `1.11.1` |
| `protobuf` | 5/21 | vllm, rust-cargo, vcpkg-top100, npm-top-native, pypi-top-wheels | `36.2` |
| `re2` | 5/21 | chromium, rust-cargo, vcpkg-top100, npm-top-native, pypi-top-wheels | `2025-11-05` |
| `simdjson` | 5/21 | electron, nodejs, ladybird, vcpkg-top100, npm-top-native | `5.3.0` |
| `skia` | 5/21 | chromium, electron, nwjs, ladybird, dotnet-11 | `148` |
| `ada` | 4/21 | nodejs, lo, vcpkg-top100, npm-top-native | `4.1.1 (ahead-of-chrome upstream max)` |
| `dbus` | 4/21 | gnome-wayland, kde-plasma, hyprland-omarchy, vcpkg-top100 | `1.16.4` |
| `expat` | 4/21 | chromium, firefox, vcpkg-top100, npm-top-native | `2.11.0 (ahead-of-chrome upstream max)` |
| `fontconfig` | 4/21 | chromium, firefox, vcpkg-top100, npm-top-native | `2.17.1` |
| `libdeflate` | 4/21 | bun, lo, rust-cargo, vcpkg-top100 | `1.26` |
| `libtiff` | 4/21 | ladybird, vcpkg-top100, npm-top-native, pypi-top-wheels | `4.7.2` |
| `openblas` | 4/21 | llama-cpp, vcpkg-top100, pypi-top-wheels, gpu-compute-stack | `0.3.34` |
| `pipewire` | 4/21 | gnome-wayland, kde-plasma, hyprland-omarchy, vcpkg-top100 | `1.6.11` |
| `wayland` | 4/21 | gnome-wayland, kde-plasma, hyprland-omarchy, vcpkg-top100 | `1.26.0` |
| `aom` | 3/21 | chromium, firefox, vcpkg-top100 | `3.15.2` |
| `bzip2` | 3/21 | rust-cargo, vcpkg-top100, pypi-top-wheels | `1.0.8` |
| `libarchive` | 3/21 | bun, rust-cargo, vcpkg-top100 | `3.8.11` |
| `libopus` | 3/21 | chromium, firefox, vcpkg-top100 | `1.6.1` |
| `liburing` | 3/21 | colibri, rust-cargo, vcpkg-top100 | `2.15` |
| `libvpx` | 3/21 | chromium, firefox, vcpkg-top100 | `1.17.0` |
| `libxml2` | 3/21 | chromium, vcpkg-top100, pypi-top-wheels | `needs-pin` |
| `llhttp` | 3/21 | nodejs, vcpkg-top100, npm-top-native | `9.4.4` |
| `mbedtls` | 3/21 | lo, rust-cargo, vcpkg-top100 | `4.3.0` |
| `postgresql` | 3/21 | lo, vcpkg-top100, pypi-top-wheels | `19.0` |
| `wayland-protocols` | 3/21 | gnome-wayland, kde-plasma, hyprland-omarchy | `1.50` |
| `xz` | 3/21 | rust-cargo, vcpkg-top100, pypi-top-wheels | `5.8.4` |
| `cairo` | 2/21 | firefox, vcpkg-top100 | `needs-pin` |
| `giflib` | 2/21 | vcpkg-top100, npm-top-native | `needs-pin` |
| `gtk` | 2/21 | gnome-wayland, vcpkg-top100 | `4.24.2` |
| `libevent` | 2/21 | firefox, vcpkg-top100 | `2.1.13` |
| `libsdl3` | 2/21 | ladybird, vcpkg-top100 | `3.4.20` |
| `libusb` | 2/21 | vcpkg-top100, npm-top-native | `1.0.30` |
| `libxslt` | 2/21 | vcpkg-top100, pypi-top-wheels | `needs-pin` |
| `libyaml` | 2/21 | vcpkg-top100, pypi-top-wheels | `0.2.6` |
| `luajit` | 2/21 | lo, vcpkg-top100 | `2.1 27f169c` |
| `md4c` | 2/21 | lo, vcpkg-top100 | `0.6.0` |
| `nghttp3` | 2/21 | nodejs, vcpkg-top100 | `1.19.0` |
| `ngtcp2` | 2/21 | nodejs, vcpkg-top100 | `needs-pin` |
| `nspr` | 2/21 | firefox, vcpkg-top100 | `4.41` |
| `nss` | 2/21 | firefox, vcpkg-top100 | `3.131.1` |
| `opencv` | 2/21 | vcpkg-top100, pypi-top-wheels | `5.1.0` |
| `pixman` | 2/21 | firefox, vcpkg-top100 | `needs-pin` |
| `qt6base` | 2/21 | kde-plasma, vcpkg-top100 | `6.12.1` |
| `snappy` | 2/21 | vcpkg-top100, pypi-top-wheels | `1.3.1` |
| `woff2` | 2/21 | ladybird, vcpkg-top100 | `1.0.2` |
| `zeromq` | 2/21 | vcpkg-top100, pypi-top-wheels | `needs-pin` |
