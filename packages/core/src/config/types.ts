import { type ResolvableHead } from "@unhead/vue";
import type { UserConfig } from "vite";

import type { ComponentDir, ResolvedComponentDir } from "@/components/types.js";
import type {
  RouterOptionsRaw,
  RouterOptionsRawResolved,
} from "@/router/types.js";
import type {
  AliasMap,
  ScanDir,
  Arrayable,
  ResolvedScanDirFile,
} from "@/utils";

/** Shape of a `syora.config.*` file, as authored by the user. */
export interface SyoraConfig {
  // --- Project root ---------------------------------------------------

  /** Directory containing the Vue.js application's source code. */
  appDir?: string;

  // --- Application structure -----------------------------------------

  /** Routing options defining the application's pages. */
  pages?: RouterOptionsRaw[];

  middlewares?: Arrayable<ComponentDir>;

  /** Paths to layout files/directories. */
  layouts?: Arrayable<ComponentDir>;

  /** Directory(ies) containing global components to auto-register. */
  components?: Arrayable<ComponentDir>;

  /** Directory(ies) containing composables to auto-import in the application. */
  composables?: Arrayable<ScanDir>;

  /** Directory(ies) containing global functions/variables to auto-import in the application. */
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

  distdir?: string;

  /** Base URL the application is served from (routes/assets prefix). */
  baseUrl?: string;

  /** Module resolution aliases (import path → actual path). */
  alias?: Record<string, string>;

  /** Additional Vite options, merged with Syora's internal config. */
  vite?: Omit<
    UserConfig,
    "ssr" | "appType" | "server" | "root" | "base" | "publicDir" | "syoraConfig"
  > & { server?: Omit<UserConfig["server"], "middlewareMode"> };

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
  /** Metadata about the module (name, required Syora version). */
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
   * Runs this module's `setup` before (`'pre'`) or after (`'post'`) modules
   * that declare no `enforce`, similar to Vite's plugin `enforce`. Omit for
   * the default, middle group.
   *
   * Combines with `dependOn`: a module can only `dependOn` a module in the
   * same or an earlier group (`pre` before default before `post`) — a `pre`
   * module declaring `dependOn` on a `post` one throws while configs are
   * loaded, instead of silently running out of order.
   */
  enforce?: "pre" | "post";

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
  /** Absolute path to the directory containing the Vue.js application's source code. */
  appDir: string;
  /** Resolved build output mode/format. */
  output: string;
  distdir: string;
  /** Resolved path to the directory of static assets served as-is, or `false` if disabled. */
  publicDir: string | false;

  /** Resolved directory(ies) containing global components to auto-register. */
  components: ResolvedComponentDir[];
  /** Resolved layout files/directories. */
  layouts: ResolvedScanDirFile[];
  /** Resolved directory(ies) containing global functions/variables to auto-import. */
  globals: ResolvedScanDirFile[];
  /** Resolved directory(ies) containing composables to auto-import. */
  composables: ResolvedScanDirFile[];
  /** Resolved routing options defining the application's pages. */
  pages: RouterOptionsRawResolved[];
  middlewares: ResolvedScanDirFile[];
  /** Resolved Syora plugins to load. */
  plugins: ResolvedScanDirFile[];
  /** Resolved global CSS files included in the application. */
  css: ResolvedScanDirFile[];

  /** Resolved module resolution aliases (import path → actual path). */
  alias: AliasMap;
  /** Names or relative paths of the Syora modules loaded alongside this config. */
  modules: string[];
  /** Whether server-side rendering (SSR) is enabled. */
  ssr: boolean;
  /** Resolved base URL the application is served from (routes/assets prefix). */
  baseUrl: string | undefined;
  /** Whether Syora's built-in developer tools (devtools) are enabled. */
  devtools: boolean | undefined;
  /** Resolved default HTML `<head>` metadata. */
  head: ResolvableHead | undefined;
  /** Resolved public site URL, used to generate absolute links (SEO, sitemap...). */
  siteUrl: string | undefined;
  /** The raw config as originally authored by the user, before defaults were applied. */
  defineConfig: SyoraConfig;
  /** Resolved additional Vite options, merged with Syora's internal config. */
  vite: SyoraConfig["vite"];

  // ------------------------------------------------

  /**
   * Working directory used to resolve this config's own relative paths.
   * @deprecated use **_cwd**
   * */
  cwd: string;
  /** Working directory used to resolve this config's own relative paths. */
  _cwd: string;

  /**
   * Load order across the main config and its modules, assigned in `loadAndCacheConfig`.
   * NOTE: with parallel module loading below, this now reflects completion
   * order (whichever `c12Load` resolves first), not declaration order.
   */
  _index: number;

  /** Name of this config: the app's own name, or the module's name/path as referenced in `modules`. */
  _name: string;

  /** Name of the parent config this one was loaded on behalf of, if this is a module config. */
  _parentName?: string;

  /** Absolute path to the config file this was loaded from, if any. */
  _configFile?: string;

  /** `true` if this config belongs to a Syora module rather than the root application. */
  _isSyoraModule?: boolean;

  /**
   * A module's resolved options (`defaults` merged with the consumer's
   * overrides) — only ever set for a config loaded on behalf of a `parent`
   * (see `loadAndCacheConfig`), never on the root app config. Read through
   * `getModuleOptions<OptionsT>()` rather than off this field directly, so
   * callers get it back typed instead of `unknown`.
   */
  _options?: unknown;

  /** Names of the configs whose `dependOn` lists reference this one. */
  _dependents: string[];

  /** This config's own `dependOn` list — the module names its `setup` must wait for. */
  _dependOn: string[];
};

/** Subset of the config safe to forward to the client bundle. */
export type ClientConfig = Pick<
  SyoraConfig,
  "head" | "ssr" | "siteUrl" | "baseUrl"
>;
