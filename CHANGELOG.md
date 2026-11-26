# Changelog

All notable changes to `awesome-os/t2linux-baseline` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Canonical verbatim SPDX `LICENSE` for deterministic GitHub Licensee detection.
- `.gitattributes` enforcing consistent LF/CRLF and binary handling across Windows and POSIX.
- `.github/CODEOWNERS` governance and workflow ownership rules.
- `CHANGELOG.md` initialized in Keep a Changelog v1.1.0 format for release traceability.

## [11.0.0] - 2026-11-26

### Changed
- Minimal Ring-0/Ring-1 T2-SDE Linux substrate and deduplicated Holo v11 package universe (`68/68` tracked upstreams, `max-toolchain-lock.json` across `26` toolchains).
- Added `holo-kbuild`, damped-gravity upstream version bump workflows, and `holo-ci@v1` verification.
