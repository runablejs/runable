import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";

import { loadConfig as c12Load } from "c12";
import cloneDeep from "lodash/cloneDeep.js";
import merge from "lodash/merge.js";

import type { ComponentDir } from "@/components/types";
import { normalizeDir } from "@/utils";

import { generateModulesDts } from "./dts.js";
import { resolveConfig } from "./resolve.js";
import type { SyoraConfig } from "./types.js";

/**
 * `Config` after defaults have been applied by `resolveConfig`.
 * `_index` is internal bookkeeping, not part of the user-facing config.
 */
export type ResolvedConfig = Required<SyoraConfig> & {
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

/** Identity helper so `syora.config.*` files get type-checking/autocomplete without a runtime cost. */
export function defineConfig(config: SyoraConfig): SyoraConfig {
  return config;
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

  const existing = inFlight.get(name);
  if (existing) return existing;

  const promise = (async () => {
    let { config, configFile } = await c12Load<ResolvedConfig>({
      configFile: "syora.config",
      cwd,
    });

    if (cwd) config.cwd ??= cwd;
    config = resolveConfig(config);
    cachedConfigs ??= {};
    config = merge(cloneDeep(cachedConfigs[name] ?? {}), config);

    config._name = name;
    config._configFile = configFile;

    if (typeof config._index !== "number") config._index = index++;

    if (parent && !config._parentName) {
      config._parentName = parent._name;
    }

    cachedConfigs[name] = config;

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
  await generateModulesDts();
}

/** Returns the resolved main app config. Throws if `loadConfig()` hasn't run yet. */
export function useConfig() {
  if (!cachedConfigs || !cachedConfigs["__main"]) {
    throw new Error("Syora config is not loaded. Call loadConfig() first.");
  }

  return cachedConfigs["__main"];
}

/** Returns the resolved all app configs. Throws if `loadConfig()` hasn't run yet. */
export function useAllConfigs() {
  if (!cachedConfigs) {
    throw new Error("Syora config is not loaded. Call loadConfig() first.");
  }

  return Object.values(cachedConfigs).sort((a, b) => a._index - b._index);
}
