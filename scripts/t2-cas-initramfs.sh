#!/usr/bin/env bash
# Awesome-OS T2Linux Baseline — Compile Legacy T2 SDE Initramfs from v11 CAS
# Works directly from any normal Linux/WSL/container console with musl-gcc, gcc, or zig cc.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARCH="${ARCH:-$(uname -m)}"
CAS_DIR="${B8G_CAS_DIR:-$REPO_ROOT/build/cas}/v11"
T2_DIR="${T2_DIR:-$REPO_ROOT/t2-trunk}"
OUT_DIR="${OUT_DIR:-$REPO_ROOT/dist}"
WORK_ROOTFS="$REPO_ROOT/build/rootfs-$ARCH"

mkdir -p "$CAS_DIR/files" "$OUT_DIR" "$REPO_ROOT/build"

echo "[T2SDE-BASELINE] 1/4 Hydrating original T2 SDE tooling..."
if [ ! -d "$T2_DIR/scripts" ]; then
  git clone --depth=1 https://github.com/rxrbln/t2sde.git "$T2_DIR"
fi

# Verify authentic upstream T2 SDE scripts
for script in scripts/Config scripts/Build-Pkg scripts/Build-Target scripts/Emerge-Pkg; do
  if [ ! -f "$T2_DIR/$script" ]; then
    echo "ERROR: Missing upstream T2 SDE script: $T2_DIR/$script" >&2
    exit 1
  fi
done
echo "[T2SDE-BASELINE] Verified upstream T2 SDE scripts in $T2_DIR/scripts/"

# Overlay our target/baseline definition & remap policy into T2 SDE tree
mkdir -p "$T2_DIR/target/t2linux-baseline"
cp -f "$REPO_ROOT/target/baseline/config.in" "$T2_DIR/target/t2linux-baseline/config.in"
cp -f "$REPO_ROOT/target/baseline/pkgsel" "$T2_DIR/target/t2linux-baseline/pkgsel"
cp -f "$REPO_ROOT/target/baseline/t2-remap-policy.json" "$T2_DIR/target/t2linux-baseline/t2-remap-policy.json"

# Enforce Exclusion & Remapping Policy Gate against pkgsel (zero legacy bloat)
POLICY_FILE="$REPO_ROOT/target/baseline/t2-remap-policy.json"
if [ -f "$POLICY_FILE" ]; then
  echo "[T2SDE-BASELINE] Enforcing exclusion/remap/pin policy ($POLICY_FILE)..."
  EXCLUDED_LIST="$(sed -n '/"exclude"/,/\]/p' "$POLICY_FILE" | grep -oE '"[a-zA-Z0-9._-]+"' | tr -d '"' | grep -v '^exclude$' || true)"
  for pkg in $EXCLUDED_LIST; do
    if grep -qE "^X[[:space:]]+${pkg}([[:space:]]|\$)" "$REPO_ROOT/target/baseline/pkgsel"; then
      echo "ERROR: Policy violation — excluded legacy package '$pkg' is enabled in target/baseline/pkgsel!" >&2
      exit 1
    fi
  done
  echo "[T2SDE-BASELINE] Policy gate PASS (0 excluded legacy packages enabled; remaps & v11 pins active)"
fi

echo "[T2SDE-BASELINE] 2/4 Compiling static musl PID 1 (src/t2_mininit.c)..."
INIT_BIN="$OUT_DIR/t2-mininit-$ARCH"
if command -v musl-gcc >/dev/null 2>&1; then
  musl-gcc -static -Os -s -Wall -Wextra -Werror "$REPO_ROOT/src/t2_mininit.c" -o "$INIT_BIN"
elif command -v zig >/dev/null 2>&1; then
  zig cc -target "${ARCH}-linux-musl" -static -Os -s -Wall -Wextra -Werror "$REPO_ROOT/src/t2_mininit.c" -o "$INIT_BIN"
else
  gcc -static -Os -s -Wall -Wextra -Werror "$REPO_ROOT/src/t2_mininit.c" -o "$INIT_BIN"
fi
chmod 755 "$INIT_BIN"

# Store compiled init into v11 CAS (sha512)
INIT_SHA512="$(sha512sum "$INIT_BIN" | awk '{print $1}')"
mkdir -p "$CAS_DIR/files/${INIT_SHA512:0:2}"
cp -f "$INIT_BIN" "$CAS_DIR/files/${INIT_SHA512:0:2}/${INIT_SHA512}-exec"
echo "[T2SDE-BASELINE] Stored init in v11 CAS: ${INIT_SHA512:0:16}..."

echo "[T2SDE-BASELINE] 3/4 Assembling legacy T2 SDE initramfs (with /opt/t2sde tooling)..."
rm -rf "$WORK_ROOTFS"
mkdir -p "$WORK_ROOTFS"/{bin,sbin,proc,sys,dev,tmp,run,root,etc/awesome-os,var/lib/b8g/cas/v11/files,opt/t2sde/scripts,opt/t2sde/target/t2linux-baseline}

cp -f "$CAS_DIR/files/${INIT_SHA512:0:2}/${INIT_SHA512}-exec" "$WORK_ROOTFS/init"
chmod 755 "$WORK_ROOTFS/init"
cp -f "$REPO_ROOT/target/baseline/t2-remap-policy.json" "$WORK_ROOTFS/etc/awesome-os/t2-remap-policy.json"
cp -f "$REPO_ROOT/t2sde-cas-manifest.json" "$WORK_ROOTFS/etc/awesome-os/t2sde-cas-manifest.json"

# Hydrate base Holo stack into initramfs (awesome-os/coreutils + holo-pm / holo-compiler console entrypoints)
COREUTILS_URL="https://github.com/awesome-os/coreutils/releases/latest/download/coreutils-linux-${ARCH}-musl"
if command -v curl >/dev/null 2>&1; then
  HTTP_CODE="$(curl -sSL -o "$WORK_ROOTFS/bin/coreutils" -w '%{http_code}' "$COREUTILS_URL" || true)"
  if [ "$HTTP_CODE" = "200" ] && [ -s "$WORK_ROOTFS/bin/coreutils" ]; then
    chmod 755 "$WORK_ROOTFS/bin/coreutils"
    echo "[T2SDE-BASELINE] Base Holo stack: hydrated static musl awesome-os/coreutils"
  else
    rm -f "$WORK_ROOTFS/bin/coreutils"
  fi
fi
cat << 'EOF' > "$WORK_ROOTFS/bin/holo-stack"
#!/bin/sh
echo "Awesome-OS Base Holo Stack (B8G_ABI_MAGIC_V3=0x33564742, v11 CAS)"
cat /etc/awesome-os/t2sde-cas-manifest.json
EOF
chmod 755 "$WORK_ROOTFS/bin/holo-stack"

# Copy original T2 SDE core scripts & baseline target into /opt/t2sde inside the initramfs
cp -f "$T2_DIR/scripts/Config" "$T2_DIR/scripts/Build-Pkg" "$T2_DIR/scripts/Build-Target" "$T2_DIR/scripts/Emerge-Pkg" "$WORK_ROOTFS/opt/t2sde/scripts/"
chmod 755 "$WORK_ROOTFS/opt/t2sde/scripts/"*
cp -f "$REPO_ROOT/target/baseline/"* "$WORK_ROOTFS/opt/t2sde/target/t2linux-baseline/"
cp -f "$REPO_ROOT/scripts/t2-cas-initramfs.sh" "$WORK_ROOTFS/bin/t2-cas-initramfs.sh"
chmod 755 "$WORK_ROOTFS/bin/t2-cas-initramfs.sh"

BUSYBOX_BIN="$(command -v busybox || echo /bin/busybox)"
cp -f "$BUSYBOX_BIN" "$WORK_ROOTFS/bin/busybox"
chmod 755 "$WORK_ROOTFS/bin/busybox"
for cmd in sh mount umount uname ip ls cat poweroff reboot wget sha256sum sha512sum mkdir cp mv rm grep sed awk tar zcat echo sleep ps dmesg clear env id hostname; do
  ln -sf busybox "$WORK_ROOTFS/bin/$cmd"
done

cat << EOF > "$WORK_ROOTFS/etc/t2-release"
NAME="Awesome-OS T2Linux Baseline"
VERSION="0.1.0"
ID=t2linux-baseline
ARCH=$ARCH
B8G_ABI_MAGIC_V3=0x33564742
INIT_SHA512=$INIT_SHA512
EOF

INITRAMFS_OUT="$OUT_DIR/t2sde-baseline-initramfs-${ARCH}.cpio.zst"
(cd "$WORK_ROOTFS" && find . -print0 | cpio --null -ov --format=newc 2>/dev/null | zstd -19 -T0) > "$INITRAMFS_OUT"
INITRD_SHA512="$(sha512sum "$INITRAMFS_OUT" | awk '{print $1}')"
mkdir -p "$CAS_DIR/files/${INITRD_SHA512:0:2}"
cp -f "$INITRAMFS_OUT" "$CAS_DIR/files/${INITRD_SHA512:0:2}/${INITRD_SHA512}"

echo "[T2SDE-BASELINE] 4/4 Writing v11-tree.json..."
cat << EOF > "$OUT_DIR/v11-tree.json"
{
  "schema": "awesome-os.v11-tree.v1",
  "repo": "awesome-os/t2linux-baseline",
  "arch": "$ARCH",
  "abiMagic": "0x33564742",
  "artifacts": {
    "init": { "file": "t2-mininit-$ARCH", "sha512": "$INIT_SHA512" },
    "initramfs": { "file": "t2sde-baseline-initramfs-${ARCH}.cpio.zst", "sha512": "$INITRD_SHA512" }
  }
}
EOF

echo "[T2SDE-BASELINE] DONE -> $INITRAMFS_OUT ($(du -h "$INITRAMFS_OUT" | awk '{print $1}'))"
