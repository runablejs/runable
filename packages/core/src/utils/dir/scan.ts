import { existsSync, statSync } from "node:fs";

import fg from "fast-glob";
import merge from "lodash/merge.js";

import { toArray } from "../to-array.js";
import { Arrayable } from "../types.js";
import { resolveDir } from "./index.js";

/**
 * Exclude patterns shared by every Syora directory scanner.
 * Each scan type (components, composables, ...) can extend this
 * with its own additional patterns via `mergeExclude`.
 */
export const DEFAULT_EXCLUDE_PATTERNS = [
  "**/node_modules/**",
  "**/.git/**",
  "**/*.d.*",
  "**/-*.*",
] as const;

/**
 * Fallback values shared by every Syora directory scanner, extended
 * with whatever scan-specific fallback fields the consumer needs
 * (e.g. `pathPrefix` and `componentName` for components).
 */
export type Fallback<Extra extends object = {}> = {
  extensions: string[];
  exclude: string[];
} & Extra;

/**
 * Merges the shared defaults with scan-specific patterns and/or
 * user-provided overrides from `ScanDir['exclude']`.
 *
 * User-provided patterns are appended, not substituted, so a project
 * config can add exclusions without having to repeat the base ones.
 */
export function mergeExcludePatterns(
  extra: string[] = [],
  userExclude: string[] = [],
): string[] {
  return [...DEFAULT_EXCLUDE_PATTERNS, ...extra, ...userExclude];
}

export interface ScanFallback {
  extensions: string[];
  exclude: string[];
  pathPrefix: boolean;
}

/**
 * Base configuration for scanning one or more project directories.
 * Shared by all of Syora's auto-scan systems (components, composables, ...).
 *
 * The `Extra` generic lets each consumer add its own options
 * without duplicating `dirs` / `extensions` / `exclude`.
 */
export type ScanDirObject<Extra extends object = {}> = {
  /**
   * Directory(ies) to scan.
   * Resolved relative to the project root (Vite's `root`).
   */
  dirs: string | string[];

  /**
   * File extensions considered as valid targets.
   */
  extensions?: string | string[];

  /**
   * Globs to exclude from the scan.
   * @default ['**\/node_modules/**', '**\/-*.**',  **\/.git/**', ]
   */
  exclude?: string[];
} & Extra;

export type ScanDir<Extra extends object = {}> = string | ScanDirObject<Extra>;

/**
 * Result shape shared by every Syora directory scanner, extended with
 * whatever scan-specific fields the consumer needs (e.g. `pathPrefix`
 * and `componentName` for components).
 */
export type ResolvedScanDir<Extra extends object = {}> = {
  dirs: string[];
  extGlob: string;
  extensions: string[];
  exclude: string[];
} & Extra;

export type ResolvedScanDirFile<Extra extends object = {}> =
  ResolvedScanDir<Extra> & { file: string; parent: string };

/**
 * Resolves a list of `ScanDir<Extra>` entries into fully-resolved scan
 * targets: absolute dirs, extension glob, exclude patterns, and any
 * extra scan-specific fields.
 *
 * Generic over `Extra` so components, composables, etc. can all share
 * this resolution logic instead of duplicating the loop.
 */
export function resolveScanDirs<Extra extends object>(
  cwd: string,
  dirs: Arrayable<ScanDir<Extra>>,
  {
    defaultExtensions,
    fallback,
    resolveExtra,
  }: {
    /** Extensions used when a dir entry doesn't specify its own. */
    defaultExtensions: string[];
    /** Caller-supplied defaults, overridden by any per-dir value. */
    fallback?: Fallback<Extra>;
    /**
     * Computes this scan type's extra fields (e.g. `pathPrefix`,
     * `componentName`) from the raw dir entry and the merged fallback.
     * Kept as a callback so `resolveScanDirs` stays agnostic of what
     * "extra" actually means for a given scan type.
     */
    resolveExtra?: (
      raw: Exclude<ScanDir<Extra>, string>,
      fallback: Fallback<Extra>,
    ) => Extra;
  },
): ResolvedScanDir<Extra>[] {
  resolveExtra ??= () => ({}) as Extra;

  const dirList = toArray(dirs);
  const resolveds: ResolvedScanDir<Extra>[] = [];

  for (let i = 0; i < dirList.length; i++) {
    const dir = dirList[i]!;
    const raw = (typeof dir === "string" ? { dirs: dir } : dir) as Exclude<
      ScanDir<Extra>,
      string
    >;

    // `merge` skips undefined source values, so per-dir values win when
    // set, and the caller-supplied `fallback` fills the gaps otherwise.
    const _fallback = merge<Fallback<Extra>, Fallback<Extra>>(
      fallback ?? ({} as Fallback<Extra>),
      {
        extensions: toArray(raw.extensions ?? defaultExtensions),
        exclude: mergeExcludePatterns(raw.exclude),
        ...resolveExtra(raw, fallback ?? ({} as Fallback<Extra>)),
      },
    );

    const extensions = raw.extensions
      ? toArray(raw.extensions)
      : _fallback.extensions!;
    const exclude = _fallback.exclude!;
    const extra = resolveExtra(raw, _fallback);

    const _dirs = toArray(raw.dirs).map((d) => resolveDir(d, cwd));
    const extGlob =
      extensions.length === 1 ? extensions[0] : `{${extensions.join(",")}}`;

    resolveds.push({
      dirs: _dirs,
      extGlob: `**/*.${extGlob}`,
      extensions,
      exclude,
      ...extra,
    });
  }

  return resolveds;
}

export function resolveScanDirs_v2<Extra extends object>(
  cwd: string,
  dirs: Arrayable<ScanDir<Extra> | ResolvedScanDirFile<Extra>>,
  {
    defaultExtensions,
    fallback,
    resolveExtra,
  }: {
    /** Extensions used when a dir entry doesn't specify its own. */
    defaultExtensions: string[];
    /** Caller-supplied defaults, overridden by any per-dir value. */
    fallback?: Fallback<Extra>;
    /**
     * Computes this scan type's extra fields (e.g. `pathPrefix`,
     * `componentName`) from the raw dir entry and the merged fallback.
     * Kept as a callback so `resolveScanDirs` stays agnostic of what
     * "extra" actually means for a given scan type.
     */
    resolveExtra?: (
      raw: Exclude<ScanDir<Extra>, string>,
      fallback: Fallback<Extra>,
    ) => Extra;
  },
): ResolvedScanDirFile<Extra>[] {
  resolveExtra ??= () => ({}) as Extra;

  const dirList = toArray(dirs);
  const resolveds: ResolvedScanDir<Extra>[] = [];

  for (let i = 0; i < dirList.length; i++) {
    const dir = dirList[i]!;

    const raw = (typeof dir === "string" ? { dirs: dir } : dir) as Exclude<
      ScanDir<Extra> | ResolvedScanDirFile<Extra>,
      string
    >;

    if ("file" in raw) {
      raw.file = resolveDir(raw.file, cwd);
      raw.parent = resolveDir(raw.parent, cwd);

      resolveds.push(raw);

      continue;
    }

    // `merge` skips undefined source values, so per-dir values win when
    // set, and the caller-supplied `fallback` fills the gaps otherwise.
    const _fallback = merge<Fallback<Extra>, Fallback<Extra>>(
      fallback ?? ({} as Fallback<Extra>),
      {
        extensions: toArray(raw.extensions ?? defaultExtensions),
        exclude: mergeExcludePatterns(raw.exclude),
        ...resolveExtra(raw, fallback ?? ({} as Fallback<Extra>)),
      },
    );

    const extensions = raw.extensions
      ? toArray(raw.extensions)
      : _fallback.extensions!;
    const exclude = _fallback.exclude!;
    const extra = resolveExtra(raw, _fallback);

    const _dirs = toArray(raw.dirs).map((d) => resolveDir(d, cwd));
    const extGlob =
      extensions.length === 1 ? extensions[0] : `{${extensions.join(",")}}`;

    resolveds.push({
      dirs: _dirs,
      extGlob: `**/*.${extGlob}`,
      extensions,
      exclude,
      ...extra,
    });
  }

  const fileReselveds: ResolvedScanDirFile<Extra>[] = [];

  for (const entries of resolveds) {
    for (const entry of entries.dirs) {
      if (existsSync(entry) && statSync(entry).isFile()) {
        fileReselveds.push({
          ...entries,
          file: entry,
          parent: entry,
        });
        continue;
      }

      fileReselveds.push(
        ...fg
          .sync(entries.extGlob, {
            ...entries,
            ignore: entries.exclude,
            cwd: entry,
            absolute: true,
            onlyFiles: true,
          })
          .map((file) => {
            return {
              ...entries,
              file,
              parent: entry,
            };
          }),
      );
    }
  }

  return fileReselveds;
}

/**
 * Resolves every `ResolvedScanDir` entry into the actual list of files:
 * direct file paths are kept as-is, directories are globbed with
 * `extGlob`/`exclude` via fast-glob.
 *
 * Accepts a single list or multiple lists of resolved scan dirs so
 * callers scanning several sources (e.g. components + composables)
 * can resolve them all in one call.
 */
export function resolveScanFiles(
  entries: Arrayable<ResolvedScanDir[]>,
): string[] {
  const lists = toArray(entries).flat();
  const files: string[] = [];

  for (const ntry of lists) {
    for (const dir of ntry.dirs) {
      // A dir entry can itself be a direct file path (e.g. a single
      // component file listed explicitly) — skip globbing in that case.
      if (existsSync(dir) && statSync(dir).isFile()) {
        files.push(dir);
        continue;
      }

      const found = fg.sync(ntry.extGlob, {
        ...ntry,
        ignore: ntry.exclude,
        cwd: dir,
        absolute: true,
        onlyFiles: true,
      });

      files.push(...found);
    }
  }

  return files;
}
