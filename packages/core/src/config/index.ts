import { loadConfig as c12Load } from "c12";
import { resolveConfig } from "./resolve";
import { type ResolvableHead } from "@unhead/vue";
import type { UserConfig } from "vite";
import { normalizeDir, type Arrayable } from "@/utils";
import type { ComponentDir } from "@/components/types";
import { dirname, join, relative, resolve } from "node:path";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import merge from "lodash/merge.js";
import type { PluginRouterOptions } from "@/router/unplugin";

/** Shape of a `syora.config.*` file, as authored by the user. */
export type Config = {
  cwd?: string;

  appDir?: string;

  globals?: string[];

  plugins?: string[];

  layouts?: string[];

  pages?: PluginRouterOptions[];

  components?: Arrayable<ComponentDir>;
  css?: string[];

  output?: string;

  distDir?: string;

  baseUrl?: string;

  ssr?: boolean;
  devtools?: boolean;

  alias?: Record<string, string>;

  /** Names or relative paths of Syora modules to load alongside this config. */
  modules?: string[];

  siteUrl?: string;
  head?: ResolvableHead;

  vite?: Omit<
    UserConfig,
    "ssr" | "appType" | "server" | "root" | "base" | "publicDir" | "syoraConfig"
  >;

  publicDir?: UserConfig["publicDir"];
};

/**
 * `Config` after defaults have been applied by `resolveConfig`.
 * `_index` is internal bookkeeping, not part of the user-facing config.
 */
export type ResolvedConfig = Required<Config> & {
  cwd: string;
  components: ComponentDir[];

  /**
   * Load order across the main config and its modules, assigned in `_loadConfig`.
   * NOTE: with parallel module loading below, this now reflects completion
   * order (whichever `c12Load` resolves first), not declaration order.
   */
  _index: number;

  _name: string;
};

/** Subset of the config safe to forward to the client bundle. */
export type ClientConfig = Pick<Config, "head" | "ssr" | "siteUrl" | "baseUrl">;

/**
 * Module-level cache of resolved configs, keyed by module name.
 * The root app config is stored under the reserved key `"__main"`.
 */
let cachedConfigs: Record<string, ResolvedConfig> | undefined;

/**
 * In-flight `_loadConfig` promises, keyed by module name. Lets multiple
 * modules that depend on the same shared module (a "diamond" dependency)
 * trigger it once instead of loading/merging it redundantly per parent —
 * matters once sibling modules are loaded in parallel (see below).
 */
let inFlight: Map<string, Promise<void>> | undefined;

/** Memoizes `resolveModuleDir` by name so repeated references only touch the filesystem once. */
let moduleDirCache: Map<string, string> | undefined;

/** Identity helper so `syora.config.*` files get type-checking/autocomplete without a runtime cost. */
export function defineConfig<TConfig extends Config>(config: TConfig): TConfig {
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
export async function _loadConfig({
  cwd,
  name = "__main",
}: { cwd?: string; name?: string } = {}) {
  inFlight ??= new Map();

  const existing = inFlight.get(name);
  if (existing) return existing;

  const promise = (async () => {
    let { config } = await c12Load<ResolvedConfig>({
      configFile: "syora.config",
      cwd,
    });

    if (cwd) config.cwd ??= cwd;
    config = resolveConfig(config);

    config._name = name;
    if (typeof config._index !== "number") config._index = index++;

    cachedConfigs ??= {};
    cachedConfigs[name] = merge(
      cachedConfigs[name] ?? {},
      config,
    ) as ResolvedConfig;

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
      await _loadConfig({ cwd, name });
    }),
  );
}

/**
 * Resolves a module name to the directory `_loadConfig` should treat as its `cwd`.
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

  await _loadConfig();
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
