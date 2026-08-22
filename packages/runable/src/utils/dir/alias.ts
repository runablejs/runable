import { relative, resolve, sep } from "node:path";
import { normalizeDir } from ".";

/** Alias -> single directory, e.g. `{ '@': 'src', '@components': 'src/components' }`. */
export type AliasMap = Record<string, string>;

export type ViteAlias = { find: string; replacement: string };
export type TsconfigPaths = Record<string, string[]>;

/** Anything the user might reasonably pass in, in either convention. */
type AliasDirsInput = AliasMap | ViteAlias[] | TsconfigPaths;

type ResolveAliasDirsOptions = {
  /** Target consumer: shapes the output format. */
  for: "tsconfig" | "vite" | "map";
};

function isViteAliasArray(input: AliasDirsInput): input is ViteAlias[] {
  return Array.isArray(input);
}

function isTsconfigPaths(input: AliasDirsInput): input is TsconfigPaths {
  // tsconfig `paths` values are always arrays (multiple fallback dirs
  // per alias); a plain vite Record<string,string> never is.
  const values = Object.values(input as Record<string, unknown>);
  return values.length > 0 && values.every((v) => Array.isArray(v));
}

/**
 * Normalizes any accepted input shape (vite array, vite record, or
 * tsconfig paths) down to a plain alias -> dir map, stripping the
 * tsconfig `/*` glob suffix so both conventions can be compared and
 * re-emitted from a single source of truth.
 */
function normalizeToAliasMap(input: AliasDirsInput): AliasMap {
  if (isViteAliasArray(input)) {
    const map: AliasMap = {};
    for (const { find, replacement } of input) map[find] = replacement;
    return map;
  }

  if (isTsconfigPaths(input)) {
    const map: AliasMap = {};
    for (const [alias, dirs] of Object.entries(input)) {
      // Only the first candidate dir is kept: Runable resolves a single
      // directory per alias, tsconfig's multi-fallback isn't needed here.
      map[alias.replace(/\/\*$/, "")] = dirs[0]!.replace(/\/\*$/, "");
    }
    return map;
  }

  // Already a plain vite-style Record<string, string>.
  return input as AliasMap;
}

/**
 * Accepts an alias config in either tsconfig or vite convention and
 * emits whichever one `for` requires — converting when the input and
 * target conventions differ, and passing through unchanged when they
 * already match.
 */
export function resolveAliasDirs(
  cwd: string,
  dirs: AliasDirsInput,
  { for: target }: ResolveAliasDirsOptions,
): ViteAlias[] | TsconfigPaths | AliasMap {
  const aliasMap = normalizeToAliasMap(dirs);

  if (target === "map") return aliasMap;

  if (target === "vite") {
    return Object.entries(aliasMap).map(([find, dir]) => ({
      find,
      // Vite needs absolute paths to resolve correctly regardless of
      // which file is doing the importing.
      replacement: resolve(cwd, dir),
    }));
  }

  // tsconfig paths must stay relative (resolved against `baseUrl`) and
  // use the `/*` glob convention so subpath imports still work.
  const paths: TsconfigPaths = {};
  for (const [alias, dir] of Object.entries(aliasMap)) {
    const relDir = dir.startsWith(".") ? dir : `./${dir}`;
    paths[`${alias}/*`] = [`${relDir}/*`];
  }

  return paths;
}

/**
 * Resolves `dir` against the given alias map and returns the aliased
 * path, e.g. `resolveAlias({ '@components': 'src/components' }, 'src/components/Button.vue')`
 * -> `'@components/Button.vue'`.
 *
 * When multiple aliases match, the longest (most specific) directory
 * wins — e.g. `@components` over `@` for a path inside `src/components`,
 * so nested aliases take precedence over broader parent ones.
 *
 * Returns `dir` unchanged when no alias covers it, so the caller can
 * always use the result directly as an import path (relative fallback).
 */
export function resolveAlias(aliases: AliasMap, dir: string): string {
  let bestAlias: string | undefined;
  let bestDir: string | undefined;

  for (const [alias, aliasDir] of Object.entries(aliases)) {
    // Fast-path: skip directories that can't possibly contain `dir`
    // before paying for a `relative()` call.
    if (!dir.startsWith(aliasDir)) continue;

    const rel = relative(aliasDir, dir);

    // `relative` starting with '..' (or being absolute) means `dir` is
    // outside `aliasDir` — not a match.
    if (rel.startsWith("..") || rel === "") continue;
    if (rel.startsWith(`.${sep}`)) continue;

    // Prefer the most specific (longest) matching directory.
    if (!bestDir || aliasDir.length > bestDir.length) {
      bestAlias = alias;
      bestDir = aliasDir;
    }
  }

  if (!bestAlias || !bestDir) return dir;

  const rel = relative(bestDir, dir).split(sep).join("/");
  return `${bestAlias}/${rel}`;
}
