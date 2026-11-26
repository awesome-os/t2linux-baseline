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
  - [`catalog/v11-package-universe.json`](catalog/v11-package-universe.json) — **`5,075`** modern `[F] CROSS`-ready & remapped packages.
  - [`catalog/packages-legacy.json`](catalog/packages-legacy.json) — **`885`** frozen opt-in legacy packages (Xorg/X11, SysV, GTK2, Qt5 — zero impact on modern Wayland workstations; see [Why X11 Is Never Needed](https://github.com/awesome-os/desktop/blob/main/docs/WHY-NO-X11.md)).
  - [`catalog/T2SDE-MODERNIZATION-WISHLIST.md`](catalog/T2SDE-MODERNIZATION-WISHLIST.md) — Constructive upstream modernization & debloat wishlist.
- **`60/60` Tracked Upstream Libraries (`v11` CAS Overlap):** Pinned at ahead-of-Chrome max (`0` drifted), including `pixman@0.46.4`, `cairo@1.18.6`, `libxml2@2.15.4`, `ngtcp2@1.26.0`, and `giflib@6.1.3` — delivering **`100%`** shared `v11` overlap across Firefox (`24/24`), Chromium (`27/27`), Node (`16/16`), and npm Top Native (`32/32`), with **`19/22`** major ecosystems at `100%`.
- **`docs/LINUX-COMPILER-AND-LEGACY-TREES.md`** — Practical Linux developer guide for `holo-compiler` / `zig cc` + materializing 0-byte legacy FHS file trees (hardlink & `overlayfs`) from `v11` CAS for `autotools`, `cmake`, `meson`, and T2 SDE `Build-Pkg`.
- **`.github/workflows/build-t2linux-baseline.yml` & `holo-ci@v1`:** CI builds the T2 SDE baseline initramfs with real `musl-gcc`, boots it in **QEMU**, verifies `[T2SDE-BASELINE] SELFTEST PASS`, publishes `v0.1.0` releases, and runs centralized **`holo-ci@v1`** verification ([`.github/workflows/holo-ci.yml`](.github/workflows/holo-ci.yml) + [`holo-ci.json`](holo-ci.json)).
