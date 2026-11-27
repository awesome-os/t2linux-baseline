# Linux Compiler Tooling & Materializing Legacy FHS Trees from `v11` CAS

> **Audience:** Linux, T2 SDE, `autotools`, `cmake`, `meson`, and `make` developers who want `holo-compiler` speed and `v11` CAS immutability while keeping legacy build scripts happy.

---

## 1. Install the Base Holo Compiler & `v11` CAS Stack on Linux

```bash
# Install holo-pm + holo-compiler + base v11 CAS substrate (Linux x86_64 / aarch64)
curl -fsSL https://awesome-os.github.io/installer/install.sh | sh

# Verify unified compiler & v11 CAS store
holo-pm --version
ls -la ~/.b8g/cas/v11/files/
```

Every compiled binary, header, static library, and `.b8p` object pack is stored once by its `sha512` digest:

```text
/var/lib/b8g/cas/v11/files/<sha512[0:2]>/<sha512>[-exec]
```

---

## 2. Why Legacy Tooling Expects an FHS Tree (and How to Materialize One in 0 Bytes)

Classic Linux build scripts (`./configure`, `make`, `cmake`, `pkg-config`, T2 SDE `scripts/Build-Pkg`) expect a traditional **FHS directory tree**:

```text
<sysroot>/
├── bin/
├── usr/
│   ├── bin/
│   ├── include/
│   └── lib/
│       └── pkgconfig/
└── etc/
```

Instead of copying gigabytes of headers and libraries for every build, Awesome-OS **materializes** a throwaway FHS tree directly from `v11` CAS using **0-byte hardlinks** (or Linux `overlayfs`):

### Option A — 0-Byte Hardlink Materialization (Works Without Root, Inside Any Container)

```bash
SYSROOT="$PWD/build/sysroot-x86_64"
mkdir -p "$SYSROOT"/{bin,usr/bin,usr/include,usr/lib/pkgconfig,etc}

# Project packages from v11 CAS into a classic FHS sysroot via 0-byte hardlinks
# (reads sha512 entries from dist/v11-tree.json or catalog/v11-package-universe.json)
ln -f /var/lib/b8g/cas/v11/files/<aa>/<sha512>-exec "$SYSROOT/usr/bin/<tool>"
```

When using **`holo-pm`**, this projection happens automatically for any `repository://` or `project://` package:

```bash
# Materialize a clean local ./bin & sysroot projection (0 bytes duplicated)
holo-pm install repository://github.com/awesome-os/coreutils@main
```

### Option B — Linux `overlayfs` Layered Tree (Ideal for T2 SDE `Build-Pkg` + `packages-legacy`)

On Linux, you can stack the modern `v11` universe with the frozen **`packages-legacy`** overlay (`catalog/packages-legacy.json` — Xorg/X11, SysV, GTK2, Qt5) and a writable `upperdir` so legacy build scripts can write freely without mutating the immutable CAS:

```bash
mkdir -p build/{upper,work,merged}

sudo mount -t overlay overlay \
  -o "lowerdir=$PWD/build/sysroot-v11:$PWD/build/sysroot-legacy,upperdir=$PWD/build/upper,workdir=$PWD/build/work" \
  "$PWD/build/merged"

# Run legacy configure / make / T2 SDE Build-Pkg inside the materialized FHS tree
# Clean up afterwards: sudo umount "$PWD/build/merged" && rm -rf build/{upper,work}
```

---

## 3. Compiling Legacy C/C++ Packages Without Host Path Drift

Most legacy build failures come from host `/usr/lib64`, `.la` libtool files, or un-prefixed `pkg-config` leaking host headers into a cross-compile. Point your compiler and `pkg-config` strictly at the materialized `v11` sysroot:

```bash
export SYSROOT="$PWD/build/sysroot-x86_64"
export CC="zig cc -target x86_64-linux-musl --sysroot=$SYSROOT"
export CXX="zig c++ -target x86_64-linux-musl --sysroot=$SYSROOT"
export PKG_CONFIG_SYSROOT_DIR="$SYSROOT"
export PKG_CONFIG_LIBDIR="$SYSROOT/usr/lib/pkgconfig:$SYSROOT/usr/share/pkgconfig"
export PKG_CONFIG_PATH=""

# Now standard autotools, CMake, Meson, or T2 SDE Build-Pkg compiles cleanly
./configure --host=x86_64-unknown-linux-musl --prefix=/usr
make -j"$(nproc)" DESTDIR="$PWD/build/out" install
```

### Stripping `.la` Path Leaks Automatically

Before hashing `build/out/` back into `v11` CAS, strip legacy libtool `.la` files (which hardcode absolute build-machine paths):

```bash
find "$PWD/build/out" -name '*.la' -delete
```

---

## 4. Compiling a Full Legacy T2 SDE Initramfs from Console

```bash
git clone https://github.com/awesome-os/t2linux-baseline.git
cd t2linux-baseline

# 1. Enforce exclusion/remap/v11-pin policy & build legacy T2 SDE initramfs
./scripts/t2-cas-initramfs.sh

# 2. Refresh the 6,947-package upstream T2 SDE catalog & legacy overlay list
node scripts/analyze-t2sde.mts
```

Artifacts land in `dist/t2sde-baseline-initramfs-<arch>.cpio.zst` and `dist/v11-tree.json`, ready to boot in QEMU or enroll into `awesome-os/host-manager`.
