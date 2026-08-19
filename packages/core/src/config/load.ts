import { existsSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import { loadConfig as c12Load } from "c12";
import cloneDeep from "lodash/cloneDeep.js";
import merge from "lodash/merge.js";

import { normalizeDir, resolvePackageDir } from "@/utils";
import { generateModulesOptionsDts } from "./modules-options.js";
import { resolveConfig } from "./resolve.js";
import type { ModuleDefinition, SyoraConfig, ResolvedConfig } from "./types.js";

/**
 * Module-level cache of resolved configs, keyed by module name.
 * The root app config is stored under the reserved key `"__main"`.
 */
let cachedConfigs: Record<string, ResolvedConfig> | undefined;

/** Memoizes `getModuleDir` by name so repeated references only touch the filesystem once. */
let moduleDirCache: Map<string, string> | undefined;

/** Maps every declared module reference to the canonical name used in `cachedConfigs`. */
let moduleNameAliases: Map<string, string> | undefined;

/**
 * Falls back to a clean camelCase identifier when `name` is a filesystem
 * path (a local module declared as `"./modules/my-module"`, stored as
 * `"modules/my-module"` on `_name`) rather than a bare/scoped package name —
 * keeps only the last path segment, camel-cased. Left untouched otherwise.
 */
function normalizeModuleName(name: string): string {
  const isPath =
    (name.includes("/") || name.includes("\\")) && !name.startsWith("@");
  if (!isPath) return name;

  const base =
    name.replace(/\\/g, "/").replace(/\/+$/, "").split("/").pop() ?? name;

  return base
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char: string) => char.toUpperCase())
    .replace(/^[^a-zA-Z_$]+/, "");
}

/** Identity helper so `syora.config.*` files get type-checking/autocomplete without a runtime cost. */
export function defineConfig(config: SyoraConfig): SyoraConfig {
  return config;
}

/**
 * Identity helper for authoring a Syora module's `syora.config.*` file.
 * Builds on top of `defineConfig`: a module can declare everything a regular
 * config can (plugins, components, layouts...), plus `configKey`/`defaults`
 * to expose typed, overridable options, a `setup` hook invoked once every
 * config in the graph has been resolved (see `runSetups`), and `dependOn` /
 * `enforce` to order that hook relative to other modules' setups.
 *
 * @example
 * export default defineModule<{ prefix: string }>({
 *   meta: { name: "my-module" },
 *   configKey: "myModule",
 *   defaults: { prefix: "/api" },
 *   setup(options, config) {
 *     config.plugins.push(resolve(__dirname, "runtime/plugin.js"));
 *   },
 * });
 */
export function defineModule<
  OptionsT extends Record<string, any> = Record<string, any>,
>(moduleDef: ModuleDefinition<OptionsT>): ModuleDefinition<OptionsT> {
  moduleDef._isSyoraModule = true;

  return moduleDef;
}

/* ------------------------------------------------------------------------ *
 * Phase 1 — discovery
 *
 * Load every syora.config in the graph (main + modules, transitively) into
 * a flat map, keyed by name. No resolution, no setup — just I/O plus enough
 * bookkeeping (`dependents`) for phase 2 to merge options without re-reading
 * any file. A module referenced by several parents (diamond dependency) is
 * only loaded once; later references just add themselves to its dependents.
 * ------------------------------------------------------------------------ */

type RawEntry = {
  /** Canonical name of this config — `meta.name` if declared, otherwise the name/path it was referenced by. */
  name: string;
  /** Directory this config's `syora.config` file was loaded from. */
  cwd: string;
  /** Absolute path to the config file that was loaded, if any. */
  configFile?: string;
  /** The raw config as returned by `c12Load`, before `resolveConfig` runs on it. */
  loaded: ModuleDefinition;
  /** Names of the configs whose `modules` list references this one. Empty for the root. */
  dependents: Set<string>;
  /** Position in discovery (completion) order — carried over to `_index` on the resolved config. */
  index: number;
};

/** Same transform `modules` entries go through before being treated as a name / passed to `getModuleDir`. */
function resolveModuleName(name: string, dirCwd: string): string {
  return name.startsWith(".")
    ? normalizeDir(relative(dirCwd, resolve(dirCwd, name)))
    : name;
}

/**
 * Resolves a module name to the directory its `syora.config` should be
 * loaded from.
 * - `./relative/path` -> resolved directly against `parentCwd`.
 * - bare package name -> resolved via `require.resolve` against
 *   `process.cwd()`, then `dist/` is appended, since Syora modules are
 *   expected to publish their built config output there rather than raw
 *   source.
 *
 * Synchronous and memoized by name, so a module referenced by several
 * parents only hits `require.resolve` / `existsSync` once.
 */
function getModuleDir(name: string, parentCwd: string): string {
  moduleDirCache ??= new Map();

  const cached = moduleDirCache.get(name);
  if (cached) return cached;

  let cwd: string | undefined;

  if (name.startsWith(".")) cwd = resolve(parentCwd, name);

  if (!cwd) {
    try {
      const packageJsonPath = resolvePackageDir(name);
      cwd = join(packageJsonPath, "dist");
    } catch {
      // Package not found in node_modules — fall through to the error below.
    }
  }

  if (!cwd || !existsSync(cwd)) {
    throw new Error(
      `Failed to resolve Syora module "${name}". The module was not found in the local "modules/" directory and could not be resolved from "node_modules".`,
    );
  }

  moduleDirCache.set(name, cwd);
  return cwd;
}

/**
 * Loads the full module graph (main config + every module it transitively
 * depends on) into a flat `name -> RawEntry` map. Siblings load in parallel
 * via the `inFlight` map, which also serves as the sole dedup mechanism.
 */
async function loadAllConfigs(
  rootCwd?: string,
): Promise<Map<string, RawEntry>> {
  const entries = new Map<string, RawEntry>();
  const inFlight = new Map<string, Promise<RawEntry>>();
  const dependencies = new Map<string, Set<string>>();
  let index = 0;

  function findDependencyPath(
    from: string,
    target: string,
    visited = new Set<string>(),
  ): string[] | undefined {
    if (from === target) return [from];
    if (visited.has(from)) return;
    visited.add(from);

    for (const dependency of dependencies.get(from) ?? []) {
      const path = findDependencyPath(dependency, target, visited);
      if (path) return [from, ...path];
    }
  }

  function addDependency(from: string, to: string) {
    const moduleDependencies = dependencies.get(from) ?? new Set<string>();
    moduleDependencies.add(to);
    dependencies.set(from, moduleDependencies);

    const pathToParent = findDependencyPath(to, from);
    if (pathToParent) {
      throw new Error(
        `Circular module dependency detected: ${[from, ...pathToParent].join(" -> ")}.`,
      );
    }
  }

  async function load(
    rawName: string,
    cwd: string | undefined,
    dependent?: string,
  ): Promise<RawEntry> {
    const name = normalizeModuleName(rawName);

    let promise = inFlight.get(name);
    if (!promise) {
      promise = (async (): Promise<RawEntry> => {
        const { config: loaded, _configFile: configFile } =
          await c12Load<ModuleDefinition>({ configFile: "syora.config", cwd });

        const resolvedName =
          rawName === "__main" ? "__main" : (loaded?.meta?.name ?? name);
        const entryCwd = cwd ?? process.cwd();

        const entry: RawEntry = {
          name: resolvedName,
          cwd: entryCwd,
          configFile,
          loaded: loaded ?? ({} as ModuleDefinition),
          dependents: new Set(),
          index: index++,
        };

        entries.set(resolvedName, entry);

        const childModules = (entry.loaded.modules ?? []).map((childName) =>
          resolveModuleName(childName, entryCwd),
        );

        for (const childName of childModules) {
          addDependency(name, normalizeModuleName(childName));
        }

        await Promise.all(
          childModules.map((childName) =>
            load(childName, getModuleDir(childName, entryCwd), resolvedName),
          ),
        );

        return entry;
      })();

      inFlight.set(name, promise);
    }

    const entry = await promise;
    moduleNameAliases?.set(normalizeDir(rawName), entry.name);
    moduleNameAliases?.set(normalizeModuleName(rawName), entry.name);
    if (dependent) entry.dependents.add(dependent);
    return entry;
  }

  await load("__main", rootCwd);
  return entries;
}

/* ------------------------------------------------------------------------ *
 * Phase 2 — resolution
 *
 * `resolveConfig` each entry (no `setup` yet). A module's `_options` is the
 * merge of its `defaults` with what *every* dependent declared under its
 * `configKey` — not just whichever parent happened to trigger its load, as
 * the previous per-parent loading made it.
 * ------------------------------------------------------------------------ */

type PendingSetup = {
  /** The module's resolved config, passed to `setup` as its second argument. */
  config: ResolvedConfig;
  /** The module's resolved options, passed to `setup` as its first argument. */
  options: Record<string, unknown>;
  /** The module's `setup` hook, if it declared one. */
  setup?: ModuleDefinition["setup"];
  /** Canonical names of modules whose `setup` must run before this one's. */
  dependOn: string[];
  /** The module's `enforce` group, used to place it in the right wave (see `enforceRank`). */
  enforce: ModuleDefinition["enforce"];
};

/** `pre` < default < `post`, used to order `enforce` groups and validate `dependOn` against them. */
function enforceRank(enforce: ModuleDefinition["enforce"]): number {
  return enforce === "pre" ? 0 : enforce === "post" ? 2 : 1;
}

/**
 * Resolves every entry's config via `resolveConfig` and, for entries that
 * are modules (i.e. have at least one dependent), merges their options and
 * validates their `dependOn`/`enforce`. Returns the resolved configs keyed
 * by name, plus the list of modules still needing their `setup` run.
 */
function resolveAllConfigs(entries: Map<string, RawEntry>): {
  resolved: Record<string, ResolvedConfig>;
  pendingSetups: PendingSetup[];
} {
  const resolved: Record<string, ResolvedConfig> = {};
  const pendingSetups: PendingSetup[] = [];

  for (const entry of entries.values()) {
    const { configKey, defaults, setup, dependOn, enforce, meta, ...rest } =
      entry.loaded;
    const config = rest as ResolvedConfig;
    config.cwd = entry.cwd;

    const rConfig = resolveConfig(config);
    rConfig._name = entry.name;
    rConfig._configFile = entry.configFile;
    rConfig._isSyoraModule = entry.loaded._isSyoraModule as boolean;
    rConfig._dependents = [...entry.dependents];
    rConfig._index = entry.index;

    // Only a config loaded on behalf of a dependent is a module — the root
    // app config never goes through options resolution/`setup`.
    if (entry.dependents.size > 0) {
      const key = configKey ?? meta?.name ?? entry.name;
      rConfig._configKey = key;
      const resolvedDefaults =
        typeof defaults === "function" ? defaults(rConfig) : defaults;

      let options = cloneDeep(resolvedDefaults ?? {});
      for (const dependentName of entry.dependents) {
        const dependentOptions = (
          entries.get(dependentName)?.loaded as
            | Record<string, unknown>
            | undefined
        )?.[key];
        options = merge(options, cloneDeep(dependentOptions ?? {}));
      }

      for (const depName of dependOn ?? []) {
        const depEntry = entries.get(depName);
        if (!depEntry) {
          throw new Error(
            `Module "${entry.name}" declares dependOn: "${depName}", but no module with that name was found.`,
          );
        }

        if (enforceRank(depEntry.loaded.enforce) > enforceRank(enforce)) {
          throw new Error(
            `Module "${entry.name}" (enforce: "${enforce ?? "default"}") cannot dependOn "${depName}" (enforce: "${depEntry.loaded.enforce ?? "default"}") — a module can only dependOn modules in the same or an earlier enforce group.`,
          );
        }
      }

      rConfig._options = options;
      pendingSetups.push({
        config: rConfig,
        options,
        setup,
        dependOn: dependOn ?? [],
        enforce,
      });
    }

    resolved[entry.name] = rConfig;
  }

  return { resolved, pendingSetups };
}

/* ------------------------------------------------------------------------ *
 * Phase 3 — setup
 *
 * Every config in the graph is resolved and every module's `_options`
 * already reflects all of its dependents. Setups run in three sequential
 * waves by `enforce` (`pre`, then default, then `post`) — a later wave only
 * starts once the previous one has fully completed. Within a wave, `run` is
 * memoized (like `load` in phase 1) so a module referenced by several
 * `dependOn` lists only runs its `setup` once and, absent a `dependOn`
 * between them, runs in parallel with its wave-mates. `dependOn` on an
 * earlier-wave module resolves instantly (already done); cycles (A depends
 * on B depends on A) are caught via `visiting` instead of deadlocking.
 * ------------------------------------------------------------------------ */

async function runSetups(pendingSetups: PendingSetup[]) {
  const byName = new Map(pendingSetups.map((p) => [p.config._name, p]));
  const done = new Map<string, Promise<void>>();
  const visiting = new Set<string>();

  function run(name: string): Promise<void> {
    const cached = done.get(name);
    if (cached) return cached;

    const pending = byName.get(name);
    if (!pending) return Promise.resolve();

    if (visiting.has(name)) {
      throw new Error(
        `Circular "dependOn": "${name}" depends on itself, directly or transitively.`,
      );
    }
    visiting.add(name);

    const promise = (async () => {
      await Promise.all(pending.dependOn.map(run));
      const _config = await pending.setup?.(
        pending.options,
        cachedConfigs?.__main ?? pending.config,
      );

      if (_config && cachedConfigs?.__main) {
        merge(cachedConfigs.__main._runtime, _config._runtime);
      }
    })();

    done.set(name, promise);
    return promise;
  }

  const waves: PendingSetup[][] = [[], [], []]; // pre, default, post
  for (const pending of pendingSetups) {
    waves[enforceRank(pending.enforce)]?.push(pending);
  }

  for (const wave of waves) {
    await Promise.all(wave.map((p) => run(p.config._name)));
  }
}

/**
 * Loads the main config and all its modules into `cachedConfigs`. Idempotent:
 * subsequent calls are a no-op once a cache already exists.
 */
export async function loadConfig() {
  if (cachedConfigs) return;

  // Clear any stale module directory resolutions before this fresh load.
  moduleDirCache = undefined;
  moduleNameAliases = new Map();

  const entries = await loadAllConfigs();
  const { resolved, pendingSetups } = resolveAllConfigs(entries);

  cachedConfigs = resolved;

  try {
    await generateModulesOptionsDts();
    await runSetups(pendingSetups);
  } catch (error) {
    cachedConfigs = undefined;
    moduleDirCache = undefined;
    moduleNameAliases = undefined;
    throw error;
  }
}

/**
 * Returns a resolved config by name — the root app config by default
 * (`"__main"`), or a specific module's config. Throws if `loadConfig()`
 * hasn't run yet.
 */
export function useConfig(name = "__main") {
  if (!cachedConfigs || !cachedConfigs[name]) {
    throw new Error("Syora config is not loaded. Call loadConfig() first.");
  }

  return cachedConfigs[name];
}

/**
 * Returns every resolved config in the graph (app + modules), sorted by
 * load order (`_index`). Throws if `loadConfig()` hasn't run yet.
 */
export function useAllConfigs() {
  if (!cachedConfigs) {
    throw new Error("Syora config is not loaded. Call loadConfig() first.");
  }

  return Object.values(cachedConfigs).sort((a, b) => a._index - b._index);
}

/**
 * Returns a module's resolved options (`defaults` merged with what every
 * dependent declared at `configKey` — see `resolveAllConfigs`). `OptionsT`
 * isn't inferred from anything at runtime — nothing survives to tell us
 * which `defineModule<OptionsT>` a given module was declared with — so pass
 * it explicitly to get a typed result back instead of `unknown`.
 *
 * `name` accepts the same forms as `modules` entries in a config (a bare
 * package name or a `"./relative/path"`) — it's normalized the same way
 * before the cache lookup.
 *
 * @example
 * const { root } = getModuleOptions<{ root?: string }>("content");
 */
export function getModuleOptions<
  OptionsT extends Record<string, any> = Record<string, any>,
>(name: string): OptionsT {
  if (!cachedConfigs) {
    throw new Error("Syora config is not loaded. Call loadConfig() first.");
  }

  const resolvedName = resolveModuleName(name, process.cwd());
  const canonicalName =
    moduleNameAliases?.get(normalizeDir(resolvedName)) ??
    moduleNameAliases?.get(normalizeModuleName(resolvedName)) ??
    normalizeModuleName(resolvedName);
  const config = cachedConfigs[canonicalName];
  if (!config) {
    throw new Error(`Syora module "${name}" is not loaded.`);
  }

  return (config._options ?? {}) as OptionsT;
}
