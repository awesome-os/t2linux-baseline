# Awesome-OS T2Linux Baseline (`awesome-os/t2linux-baseline`)

The real-compiler **T2 SDE Baseline Edition** — includes the original upstream **[T2 SDE](https://github.com/rxrbln/t2sde)** tooling (`scripts/Config`, `scripts/Build-Pkg`, `scripts/Build-Target`, `scripts/Emerge-Pkg`) and compiles a real legacy T2 SDE `initramfs` (`t2sde-baseline-initramfs-<arch>.cpio.zst`) directly from a normal console backed by the **`v11` CAS** (`sha512`).

## Compile a Legacy T2 SDE Initramfs from Any Console

```bash
# Compiles static musl PID 1, hydrates original T2 SDE tooling,
# hashes into v11 CAS, and outputs dist/t2sde-baseline-initramfs-x86_64.cpio.zst
./scripts/t2-cas-initramfs.sh
```

## What's Inside

- **`target/baseline/{config.in,pkgsel}`** — Authentic T2 SDE target overlay (`musl` + `gcc` + `binutils` + `busybox` + `mkinitrd` + `cpio` + `zstd`).
- **`src/t2_mininit.c`** — Static musl PID 1 (`B8G_ABI_MAGIC_V3=0x33564742`) mounting `v11` CAS and exposing `/opt/t2sde/scripts/*` directly in the console.
- **`scripts/t2-cas-initramfs.sh`** — Normal console builder using real compilers (`musl-gcc`, `zig cc`, or `gcc`) to produce a verifiable `v11-tree.json` + bootable T2 SDE initramfs.
- **`.github/workflows/build-t2linux-baseline.yml`** — CI builds the T2 SDE baseline initramfs with real `musl-gcc`, boots it in **QEMU**, verifies `[T2SDE-BASELINE] SELFTEST PASS`, and publishes `v0.1.0` releases.
