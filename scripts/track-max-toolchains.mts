#!/usr/bin/env node
/**
 * @file scripts/track-max-toolchains.mts
 * @description Queries live upstream GitHub Releases and Tags across 24 major
 * runtimes, bundlers, and package managers, normalizes semver versions, and
 * emits catalog/max-toolchain-lock.json.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compareVersions } from './generate-max-version-lock.mts';

type EcosystemGroup = 'js-ts' | 'systems-native' | 'polyglot-wasi';
type ResolutionSource = 'github-release' | 'github-tags' | 'cached-fallback';

interface ToolchainSpec {
  readonly name: string;
  readonly ecosystemGroup: EcosystemGroup;
  readonly repo: string;
  readonly tagFilter: RegExp;
  readonly refPrefixes?: readonly string[];
}

interface ToolchainLockEntry {
  readonly name: string;
  readonly ecosystemGroup: EcosystemGroup;
  readonly repo: string;
  readonly upstreamTag: string;
  readonly maxVersion: string;
  readonly source: ResolutionSource;
}

interface MaxToolchainLockDoc {
  readonly schema: 'awesome-os.max-toolchain-lock.v1';
  readonly abiMagic: '0x33564742';
  readonly generatedAt: string;
  readonly totalToolchains: number;
  readonly resolvedCount: number;
  readonly toolchains: readonly ToolchainLockEntry[];
}

interface TagCandidate {
  readonly tag: string;
  readonly version: string;
  readonly source: 'github-release' | 'github-tags';
  readonly unstable: boolean;
}

const TOOLCHAINS: readonly ToolchainSpec[] = [
  // JS/TS Runtimes & Bundlers (10)
  { name: 'node', ecosystemGroup: 'js-ts', repo: 'nodejs/node', tagFilter: /^v\d+\.\d+\.\d+/ },
  { name: 'deno', ecosystemGroup: 'js-ts', repo: 'denoland/deno', tagFilter: /^v\d+\.\d+\.\d+/ },
  { name: 'bun', ecosystemGroup: 'js-ts', repo: 'oven-sh/bun', tagFilter: /^bun-v\d+\.\d+\.\d+/ },
  { name: 'pnpm', ecosystemGroup: 'js-ts', repo: 'pnpm/pnpm', tagFilter: /^v\d+\.\d+\.\d+/ },
  { name: 'typescript', ecosystemGroup: 'js-ts', repo: 'microsoft/TypeScript', tagFilter: /^v\d+\.\d+(?:\.\d+)?/ },
  { name: 'esbuild', ecosystemGroup: 'js-ts', repo: 'evanw/esbuild', tagFilter: /^v\d+\.\d+\.\d+/ },
  { name: 'vite', ecosystemGroup: 'js-ts', repo: 'vitejs/vite', tagFilter: /^v\d+\.\d+\.\d+/ },
  { name: 'rolldown', ecosystemGroup: 'js-ts', repo: 'rolldown/rolldown', tagFilter: /^v?\d+\.\d+\.\d+/ },
  { name: 'oxc', ecosystemGroup: 'js-ts', repo: 'oxc-project/oxc', tagFilter: /^(?:oxlint_)?v\d+\.\d+\.\d+/ },
  { name: 'biome', ecosystemGroup: 'js-ts', repo: 'biomejs/biome', tagFilter: /^(?:@biomejs\/biome@|cli\/v)\d+\.\d+\.\d+/ },

  // Systems & Native Build Toolchains (7)
  { name: 'rust', ecosystemGroup: 'systems-native', repo: 'rust-lang/rust', tagFilter: /^\d+\.\d+\.\d+/ },
  { name: 'zig', ecosystemGroup: 'systems-native', repo: 'ziglang/zig', tagFilter: /^\d+\.\d+\.\d+/ },
  { name: 'go', ecosystemGroup: 'systems-native', repo: 'golang/go', tagFilter: /^go\d+\.\d+(?:\.\d+)?/, refPrefixes: ['go1.', 'go2.'] },
  { name: 'uv', ecosystemGroup: 'systems-native', repo: 'astral-sh/uv', tagFilter: /^\d+\.\d+\.\d+/ },
  { name: 'cmake', ecosystemGroup: 'systems-native', repo: 'Kitware/CMake', tagFilter: /^v\d+\.\d+\.\d+/ },
  { name: 'ninja', ecosystemGroup: 'systems-native', repo: 'ninja-build/ninja', tagFilter: /^v\d+\.\d+\.\d+/ },
  { name: 'meson', ecosystemGroup: 'systems-native', repo: 'mesonbuild/meson', tagFilter: /^\d+\.\d+\.\d+/ },

  // PHP / Ruby / .NET / Dart / WASI (7)
  { name: 'php', ecosystemGroup: 'polyglot-wasi', repo: 'php/php-src', tagFilter: /^php-\d+\.\d+\.\d+/ },
  { name: 'composer', ecosystemGroup: 'polyglot-wasi', repo: 'composer/composer', tagFilter: /^\d+\.\d+\.\d+/ },
  { name: 'ruby', ecosystemGroup: 'polyglot-wasi', repo: 'ruby/ruby', tagFilter: /^v\d+[._]\d+[._]\d+/ },
  { name: 'ruby.wasm', ecosystemGroup: 'polyglot-wasi', repo: 'ruby/ruby.wasm', tagFilter: /^v?\d+\.\d+\.\d+$/ },
  { name: 'wordpress-playground', ecosystemGroup: 'polyglot-wasi', repo: 'WordPress/wordpress-playground', tagFilter: /^v\d+\.\d+\.\d+/ },
  { name: 'dotnet', ecosystemGroup: 'polyglot-wasi', repo: 'dotnet/sdk', tagFilter: /^v\d+\.\d+\.\d+/ },
  { name: 'dart', ecosystemGroup: 'polyglot-wasi', repo: 'dart-lang/sdk', tagFilter: /^\d+\.\d+\.\d+/, refPrefixes: ['3.', '4.'] },
];

const UNSTABLE_TAG_RE = /(?:^|[^a-z])(rc|alpha|beta|nightly|canary|dev|preview|pre|snapshot|weekly)(?:[^a-z]|$)/i;

function isUnstableTag(tag: string): boolean {
  return UNSTABLE_TAG_RE.test(tag);
}

function normalizeToolchainTag(raw: string): string | null {
  const s = raw.trim();
  if (!s || /^\d{4}-\d{2}-\d{2}/.test(s)) return null;
  const m = s.match(/(\d+[._]\d+(?:[._]\d+){0,2})/);
  if (!m) return null;
  return m[1].replace(/_/g, '.');
}

function buildGhEnv(useEnvToken: boolean): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env };
  if (!useEnvToken) {
    delete env.GH_TOKEN;
    delete env.GITHUB_TOKEN;
    return env;
  }
  const token = env.GH_TOKEN?.trim() || env.GITHUB_TOKEN?.trim();
  if (token) {
    env.GH_TOKEN = token;
  } else {
    delete env.GH_TOKEN;
    delete env.GITHUB_TOKEN;
  }
  return env;
}

function runGhApi(args: readonly string[]): string | null {
  const hasEnvToken = Boolean(process.env.GH_TOKEN?.trim() || process.env.GITHUB_TOKEN?.trim());
  const attempt = (
    useEnvToken: boolean,
  ): { ok: true; out: string } | { ok: false; authError: boolean; notFound: boolean } => {
    const env = buildGhEnv(useEnvToken);
    try {
      const out = execFileSync('gh', ['api', ...args], {
        encoding: 'utf8',
        env,
        stdio: ['ignore', 'pipe', 'pipe'],
      }).trim();
      return { ok: true, out };
    } catch (err: unknown) {
      const e = err as { code?: string; stderr?: string | Buffer; stdout?: string | Buffer };
      if (e.code === 'ENOENT' && process.platform === 'win32') {
        try {
          const out = execFileSync('gh.cmd', ['api', ...args], {
            encoding: 'utf8',
            env,
            shell: true,
            stdio: ['ignore', 'pipe', 'pipe'],
          }).trim();
          return { ok: true, out };
        } catch (winErr: unknown) {
          const we = winErr as { stderr?: string | Buffer; stdout?: string | Buffer };
          const msg = `${we.stderr ?? ''}\n${we.stdout ?? ''}`;
          return {
            ok: false,
            authError: /401|bad credentials|authentication|token/i.test(msg),
            notFound: /\b404\b|Not Found/i.test(msg),
          };
        }
      }
      const msg = `${e.stderr ?? ''}\n${e.stdout ?? ''}`;
      return {
        ok: false,
        authError: /401|bad credentials|authentication|token/i.test(msg),
        notFound: /\b404\b|Not Found/i.test(msg),
      };
    }
  };

  let first = attempt(true);
  if (first.ok) return first.out;
  if (first.authError && hasEnvToken) {
    const fallback = attempt(false);
    if (fallback.ok) return fallback.out;
    first = fallback;
  }
  if (!first.notFound) {
    const retry = attempt(!(first.authError && hasEnvToken));
    if (retry.ok) return retry.out;
  }
  return null;
}

function addCandidate(
  candidates: TagCandidate[],
  tag: string,
  source: 'github-release' | 'github-tags',
  tagFilter: RegExp,
): void {
  const t = tag.trim();
  if (!t || !tagFilter.test(t)) return;
  const version = normalizeToolchainTag(t);
  if (!version || !/^\d+\.\d+/.test(version)) return;
  candidates.push({
    tag: t,
    version,
    source,
    unstable: isUnstableTag(t),
  });
}

function fetchLatestToolchain(spec: ToolchainSpec): {
  tag: string;
  version: string;
  source: 'github-release' | 'github-tags';
} | null {
  const candidates: TagCandidate[] = [];

  const latestOut = runGhApi([`repos/${spec.repo}/releases/latest`, '--jq', '.tag_name']);
  if (latestOut) {
    addCandidate(candidates, latestOut, 'github-release', spec.tagFilter);
  }

  const tagsOut = runGhApi([`repos/${spec.repo}/tags?per_page=20`, '--jq', '.[].name']);
  if (tagsOut) {
    for (const line of tagsOut.split(/\r?\n/)) {
      addCandidate(candidates, line, 'github-tags', spec.tagFilter);
    }
  }

  if (spec.refPrefixes) {
    for (const prefix of spec.refPrefixes) {
      const refsOut = runGhApi([`repos/${spec.repo}/git/matching-refs/tags/${prefix}`, '--jq', '.[].ref']);
      if (refsOut) {
        for (const line of refsOut.split(/\r?\n/)) {
          addCandidate(candidates, line.replace(/^refs\/tags\//, ''), 'github-tags', spec.tagFilter);
        }
      }
    }
  }

  // Fallback to recent releases list if neither latest release nor first tag page yielded a stable hit
  const stable = candidates.filter((c) => !c.unstable);
  if (stable.length === 0) {
    const relOut = runGhApi([`repos/${spec.repo}/releases?per_page=20`, '--jq', '.[].tag_name']);
    if (relOut) {
      for (const line of relOut.split(/\r?\n/)) {
        addCandidate(candidates, line, 'github-release', spec.tagFilter);
      }
    }
  }

  const finalStable = candidates.filter((c) => !c.unstable);
  const pool = finalStable.length > 0 ? finalStable : candidates;
  if (pool.length === 0) return null;

  pool.sort((a, b) => {
    const cmp = compareVersions(b.version, a.version);
    if (cmp !== 0) return cmp;
    if (a.source === 'github-release' && b.source !== 'github-release') return -1;
    if (b.source === 'github-release' && a.source !== 'github-release') return 1;
    return 0;
  });

  const best = pool[0];
  return { tag: best.tag, version: best.version, source: best.source };
}

function main(): void {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const outPath = join(repoRoot, 'catalog', 'max-toolchain-lock.json');

  const cachedMap = new Map<string, ToolchainLockEntry>();
  if (existsSync(outPath)) {
    try {
      const prev = JSON.parse(readFileSync(outPath, 'utf8')) as { toolchains?: ToolchainLockEntry[] };
      for (const entry of prev.toolchains ?? []) {
        cachedMap.set(entry.name.toLowerCase(), entry);
      }
    } catch {
      // ignore malformed prior lockfile
    }
  }

  const resolved: ToolchainLockEntry[] = [];
  for (const spec of TOOLCHAINS) {
    const live = fetchLatestToolchain(spec);
    if (live) {
      resolved.push({
        name: spec.name,
        ecosystemGroup: spec.ecosystemGroup,
        repo: spec.repo,
        upstreamTag: live.tag,
        maxVersion: live.version,
        source: live.source,
      });
      console.log(`  ${spec.name.padEnd(22)} ${spec.repo.padEnd(32)} ${live.version.padEnd(14)} [${live.source}: ${live.tag}]`);
      continue;
    }

    const cached = cachedMap.get(spec.name.toLowerCase());
    if (cached) {
      resolved.push({
        name: spec.name,
        ecosystemGroup: spec.ecosystemGroup,
        repo: spec.repo,
        upstreamTag: cached.upstreamTag,
        maxVersion: cached.maxVersion,
        source: 'cached-fallback',
      });
      console.log(`  [CACHED] ${spec.name.padEnd(14)} ${spec.repo.padEnd(32)} ${cached.maxVersion.padEnd(14)} [${cached.upstreamTag}]`);
    } else {
      console.warn(`  [MISS]   ${spec.name.padEnd(14)} ${spec.repo.padEnd(32)} unavailable`);
    }
  }

  const doc: MaxToolchainLockDoc = {
    schema: 'awesome-os.max-toolchain-lock.v1',
    abiMagic: '0x33564742',
    generatedAt: new Date().toISOString(),
    totalToolchains: TOOLCHAINS.length,
    resolvedCount: resolved.length,
    toolchains: resolved,
  };

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(doc, null, 2)}\n`, 'utf8');
  console.log(`\n[MAX TOOLCHAINS] Resolved ${doc.resolvedCount}/${doc.totalToolchains} toolchains -> catalog/max-toolchain-lock.json`);

  if (doc.resolvedCount < doc.totalToolchains) {
    process.exitCode = 1;
  }
}

main();
