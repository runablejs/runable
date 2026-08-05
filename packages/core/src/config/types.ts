import { type ResolvableHead } from "@unhead/vue";
import type { UserConfig } from "vite";

import type { ComponentDir, ResolvedComponentDir } from "@/components/types.js";
import type {
  RouterOptionsRaw,
  RouterOptionsRawResolved,
} from "@/router/types.js";
import type { AliasMap, ResolvedScanDir, ScanDir, Arrayable } from "@/utils";

/** Shape of a `syora.config.*` file, as authored by the user. */
export interface SyoraConfig {
  // --- Project root ---------------------------------------------------

  /** Directory containing the Vue.js application's source code. */
  appDir?: string;

  // --- Application structure -----------------------------------------

  /** Routing options defining the application's pages. */
  pages?: RouterOptionsRaw[];

  /** Paths to layout files/directories. */
  layouts?: Arrayable<ComponentDir>;

  /** Directory(ies) containing global components to auto-register. */
  components?: Arrayable<ComponentDir>;

  /** Files of composables to auto-import in the application. */
  composables?: Arrayable<ComponentDir>;

  /** Files of global functions, variables, to auto-import in the application. */
  globals?: Arrayable<ScanDir>;

  /** Syora plugins to load, by name or relative path. */
  plugins?: Arrayable<ScanDir>;

  /** Names or relative paths of Syora modules to load alongside this config. */
  modules?: string[];

  /** Global CSS files to include in the application. */
  css?: Arrayable<ScanDir>;

  // --- Build & output -------------------------------------------------

  /** Build output mode/format. */
  output?: string;

  /** Base URL the application is served from (routes/assets prefix). */
  baseUrl?: string;

  /** Module resolution aliases (import path → actual path). */
  alias?: Record<string, string>;

  /** Additional Vite options, merged with Syora's internal config. */
  vite?: Omit<
    UserConfig,
    "ssr" | "appType" | "server" | "root" | "base" | "publicDir" | "syoraConfig"
  > & { server: Omit<UserConfig["server"], "middlewareMode"> };

  /** Directory of static assets served as-is. */
  publicDir?: UserConfig["publicDir"];

  // --- Site metadata ----------------------------------------------------

  /** Public site URL, used to generate absolute links (SEO, sitemap...). */
  siteUrl?: string;

  /** Default HTML `<head>` metadata (title, meta tags, links...). */
  head?: ResolvableHead;

  // --- Runtime behavior ---------------------------------------------------

  /** Enables server-side rendering (SSR). */
  ssr?: boolean;

  /** Enables Syora's built-in developer tools (devtools). */
  devtools?: boolean;

  // --- Escape hatch -----------------------------------------------------

  /**
   * Lets a module read/write its own options under an arbitrary key, e.g.
   * `{ myModule: { foo: 'bar' } }`. Not meant to be typed manually — modules
   * declare the shape of their own options via `defineModule`'s `OptionsT`.
   */
  [key: string]: unknown;
}

// --- Modules ------------------------------------------------------------

/** Metadata describing a Syora module. */
export interface ModuleMeta {
  /** Module name. Used for logs and as a fallback `configKey`. */
  name?: string;

  /** Minimum Syora version required by the module (informational only). */
  version?: string;
}

/**
 * Shape of a `syora.config.*` file authored via `defineModule`.
 *
 * Extends `SyoraConfig` so a module can ship its own layers (plugins,
 * components, layouts...) exactly like a regular config, while adding the
 * module-specific plumbing: typed options (`OptionsT`), their default
 * values, the key consumers use to override them, and a `setup` hook run
 * once those options are resolved.
 */
export interface ModuleDefinition<
  OptionsT extends Record<string, any> = Record<string, any>,
> extends SyoraConfig {
  /** Module metadata. */
  meta?: ModuleMeta;

  /**
   * Key under which consumers configure this module's options in their own
   * `syora.config`, e.g. `defineConfig({ myModule: { foo: 'bar' } })`.
   * Falls back to `meta.name`, then to the name/path the module was
   * referenced by in the parent's `modules` array.
   */
  configKey?: string;

  /**
   * Default values for the module's options (`OptionsT`). Merged with
   * whatever the consumer provides at `configKey` — consumer values win.
   * Can also be a function of the module's own resolved config.
   */
  defaults?: OptionsT | ((config: SyoraConfig) => OptionsT);

  /**
   * Names of other modules whose `setup` must complete before this
   * module's own `setup` runs. Names must match the target module's own
   * name — `meta.name` if it declares one, otherwise the name/path it's
   * referenced by. Modules with no ordering constraint between them run
   * their `setup` in parallel.
   *
   * Referencing a module that doesn't exist in the graph throws while
   * configs are loaded; a circular chain (A depends on B depends on A)
   * throws once setups run instead of deadlocking.
   */
  dependOn?: string[];

  /**
   * Runs once the module's options are resolved (`defaults` merged with the
   * consumer's overrides). Use it to mutate/extend `config` — register
   * plugins, components dirs, globals, etc.
   */
  setup?: (options: OptionsT, config: ResolvedConfig) => void | Promise<void>;
}

/**
 * `Config` after defaults have been applied by `resolveConfig`.
 * `_index` is internal bookkeeping, not part of the user-facing config.
 */
export type ResolvedConfig = {
  appDir: string;
  output: string;
  publicDir: string | false;

  components: ResolvedComponentDir[];
  layouts: ResolvedScanDir[];
  globals: ResolvedScanDir[];
  composables: ResolvedScanDir[];
  pages: RouterOptionsRawResolved[];
  plugins: ResolvedScanDir[];
  css: ResolvedScanDir[];

  alias: AliasMap;
  modules: string[];
  ssr: boolean;
  baseUrl: string | undefined;
  devtools: boolean | undefined;
  head: ResolvableHead | undefined;
  siteUrl: string | undefined;
  defineConfig: SyoraConfig;
  vite: SyoraConfig["vite"];

  // ------------------------------------------------

  cwd: string;
  _cwd: string;

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

  _dependents: string[];

  _dependOn: string[];
};
