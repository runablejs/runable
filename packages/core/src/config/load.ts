import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";

import { loadConfig as c12Load } from "c12";
import cloneDeep from "lodash/cloneDeep.js";
import merge from "lodash/merge.js";

import type { ComponentDir } from "@/components/types";
import { normalizeDir } from "@/utils";

import { generateModulesOptionsDts } from "./modules-options.js";
import { resolveConfig, resolveConfig_v2 } from "./resolve.js";
import type { ModuleDefinition, SyoraConfig, ResolvedConfig } from "./types.js";

/**
 * `Config` after defaults have been applied by `resolveConfig`.
 * `_index` is internal bookkeeping, not part of the user-facing config.
 */
type ResolvedConfig0 = Required<SyoraConfig> & {
  cwd: string;
  components: ComponentDir[];

  /**
   * Load order across the main config and its modules, assigned in `loadAndCacheConfig`.
   * NOTE: with parallel module loading below, this now reflects completion
   * order (whichever `c12Load` resolves first), not declaration order.
   */
  _index: number;

  _name: string;

  _parentName?: string;

  _configFile?: string;

  _isSyoraModule?: boolean;

  /**
   * A module's resolved options (`defaults` merged with the consumer's
   * overrides) — only ever set for a config loaded on behalf of a `parent`
   * (see `loadAndCacheConfig`), never on the root app config. Read through
   * `getModuleOptions<OptionsT>()` rather than off this field directly, so
   * callers get it back typed instead of `unknown`.
   */
  _options?: unknown;
};

/** Subset of the config safe to forward to the client bundle. */
export type ClientConfig = Pick<
  SyoraConfig,
  "head" | "ssr" | "siteUrl" | "baseUrl"
>;

/**
 * Module-level cache of resolved configs, keyed by module name.
 * The root app config is stored under the reserved key `"__main"`.
 */
let cachedConfigs: Record<string, ResolvedConfig> | undefined;

/**
 * In-flight `loadAndCacheConfig` promises, keyed by module name. Lets multiple
 * modules that depend on the same shared module (a "diamond" dependency)
 * trigger it once instead of loading/merging it redundantly per parent —
 * matters once sibling modules are loaded in parallel (see below).
 */
let inFlight: Map<string, Promise<void>> | undefined;

/** Memoizes `resolveModuleDir` by name so repeated references only touch the filesystem once. */
let moduleDirCache: Map<string, string> | undefined;

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
 * to expose typed, overridable options, and a `setup` hook invoked once
 * those options are resolved (see `loadAndCacheConfig`).
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

/** Assigns each loaded config (main + modules) an incrementing `_index`, reset per `loadConfig()` call. */
let index = 0;

/**
 * Loads and resolves a single config (main app or one module), then recurses
 * into its own `modules`. Results are merged into `cachedConfigs[name]`.
 * Deduped via `inFlight`: a second call with the same `name` while the first
 * is still running just awaits the same promise instead of redoing the work.
 */
export async function loadAndCacheConfig({
  cwd,
  name = "__main",
  parent,
}: { cwd?: string; name?: string; parent?: ResolvedConfig } = {}) {
  inFlight ??= new Map();
  name = normalizeModuleName(name);

  const existing = inFlight.get(name);
  if (existing) return existing;

  const promise = (async () => {
    let { config: loaded, _configFile } = await c12Load<ModuleDefinition>({
      configFile: "syora.config",
      cwd,
    });

    // `configKey`/`defaults`/`setup`/`meta` only make sense for a module
    // (i.e. `defineModule`'d config); the rest is a plain `SyoraConfig` and
    // is resolved/merged exactly like before.
    const { configKey, defaults, setup, meta, ...rest } = loaded ?? {};
    let config = rest as ResolvedConfig;

    name = meta?.name ?? name;
    config.cwd = cwd ?? process.cwd();

    config = resolveConfig_v2(config);
    config._name = name;
    config._configFile = _configFile;

    cachedConfigs ??= {};
    config = merge(cloneDeep(cachedConfigs[name] ?? {}), config);

    if (typeof config._index !== "number") config._index = index++;

    if (parent && !config._parentName) {
      config._parentName = parent._name;
    }

    cachedConfigs[name] = config;

    // Only configs loaded on behalf of a `parent` are modules — the root
    // app config never goes through options resolution/`setup`.
    if (parent) {
      const key = configKey ?? meta?.name ?? name;
      const userOptions = (parent as Record<string, unknown>)[key];
      const resolvedDefaults =
        typeof defaults === "function" ? defaults(config) : defaults;

      const options = merge(
        cloneDeep(resolvedDefaults ?? {}),
        cloneDeep((userOptions as object) ?? {}),
      );

      cachedConfigs[name]!._options = options;

      await setup?.(options, config);
    }

    await loadModulesConfigs(config);
  })();

  inFlight.set(name, promise);
  return promise;
}

/**
 * Loads every module declared in `parent.modules`. Siblings are independent
 * I/O (separate config files/package resolution), so they're loaded in
 * parallel rather than one `await` at a time.
 */
async function loadModulesConfigs(parent: ResolvedConfig) {
  const modules = (parent.modules ?? []).map((name) =>
    name.startsWith(".")
      ? normalizeDir(relative(parent.cwd, resolve(parent.cwd, name)))
      : name,
  );

  await Promise.all(
    modules.map(async (name) => {
      const cwd = getModuleDir(name, parent);
      await loadAndCacheConfig({ cwd, name, parent });
    }),
  );
}

/**
 * Resolves a module name to the directory `loadAndCacheConfig` should treat as its `cwd`.
 * - `./relative/path` -> resolved directly against `parent.cwd`.
 * - bare package name -> resolved via `require.resolve` against `process.cwd()`,
 *   then `dist/` is appended, since Syora modules are expected to publish their
 *   built config output there rather than raw source.
 *
 * Synchronous (no real `await` was happening here before) and memoized by
 * name, so a module referenced by several parents only hits `require.resolve`
 * / `existsSync` once.
 */
function getModuleDir(name: string, parent: ResolvedConfig): string {
  moduleDirCache ??= new Map();

  const cached = moduleDirCache.get(name);
  if (cached) return cached;

  let cwd: string | undefined;

  if (name.startsWith(".")) cwd = resolve(parent.cwd, name);

  if (!cwd) {
    try {
      const require = createRequire(import.meta.url);
      const packageJsonPath = require.resolve(resolve(name, "package.json"), {
        paths: [process.cwd()],
      });

      cwd = join(dirname(packageJsonPath), "dist");
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
 * Loads the main config and all its modules into `cachedConfigs`. Idempotent:
 * subsequent calls are a no-op once a cache already exists.
 */
export async function loadConfig() {
  if (cachedConfigs) return;

  index = 0;
  cachedConfigs = undefined;
  inFlight = undefined;
  moduleDirCache = undefined;

  await loadAndCacheConfig();
  await generateModulesOptionsDts();
}

/** Returns the resolved main app config. Throws if `loadConfig()` hasn't run yet. */
export function useConfig(name = "__main") {
  if (!cachedConfigs || !cachedConfigs[name]) {
    throw new Error("Syora config is not loaded. Call loadConfig() first.");
  }

  return cachedConfigs[name];
}

/** Returns the resolved all app configs. Throws if `loadConfig()` hasn't run yet. */
export function useAllConfigs() {
  if (!cachedConfigs) {
    throw new Error("Syora config is not loaded. Call loadConfig() first.");
  }

  return Object.values(cachedConfigs).sort((a, b) => a._index - b._index);
}

/**
 * Returns a module's resolved options (`defaults` merged with whatever the
 * consumer provided at `configKey` — see `loadAndCacheConfig`). `OptionsT`
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

  const config = cachedConfigs[name];
  if (!config) {
    throw new Error(`Syora module "${name}" is not loaded.`);
  }

  return (config._options ?? {}) as OptionsT;
}
