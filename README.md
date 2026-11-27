# Awesome-OS T2Linux Baseline (`awesome-os/t2linux-baseline`)

The real-compiler **T2 SDE Baseline Edition** — includes the original upstream **[T2 SDE](https://github.com/rxrbln/t2sde)** tooling (`scripts/Config`, `scripts/Build-Pkg`, `scripts/Build-Target`, `scripts/Emerge-Pkg`) and compiles a real legacy T2 SDE `initramfs` (`t2sde-baseline-initramfs-<arch>.cpio.zst`) directly from a normal console backed by the **`v11` CAS** (`sha512`).

## Fresh OS Design: Minimal Base + Selectable Advanced Graphics (Default Rootless `Xwayland`)

Instead of forcing every server, VM, and workstation to carry gigabytes of legacy Xorg or GPU drivers, Awesome-OS uses a **2-tier selectable graphics design**:

| Layer | What's Included | Size / Target |
| :--- | :--- | :--- |
| **Base OS (Always Included)** | Static musl PID 1, `awesome-os/coreutils`, `/dev/fb0` (`42 KB` graphical desktop), `kitty-ink` ANSI/TUI, `tty0`+`ttyS0`, `modalias` `v11` CAS driver hydrator | **`~31 MB`** — boots on any PC (1998+), Hyper-V, QEMU, or 19" rack blade with **zero GPU stack** |
| **`+ Advanced Graphics` (Selectable Option)** | Full **Wayland DRM+KMS + Mesa / Vulkan / Dawn WebGPU** hardware acceleration **+ Rootless `Xwayland` enabled by default** | Opt-in for workstations (**Omarchy**, **Noctalia**, **ChonkStep**, **Sectium**, **GNOME**, **KDE**) — every legacy X11 app works out of the box inside Wayland with **zero `xorg-server`** |
| **`+ packages-legacy` (Frozen Opt-In Overlay)** | Frozen `885`-package Xorg/X11/SysV/GTK2/Qt5 `v11` CAS archive (`catalog/packages-legacy.json`) | Retro hardware preservation at **0 bytes** cost to modern builds |

---

## Compile a Legacy T2 SDE Initramfs from Any Console

```bash
# Compiles static musl PID 1, hydrates original T2 SDE tooling,
# hashes into v11 CAS, and outputs dist/t2sde-baseline-initramfs-x86_64.cpio.zst
./scripts/t2-cas-initramfs.sh
```

## What's Inside

- **`target/baseline/{config.in,pkgsel,t2-remap-policy.json}`** — Authentic T2 SDE target overlay + declarative exclusion, remap, and `v11` CAS pin gate.
- **`src/t2_mininit.c`** — Static musl PID 1 (`B8G_ABI_MAGIC_V3=0x33564742`) mounting `v11` CAS and exposing `/opt/t2sde/scripts/*` + Base Holo Stack (`/bin/coreutils`, `/bin/holo-stack`) directly in the console.
- **`scripts/t2-cas-initramfs.sh`** — Normal console builder using real compilers (`musl-gcc`, `zig cc`, or `gcc`) to produce a verifiable `v11-tree.json` + bootable T2 SDE initramfs.
- **`scripts/analyze-t2sde.mts` & `catalog/`** — Full **6,947-package** upstream T2 SDE analyzer (`~312 ms`) exporting:
  - [`catalog/v11-package-universe.json`](catalog/v11-package-universe.json) — **`5,078`** modern `[F] CROSS`-ready & remapped packages.
  - [`catalog/packages-legacy.json`](catalog/packages-legacy.json) — **`885`** frozen opt-in legacy packages (Xorg/X11, SysV, GTK2, Qt5 — zero impact on modern Wayland workstations; see [Why X11 Is Never Needed](https://github.com/awesome-os/desktop/blob/main/docs/WHY-NO-X11.md)).
  - [`catalog/T2SDE-MODERNIZATION-WISHLIST.md`](catalog/T2SDE-MODERNIZATION-WISHLIST.md) — Constructive upstream modernization & debloat wishlist.
- **`68/68` Tracked Upstream Libraries (`v11` CAS Overlap):** Pinned at ahead-of-Chrome max (`0` drifted), including `pixman@0.46.4`, `cairo@1.18.6`, `libxml2@2.15.4`, `libxslt@1.1.45`, `librdkafka@2.16.0`, `freetype@2.15.0`, `onig@6.9.10`, `libgit2@1.9.7`, `vips@8.18.7`, `mariadb-connector-c@3.4.11`, `ngtcp2@1.26.0`, and `giflib@6.1.3` — delivering **`24/24` Big Boys** coverage in [`catalog/BIG-BOYS-OVERLAP-REPORT.md`](catalog/BIG-BOYS-OVERLAP-REPORT.md) with **`21/24`** major ecosystems at **`100%`** (including **`php-top-native` `100%`** (`32/32`), **`ruby-top-native` `100%`** (`25/25`), Firefox `24/24`, Chromium `27/27`, Node `16/16`, npm Top Native `32/32`, plus `vcpkg-top100` `95%` and `pypi-top-wheels` `97%`).
- **[`catalog/max-toolchain-lock.json`](catalog/max-toolchain-lock.json) (`scripts/track-max-toolchains.mts`):** Live upstream max-version lock covering **26** major runtimes, bundlers, base OS images, and package managers (`node` `26.13.1` / upstream `27.0.0-alpha.0.2.0`, `deno`, `bun`, `pnpm`, `typescript`, `esbuild`, `vite`, `rolldown`, `oxc`, `biome`, `rust`, `zig`, `go`, `python` `3.15.2` / upstream `3.16.0a2`, `uv`, `cmake`, `ninja`, `meson`, `alpine` `3.24.4`, `php` `8.6.0`, `composer`, `ruby` `4.0.10`, `ruby.wasm`, `wordpress-playground`, `dotnet`, `dart`), tracking both `maxStable` and `maxUpstream` and refreshed automatically by [`gravity-version-bump.yml`](.github/workflows/gravity-version-bump.yml).
- **`docs/LINUX-COMPILER-AND-LEGACY-TREES.md`** — Practical Linux developer guide for `holo-compiler` / `zig cc` + materializing 0-byte legacy FHS file trees (hardlink & `overlayfs`) from `v11` CAS for `autotools`, `cmake`, `meson`, and T2 SDE `Build-Pkg`.
- **`.github/workflows/build-t2linux-baseline.yml` & `holo-ci@v1`:** CI builds the T2 SDE baseline initramfs with real `musl-gcc`, boots it in **QEMU**, verifies `[T2SDE-BASELINE] SELFTEST PASS`, publishes `v0.1.0` releases, and runs centralized **`holo-ci@v1`** verification ([`.github/workflows/holo-ci.yml`](.github/workflows/holo-ci.yml) + [`holo-ci.json`](holo-ci.json)).

---

## Tracked Max Toolchain Lock (`26/26` Resolved)

Snapshot from [`catalog/max-toolchain-lock.json`](catalog/max-toolchain-lock.json) (`schema: "awesome-os.max-toolchain-lock.v1"`, `abiMagic: 0x33564742`, `generatedAt: 2026-11-27T01:16:13.524Z`):

<!-- AUTO-GENERATED:BEGIN source="max-toolchain-lock.json" id="t2linux:toolchain-lock" -->
| Toolchain | Group | Upstream Repo | Max Stable | Max Upstream | Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `node` | `js-ts` | `nodejs/node` | `26.13.1` | `27.0.0-alpha.0.2.0` | `github-tags` |
| `deno` | `js-ts` | `denoland/deno` | `2.9.8` | `2.9.8` | `github-release` |
| `bun` | `js-ts` | `oven-sh/bun` | `1.4.5` | `1.4.5` | `github-release` |
| `pnpm` | `js-ts` | `pnpm/pnpm` | `12.24.0` | `12.24.0` | `github-tags` |
| `typescript` | `js-ts` | `microsoft/TypeScript` | `7.0.2` | `7.1-beta` | `github-release` |
| `esbuild` | `js-ts` | `evanw/esbuild` | `0.28.2` | `0.28.2` | `github-release` |
| `vite` | `js-ts` | `vitejs/vite` | `8.4.0` | `8.4.0` | `github-release` |
| `rolldown` | `js-ts` | `rolldown/rolldown` | `1.3.4` | `1.3.4` | `github-release` |
| `oxc` | `js-ts` | `oxc-project/oxc` | `1.95.0` | `1.95.0` | `github-release` |
| `biome` | `js-ts` | `biomejs/biome` | `2.6.9` | `2.6.9` | `github-release` |
| `rust` | `systems-native` | `rust-lang/rust` | `1.100.0` | `1.100.0` | `github-release` |
| `zig` | `systems-native` | `ziglang/zig` | `0.15.2` | `0.15.2` | `github-tags` |
| `go` | `systems-native` | `golang/go` | `1.27.4` | `1.27.4` | `github-tags` |
| `python` | `systems-native` | `python/cpython` | `3.15.2` | `3.16.0a2` | `github-tags` |
| `uv` | `systems-native` | `astral-sh/uv` | `0.13.10` | `0.13.10` | `github-release` |
| `cmake` | `systems-native` | `Kitware/CMake` | `4.5.1` | `4.5.1` | `github-release` |
| `ninja` | `systems-native` | `ninja-build/ninja` | `1.13.2` | `1.13.2` | `github-release` |
| `meson` | `systems-native` | `mesonbuild/meson` | `1.12.1` | `1.13.0rc1` | `github-release` |
| `alpine` | `systems-native` | `alpinelinux/aports` | `3.24.4` | `3.24.4` | `docker-hub` |
| `php` | `polyglot-wasi` | `php/php-src` | `8.6.0` | `8.6.0` | `github-release` |
| `composer` | `polyglot-wasi` | `composer/composer` | `2.11.3` | `2.11.3` | `github-release` |
| `ruby` | `polyglot-wasi` | `ruby/ruby` | `4.0.10` | `4.1.0-preview1` | `github-release` |
| `ruby.wasm` | `polyglot-wasi` | `ruby/ruby.wasm` | `2.10.1` | `2.10.1` | `github-release` |
| `wordpress-playground` | `polyglot-wasi` | `WordPress/wordpress-playground` | `3.1.66` | `3.1.66` | `github-release` |
| `dotnet` | `polyglot-wasi` | `dotnet/sdk` | `11.0.100` | `11.0.100` | `github-tags` |
| `dart` | `polyglot-wasi` | `dart-lang/sdk` | `3.14.1` | `3.15.0-186.0.dev` | `github-tags` |
<!-- AUTO-GENERATED:END -->
