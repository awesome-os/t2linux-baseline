# Big Boys Native Library Overlap — Chromium × Firefox × Ladybird × Electron × NW.js × Node.js × Deno × Bun × just-js/lo × PHP × Ruby on `v11` CAS

> Cross-runtime DevOps audit against `catalog/v11-package-universe.json` (5,078 packages) + `catalog/max-version-lock.json` + Awesome-OS sovereign runtimes (`libv8_monolith`, `libuv`).

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
| **microsoft/vcpkg Top 100 Native Binary Ports** | 100 | 95 | **95%** | `googletest`, `glfw`, `zeromq`, `rocksdb`, `leveldb` |
| **npm Top Native Binary Addons (sharp/sqlite/canvas/v8)** | 32 | 32 | **100%** | _(0 — 100% covered)_ |
| **PyPI / Python Top Binary Wheels (numpy/torch/pillow/arrow)** | 33 | 32 | **97%** | `zeromq` |
| **GPU Compute & AI Accelerators (CUDA / NCCL / ROCm / Triton / XDNA)** | 21 | 21 | **100%** | _(0 — 100% covered)_ |
| **Linux Kernel & Bare-Metal Boot (torvalds/linux + Limine + musl)** | 15 | 14 | **93.3%** | `elfutils` |
| **PHP 8.6 / Composer / PECL + PHP-WASI Top Native Extensions** | 32 | 32 | **100%** | _(0 — 100% covered)_ |
| **Ruby 4.0 / RubyGems / Bundler + ruby.wasm Top Native Gems** | 25 | 25 | **100%** | _(0 — 100% covered)_ |

## 2. Top Shared Libraries Deduplicated Once in `v11` CAS (83 libs shared by 2–24 runtimes)

| Library | Shared By | Runtimes | Pinned Max Version (`v11`) |
| :--- | ---: | :--- | :--- |
| `zlib` | 24/24 | chromium, firefox, electron, nwjs, nodejs, deno, bun, ladybird, lo, colibri, llama-cpp, vllm, gnome-wayland, kde-plasma, hyprland-omarchy, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels, gpu-compute-stack, linux-kernel-boot, php-top-native, ruby-top-native | `1.4` |
| `openssl` | 23/24 | chromium, electron, nwjs, nodejs, deno, bun, ladybird, lo, colibri, llama-cpp, vllm, gnome-wayland, kde-plasma, hyprland-omarchy, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels, gpu-compute-stack, linux-kernel-boot, php-top-native, ruby-top-native | `4.1.0 (ahead-of-chrome upstream max)` |
| `zstd` | 22/24 | chromium, firefox, electron, nwjs, nodejs, deno, bun, colibri, llama-cpp, vllm, gnome-wayland, kde-plasma, hyprland-omarchy, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels, gpu-compute-stack, linux-kernel-boot, php-top-native, ruby-top-native | `1.6.0 (ahead-of-chrome upstream max)` |
| `sqlite` | 20/24 | chromium, firefox, electron, nwjs, nodejs, deno, bun, ladybird, lo, colibri, vllm, gnome-wayland, kde-plasma, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels, php-top-native, ruby-top-native | `3.54.1` |
| `vulkan-loader` | 16/24 | chromium, firefox, electron, nwjs, deno, ladybird, colibri, llama-cpp, gnome-wayland, kde-plasma, hyprland-omarchy, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, gpu-compute-stack | `1.4.369` |
| `brotli` | 15/24 | chromium, firefox, electron, nwjs, nodejs, deno, bun, ladybird, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels, php-top-native, ruby-top-native | `1.2.1` |
| `icu4c` | 15/24 | chromium, firefox, electron, nwjs, nodejs, deno, bun, ladybird, gnome-wayland, kde-plasma, dotnet-11, vcpkg-top100, npm-top-native, php-top-native, ruby-top-native | `79.1` |
| `libjpeg-turbo` | 15/24 | chromium, firefox, electron, nwjs, ladybird, vllm, gnome-wayland, kde-plasma, hyprland-omarchy, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels, php-top-native | `3.2.1` |
| `libpng` | 15/24 | chromium, firefox, electron, nwjs, ladybird, vllm, gnome-wayland, kde-plasma, hyprland-omarchy, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels, php-top-native | `1.6.59` |
| `curl` | 13/24 | chromium, ladybird, lo, colibri, llama-cpp, vllm, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels, php-top-native, ruby-top-native | `8.23.0` |
| `libwebp` | 13/24 | chromium, firefox, electron, nwjs, ladybird, vllm, gnome-wayland, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels, php-top-native | `1.6.0` |
| `libffi` | 11/24 | firefox, deno, lo, vllm, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels, php-top-native, ruby-top-native | `3.8.2` |
| `nghttp2` | 11/24 | chromium, electron, nwjs, nodejs, bun, ladybird, rust-cargo, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels | `1.71.0` |
| `libuv` | 10/24 | electron, nwjs, nodejs, deno, vllm, rust-cargo, vcpkg-top100, npm-top-native, pypi-top-wheels, php-top-native | `1.53.0 (awesome-os/libuv live upstream)` |
| `ffmpeg` | 9/24 | chromium, firefox, electron, nwjs, ladybird, vllm, vcpkg-top100, npm-top-native, pypi-top-wheels | `9.1` |
| `harfbuzz` | 9/24 | chromium, firefox, gnome-wayland, kde-plasma, hyprland-omarchy, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels | `15.2.0 (ahead-of-chrome upstream max)` |
| `vulkan-headers` | 9/24 | chromium, electron, nwjs, ladybird, colibri, llama-cpp, hyprland-omarchy, vcpkg-top100, gpu-compute-stack | `1.4.369` |
| `lz4` | 8/24 | lo, rust-cargo, vcpkg-top100, npm-top-native, pypi-top-wheels, linux-kernel-boot, php-top-native, ruby-top-native | `1.11.1` |
| `v8` | 8/24 | chromium, electron, nwjs, nodejs, deno, lo, npm-top-native, ruby-top-native | `16.0.88+ (awesome-os/libv8_monolith / Chromium 160 Canary)` |
| `freetype` | 7/24 | chromium, firefox, dotnet-11, vcpkg-top100, npm-top-native, pypi-top-wheels, php-top-native | `2.15.0` |
| `simdutf` | 7/24 | electron, nodejs, bun, ladybird, lo, vcpkg-top100, npm-top-native | `9.5.0` |
| `cmake` | 6/24 | llama-cpp, vllm, rust-cargo, vcpkg-top100, pypi-top-wheels, gpu-compute-stack | `4.5.1` |
| `dav1d` | 6/24 | chromium, firefox, electron, nwjs, ladybird, vcpkg-top100 | `1.5.5` |
| `glslang` | 6/24 | ladybird, colibri, llama-cpp, hyprland-omarchy, vcpkg-top100, gpu-compute-stack | `16.6.0` |
| `libavif` | 6/24 | chromium, electron, nwjs, ladybird, vcpkg-top100, npm-top-native | `1.4.2` |
| `mimalloc` | 6/24 | bun, ladybird, colibri, llama-cpp, rust-cargo, vcpkg-top100 | `3.7.1 (ahead-of-chrome upstream max)` |
| `ninja` | 6/24 | llama-cpp, vllm, rust-cargo, vcpkg-top100, pypi-top-wheels, gpu-compute-stack | `1.13.2` |
| `python` | 6/24 | lo, colibri, llama-cpp, vllm, vcpkg-top100, pypi-top-wheels | `3.14.8` |
| `re2` | 6/24 | chromium, rust-cargo, vcpkg-top100, npm-top-native, pypi-top-wheels, ruby-top-native | `2025-11-05` |
| `bzip2` | 5/24 | rust-cargo, vcpkg-top100, pypi-top-wheels, linux-kernel-boot, php-top-native | `1.0.8` |
| `c-ares` | 5/24 | nodejs, bun, vcpkg-top100, npm-top-native, pypi-top-wheels | `1.34.9` |
| `libxml2` | 5/24 | chromium, vcpkg-top100, pypi-top-wheels, php-top-native, ruby-top-native | `2.15.4` |
| `postgresql` | 5/24 | lo, vcpkg-top100, pypi-top-wheels, php-top-native, ruby-top-native | `19.0` |
| `protobuf` | 5/24 | vllm, rust-cargo, vcpkg-top100, npm-top-native, pypi-top-wheels | `36.2` |
| `simdjson` | 5/24 | electron, nodejs, ladybird, vcpkg-top100, npm-top-native | `5.3.0` |
| `skia` | 5/24 | chromium, electron, nwjs, ladybird, dotnet-11 | `148` |
| `xz` | 5/24 | rust-cargo, vcpkg-top100, pypi-top-wheels, linux-kernel-boot, php-top-native | `5.8.4` |
| `ada` | 4/24 | nodejs, lo, vcpkg-top100, npm-top-native | `4.1.1 (ahead-of-chrome upstream max)` |
| `dbus` | 4/24 | gnome-wayland, kde-plasma, hyprland-omarchy, vcpkg-top100 | `1.16.4` |
| `expat` | 4/24 | chromium, firefox, vcpkg-top100, npm-top-native | `2.11.0 (ahead-of-chrome upstream max)` |
| `fontconfig` | 4/24 | chromium, firefox, vcpkg-top100, npm-top-native | `2.17.1` |
| `libdeflate` | 4/24 | bun, lo, rust-cargo, vcpkg-top100 | `1.26` |
| `libtiff` | 4/24 | ladybird, vcpkg-top100, npm-top-native, pypi-top-wheels | `4.7.2` |
| `liburing` | 4/24 | colibri, rust-cargo, vcpkg-top100, linux-kernel-boot | `2.15` |
| `libxslt` | 4/24 | vcpkg-top100, pypi-top-wheels, php-top-native, ruby-top-native | `1.1.45` |
| `libyaml` | 4/24 | vcpkg-top100, pypi-top-wheels, php-top-native, ruby-top-native | `0.2.6` |
| `llhttp` | 4/24 | nodejs, vcpkg-top100, npm-top-native, ruby-top-native | `9.4.4` |
| `openblas` | 4/24 | llama-cpp, vcpkg-top100, pypi-top-wheels, gpu-compute-stack | `0.3.34` |
| `pipewire` | 4/24 | gnome-wayland, kde-plasma, hyprland-omarchy, vcpkg-top100 | `1.6.11` |
| `wayland` | 4/24 | gnome-wayland, kde-plasma, hyprland-omarchy, vcpkg-top100 | `1.26.0` |
| `aom` | 3/24 | chromium, firefox, vcpkg-top100 | `3.15.2` |
| `libarchive` | 3/24 | bun, rust-cargo, vcpkg-top100 | `3.8.11` |
| `libevent` | 3/24 | firefox, vcpkg-top100, php-top-native | `2.1.13` |
| `libopus` | 3/24 | chromium, firefox, vcpkg-top100 | `1.6.1` |
| `libvpx` | 3/24 | chromium, firefox, vcpkg-top100 | `1.17.0` |
| `mbedtls` | 3/24 | lo, rust-cargo, vcpkg-top100 | `4.3.0` |
| `wayland-protocols` | 3/24 | gnome-wayland, kde-plasma, hyprland-omarchy | `1.50` |
| `argon2` | 2/24 | php-top-native, ruby-top-native | `20190702` |
| `cairo` | 2/24 | firefox, vcpkg-top100 | `1.18.6` |
| `giflib` | 2/24 | vcpkg-top100, npm-top-native | `6.1.3` |
| `gmp` | 2/24 | php-top-native, ruby-top-native | `6.3.0` |
| `gtk` | 2/24 | gnome-wayland, vcpkg-top100 | `4.24.2` |
| `hiredis` | 2/24 | vcpkg-top100, ruby-top-native | `1.5.1` |
| `libgit2` | 2/24 | php-top-native, ruby-top-native | `1.9.7` |
| `librdkafka` | 2/24 | php-top-native, ruby-top-native | `2.16.0` |
| `libsdl3` | 2/24 | ladybird, vcpkg-top100 | `3.4.20` |
| `libsodium` | 2/24 | php-top-native, ruby-top-native | `1.0.22` |
| `libusb` | 2/24 | vcpkg-top100, npm-top-native | `1.0.30` |
| `libvips` | 2/24 | php-top-native, ruby-top-native | `8.18.8` |
| `luajit` | 2/24 | lo, vcpkg-top100 | `2.1 27f169c` |
| `mariadb` | 2/24 | php-top-native, ruby-top-native | `3.4.11` |
| `md4c` | 2/24 | lo, vcpkg-top100 | `0.6.0` |
| `nghttp3` | 2/24 | nodejs, vcpkg-top100 | `1.19.0` |
| `ngtcp2` | 2/24 | nodejs, vcpkg-top100 | `1.26.0` |
| `nspr` | 2/24 | firefox, vcpkg-top100 | `4.41` |
| `nss` | 2/24 | firefox, vcpkg-top100 | `3.131.1` |
| `opencv` | 2/24 | vcpkg-top100, pypi-top-wheels | `5.1.0` |
| `pcre2` | 2/24 | vcpkg-top100, php-top-native | `10.49` |
| `pixman` | 2/24 | firefox, vcpkg-top100 | `0.46.4` |
| `qt6base` | 2/24 | kde-plasma, vcpkg-top100 | `6.12.1` |
| `snappy` | 2/24 | vcpkg-top100, pypi-top-wheels | `1.3.1` |
| `woff2` | 2/24 | ladybird, vcpkg-top100 | `1.0.2` |
| `zeromq` | 2/24 | vcpkg-top100, pypi-top-wheels | `needs-pin` |
