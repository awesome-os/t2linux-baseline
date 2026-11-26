# T2 SDE Modernization & Debloat Wishlist

> Generated automatically from **6947** upstream `rxrbln/t2sde` package recipes across **84** categories.
> Designed as a constructive, data-driven checklist for both Awesome-OS `v11` CAS builds and upstream T2 SDE modernization.

## Summary

- **Modern `[F] CROSS` + `v11` CAS Ready:** `5066` packages (`72.9%`) — exported to [`catalog/v11-package-universe.json`](v11-package-universe.json).
- **Excluded Legacy Bloat Candidates:** `885` packages (legacy Xorg/X11, GTK2, Qt5, Python2, Perl legacy, SysV/Groff/Texinfo).
- **Non-`CROSS` Packages Needing Build-Script / Path Modernization:** `992` packages.

## 1. Legacy Bloat & Archive-Overlay Candidates (Top Categories)

Moving these into an opt-in legacy overlay (e.g., `target/x11-legacy` / `attic`) keeps modern Wayland/musl targets fast and clean:

| Category | Excluded Count | Sample Packages |
| :--- | ---: | :--- |
| `xorg` | 306 | `appres`, `bdftopcf`, `beforelight`, `bitmap`, `driconf`, `drm_info`, `editres`, `encodings`, … |
| `x11` | 242 | `2bwm`, `915resolution`, `afterstep`, `alacritty`, `arandr`, `aterm`, `autocutsel`, `autorandr`, … |
| `perl` | 153 | `perl-algorithm-diff`, `perl-alien-build`, `perl-alien-build-plugin-download-gitlab`, `perl-alien-libxml2`, `perl-anyevent`, `perl-appconfig`, `perl-archive-extract`, `perl-archive-zip`, … |
| `xfce4` | 71 | `catfish`, `garcon`, `gigolo`, `gtk-xfce-engine`, `gtk-xfce-engine2`, `libexo`, `libxfce4ui`, `libxfce4util`, … |
| `qt` | 46 | `qt53d`, `qt5activeqt`, `qt5androidextras`, `qt5base`, `qt5charts`, `qt5coap`, `qt5connectivity`, `qt5datavis3d`, … |
| `attic` | 18 | `aqhbci`, `aqhbci-qt`, `autoconf-2.13`, `deva`, `ggrab`, `gnomesword`, `gstreamer-vaapi`, `howl`, … |
| `enlightenment` | 18 | `e16keyedit`, `e16menuedit`, `econnman`, `ecrire`, `edi`, `efl`, `enlightenment`, `enlightenment16`, … |
| `lxde` | 8 | `lxappearance`, `lxde-common`, `lxmenu-data`, `lxpanel`, `lxrandr`, `lxsession`, `lxtask`, `lxterminal` |
| `textproc` | 6 | `groff`, `libxml`, `libxml++`, `libxml1`, `libxmlb`, `libxslt` |
| `kde` | 2 | `akonadi`, `baloo` |
| `gnome` | 2 | `evolution-data-server`, `libxklavier` |
| `audio` | 2 | `gtk2mp`, `libxmp` |

## 2. Non-`CROSS` Packages Wishlist (Sysroot & Path Fixes)

Adding `[F] CROSS` + sysroot-relative `pkg-config` / removing hardcoded `/usr/lib64` & `.la` paths unlocks native cross-compilation:

| Category | Non-CROSS Count | Sample Packages |
| :--- | ---: | :--- |
| `gnome` | 126 | `abiword`, `alleyoop`, `amberol`, `appstream-glib`, `bakery`, `balsa`, `baobab`, `beagle`, … |
| `develop` | 99 | `autogen`, `bacon`, `bacon_runtime`, `bazaar`, `beignet`, `bpftop`, `calltree`, `chez-scheme`, … |
| `network` | 81 | `0install`, `0install-python`, `64gram`, `anydesk`, `astguiclient`, `bacula`, `bandwhich`, `bombadillo`, … |
| `graphic` | 58 | `amanith`, `argyllcms`, `asymptote`, `autopano-sift`, `colorcorrect`, `darktable`, `dfb++`, `dfb-examples`, … |
| `multimedia` | 47 | `abracadabra`, `avifile`, `avview`, `blender`, `cinelerra`, `cinelerra-gg`, `cubicsdr`, `cxfe`, … |
| `python` | 42 | `bicyclerepair`, `colorama`, `ffmpy`, `kiwi`, `libgmail`, `mod_python`, `narwhals`, `onnxruntime`, … |
| `security` | 40 | `b3sum`, `checkpassword`, `clamav`, `cyrus-sasl`, `dirmngr`, `dnsa`, `dsniff`, `firewalk`, … |
| `audio` | 30 | `ardour`, `at2`, `audacity`, `carla`, `decibels`, `eq-xmms`, `exact-audio`, `gamix`, … |
| `tde` | 30 | `avahi-tqt`, `dbus-1-tqt`, `dbus-tqt`, `kommando`, `tde-arts`, `tde-dolphin`, `tde-filelight`, `tde-i18n`, … |
| `games` | 26 | `0ad`, `corewars`, `crimson`, `ddnet`, `flightgear`, `frozen-bubble`, `gfingerpoken`, `gnubg`, … |
| `emulators` | 23 | `cemu`, `darling`, `dolphin-emu`, `dosemu`, `gens`, `gngeo`, `gxemul`, `lxdream`, … |
| `textproc` | 23 | `bat`, `celementtree`, `docbook-tools`, `fop`, `glow`, `go-md2man`, `goawk`, `htmlq`, … |

## 3. High-Leverage Upstream Wins

1. **Split Legacy X11 (`xorg` + `x11` = `549` packages)** into an optional overlay so Wayland workstations (`GNOME`, `KDE`, `Omarchy`, `Noctalia`, `ChonkStep`) never touch X11.
2. **Eliminate `.la` libtool & hardcoded `/usr/lib64` paths** by routing `pkg-config` and `CC`/`CXX` through a single sysroot-relative wrapper (`holo-compiler` / `zig cc`).
3. **Pin `[D]` tarballs by `sha512` in a `v11` CAS mirror** so upstream mirror 404s never break builds.
