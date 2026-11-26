# Big Boys Native Library Overlap — Chromium × Firefox × Ladybird × Electron × NW.js × Node.js × Deno × Bun × just-js/lo on `v11` CAS

> Cross-runtime DevOps audit against `catalog/v11-package-universe.json` (5,070 packages) + `catalog/max-version-lock.json` + Awesome-OS sovereign runtimes (`libv8_monolith`, `libuv`).

## 1. Per-Runtime `v11` CAS Coverage

| Runtime | Core Native Libs | Covered in `v11` CAS | Coverage | Missing / Custom |
| :--- | ---: | ---: | ---: | :--- |
| **Chromium 160 Canary / Sectium Browser** | 27 | 27 | **100%** | _(0 — 100% covered)_ |
| **Firefox (Gecko / SpiderMonkey)** | 24 | 24 | **100%** | _(0 — 100% covered)_ |
| **Electron (awesome-os/electron)** | 20 | 20 | **100%** | _(0 — 100% covered)_ |
| **NW.js (holo-display-nwjs)** | 18 | 18 | **100%** | _(0 — 100% covered)_ |
| **Node.js** | 16 | 16 | **100%** | _(0 — 100% covered)_ |
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
| **microsoft/vcpkg Top 100 Native Binary Ports** | 100 | 94 | **94%** | `googletest`, `glfw`, `zeromq`, `rocksdb`, `leveldb`, `libxslt` |
| **npm Top Native Binary Addons (sharp/sqlite/canvas/v8)** | 32 | 32 | **100%** | _(0 — 100% covered)_ |
| **PyPI / Python Top Binary Wheels (numpy/torch/pillow/arrow)** | 33 | 31 | **93.9%** | `libxslt`, `zeromq` |
| **GPU Compute & AI Accelerators (CUDA / NCCL / ROCm / Triton / XDNA)** | 21 | 21 | **100%** | _(0 — 100% covered)_ |
| **Linux Kernel & Bare-Metal Boot (torvalds/linux + Limine + musl)** | 15 | 14 | **93.3%** | `elfutils` |

## 2. Top Shared Libraries Deduplicated Once in `v11` CAS (74 libs shared by 2–5 runtimes)

| Library | Shared By | Runtimes | Pinned Max Version (`v11`) |
| :--- | ---: | :--- | :--- |
| `zlib` | 22/22 | chromium, firefox, electron, nwjs, nodejs, deno, bun, ladybird, lo, colibri, llama-cpp, vllm, gnome-wayland, kde-plasma, hyprland-omarchy, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels, gpu-compute-stack, linux-kernel-boot | `1.4` |
| `openssl` | 21/22 | chromium, electron, nwjs, nodejs, deno, bun, ladybird, lo, colibri, llama-cpp, vllm, gnome-wayland, kde-plasma, hyprland-omarchy, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels, gpu-compute-stack, linux-kernel-boot | `4.1.0 (ahead-of-chrome upstream max)` |
| `zstd` | 20/22 | chromium, firefox, electron, nwjs, nodejs, deno, bun, colibri, llama-cpp, vllm, gnome-wayland, kde-plasma, hyprland-omarchy, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels, gpu-compute-stack, linux-kernel-boot | `1.6.0 (ahead-of-chrome upstream max)` |
| `sqlite` | 18/22 | chromium, firefox, electron, nwjs, nodejs, deno, bun, ladybird, lo, colibri, vllm, gnome-wayland, kde-plasma, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels | `3.54.1` |
| `vulkan-loader` | 16/22 | chromium, firefox, electron, nwjs, deno, ladybird, colibri, llama-cpp, gnome-wayland, kde-plasma, hyprland-omarchy, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, gpu-compute-stack | `1.4.369` |
| `libjpeg-turbo` | 14/22 | chromium, firefox, electron, nwjs, ladybird, vllm, gnome-wayland, kde-plasma, hyprland-omarchy, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels | `3.2.1` |
| `libpng` | 14/22 | chromium, firefox, electron, nwjs, ladybird, vllm, gnome-wayland, kde-plasma, hyprland-omarchy, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels | `1.6.59` |
| `brotli` | 13/22 | chromium, firefox, electron, nwjs, nodejs, deno, bun, ladybird, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels | `1.2.1` |
| `icu4c` | 13/22 | chromium, firefox, electron, nwjs, nodejs, deno, bun, ladybird, gnome-wayland, kde-plasma, dotnet-11, vcpkg-top100, npm-top-native | `79.1` |
| `libwebp` | 12/22 | chromium, firefox, electron, nwjs, ladybird, vllm, gnome-wayland, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels | `1.6.0` |
| `curl` | 11/22 | chromium, ladybird, lo, colibri, llama-cpp, vllm, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels | `8.23.0` |
| `nghttp2` | 11/22 | chromium, electron, nwjs, nodejs, bun, ladybird, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels | `1.71.0` |
| `ffmpeg` | 9/22 | chromium, firefox, electron, nwjs, ladybird, vllm, vcpkg-top100, npm-top-native, pypi-top-wheels | `9.1` |
| `harfbuzz` | 9/22 | chromium, firefox, gnome-wayland, kde-plasma, hyprland-omarchy, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels | `15.2.0 (ahead-of-chrome upstream max)` |
| `libffi` | 9/22 | firefox, deno, lo, vllm, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels | `3.8.2` |
| `libuv` | 9/22 | electron, nwjs, nodejs, deno, vllm, rust-cargo, vcpkg-top100, npm-top-native, pypi-top-wheels | `1.53.0 (awesome-os/libuv live upstream)` |
| `vulkan-headers` | 9/22 | chromium, electron, nwjs, ladybird, colibri, llama-cpp, hyprland-omarchy, vcpkg-top100, gpu-compute-stack | `1.4.369` |
| `simdutf` | 7/22 | electron, nodejs, bun, ladybird, lo, vcpkg-top100, npm-top-native | `9.5.0` |
| `v8` | 7/22 | chromium, electron, nwjs, nodejs, deno, lo, npm-top-native | `16.0.88+ (awesome-os/libv8_monolith / Chromium 160 Canary)` |
| `cmake` | 6/22 | llama-cpp, vllm, rust-cargo, vcpkg-top100, pypi-top-wheels, gpu-compute-stack | `4.5.1` |
| `dav1d` | 6/22 | chromium, firefox, electron, nwjs, ladybird, vcpkg-top100 | `1.5.5` |
| `freetype` | 6/22 | chromium, firefox, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels | `2.13.3` |
| `glslang` | 6/22 | ladybird, colibri, llama-cpp, hyprland-omarchy, vcpkg-top100, gpu-compute-stack | `16.6.0` |
| `libavif` | 6/22 | chromium, electron, nwjs, ladybird, vcpkg-top100, npm-top-native | `1.4.2` |
| `lz4` | 6/22 | lo, rust-cargo, vcpkg-top100, npm-top-native, pypi-top-wheels, linux-kernel-boot | `1.11.1` |
| `mimalloc` | 6/22 | bun, ladybird, colibri, llama-cpp, rust-cargo, vcpkg-top100 | `3.7.1 (ahead-of-chrome upstream max)` |
| `ninja` | 6/22 | llama-cpp, vllm, rust-cargo, vcpkg-top100, pypi-top-wheels, gpu-compute-stack | `1.13.2` |
| `python` | 6/22 | lo, colibri, llama-cpp, vllm, vcpkg-top100, pypi-top-wheels | `3.14.8` |
| `c-ares` | 5/22 | nodejs, bun, vcpkg-top100, npm-top-native, pypi-top-wheels | `1.34.9` |
| `protobuf` | 5/22 | vllm, rust-cargo, vcpkg-top100, npm-top-native, pypi-top-wheels | `36.2` |
| `re2` | 5/22 | chromium, rust-cargo, vcpkg-top100, npm-top-native, pypi-top-wheels | `2025-11-05` |
| `simdjson` | 5/22 | electron, nodejs, ladybird, vcpkg-top100, npm-top-native | `5.3.0` |
| `skia` | 5/22 | chromium, electron, nwjs, ladybird, dotnet-11 | `148` |
| `ada` | 4/22 | nodejs, lo, vcpkg-top100, npm-top-native | `4.1.1 (ahead-of-chrome upstream max)` |
| `bzip2` | 4/22 | rust-cargo, vcpkg-top100, pypi-top-wheels, linux-kernel-boot | `1.0.8` |
| `dbus` | 4/22 | gnome-wayland, kde-plasma, hyprland-omarchy, vcpkg-top100 | `1.16.4` |
| `expat` | 4/22 | chromium, firefox, vcpkg-top100, npm-top-native | `2.11.0 (ahead-of-chrome upstream max)` |
| `fontconfig` | 4/22 | chromium, firefox, vcpkg-top100, npm-top-native | `2.17.1` |
| `libdeflate` | 4/22 | bun, lo, rust-cargo, vcpkg-top100 | `1.26` |
| `libtiff` | 4/22 | ladybird, vcpkg-top100, npm-top-native, pypi-top-wheels | `4.7.2` |
| `liburing` | 4/22 | colibri, rust-cargo, vcpkg-top100, linux-kernel-boot | `2.15` |
| `openblas` | 4/22 | llama-cpp, vcpkg-top100, pypi-top-wheels, gpu-compute-stack | `0.3.34` |
| `pipewire` | 4/22 | gnome-wayland, kde-plasma, hyprland-omarchy, vcpkg-top100 | `1.6.11` |
| `wayland` | 4/22 | gnome-wayland, kde-plasma, hyprland-omarchy, vcpkg-top100 | `1.26.0` |
| `xz` | 4/22 | rust-cargo, vcpkg-top100, pypi-top-wheels, linux-kernel-boot | `5.8.4` |
| `aom` | 3/22 | chromium, firefox, vcpkg-top100 | `3.15.2` |
| `libarchive` | 3/22 | bun, rust-cargo, vcpkg-top100 | `3.8.11` |
| `libopus` | 3/22 | chromium, firefox, vcpkg-top100 | `1.6.1` |
| `libvpx` | 3/22 | chromium, firefox, vcpkg-top100 | `1.17.0` |
| `libxml2` | 3/22 | chromium, vcpkg-top100, pypi-top-wheels | `2.15.4` |
| `llhttp` | 3/22 | nodejs, vcpkg-top100, npm-top-native | `9.4.4` |
| `mbedtls` | 3/22 | lo, rust-cargo, vcpkg-top100 | `4.3.0` |
| `postgresql` | 3/22 | lo, vcpkg-top100, pypi-top-wheels | `19.0` |
| `wayland-protocols` | 3/22 | gnome-wayland, kde-plasma, hyprland-omarchy | `1.50` |
| `cairo` | 2/22 | firefox, vcpkg-top100 | `1.18.6` |
| `giflib` | 2/22 | vcpkg-top100, npm-top-native | `6.1.3` |
| `gtk` | 2/22 | gnome-wayland, vcpkg-top100 | `4.24.2` |
| `libevent` | 2/22 | firefox, vcpkg-top100 | `2.1.13` |
| `libsdl3` | 2/22 | ladybird, vcpkg-top100 | `3.4.20` |
| `libusb` | 2/22 | vcpkg-top100, npm-top-native | `1.0.30` |
| `libxslt` | 2/22 | vcpkg-top100, pypi-top-wheels | `needs-pin` |
| `libyaml` | 2/22 | vcpkg-top100, pypi-top-wheels | `0.2.6` |
| `luajit` | 2/22 | lo, vcpkg-top100 | `2.1 27f169c` |
| `md4c` | 2/22 | lo, vcpkg-top100 | `0.6.0` |
| `nghttp3` | 2/22 | nodejs, vcpkg-top100 | `1.19.0` |
| `ngtcp2` | 2/22 | nodejs, vcpkg-top100 | `1.26.0` |
| `nspr` | 2/22 | firefox, vcpkg-top100 | `4.41` |
| `nss` | 2/22 | firefox, vcpkg-top100 | `3.131.1` |
| `opencv` | 2/22 | vcpkg-top100, pypi-top-wheels | `5.1.0` |
| `pixman` | 2/22 | firefox, vcpkg-top100 | `0.46.4` |
| `qt6base` | 2/22 | kde-plasma, vcpkg-top100 | `6.12.1` |
| `snappy` | 2/22 | vcpkg-top100, pypi-top-wheels | `1.3.1` |
| `woff2` | 2/22 | ladybird, vcpkg-top100 | `1.0.2` |
| `zeromq` | 2/22 | vcpkg-top100, pypi-top-wheels | `needs-pin` |
