import { type ResolvableHead } from "@unhead/vue";
import type { UserConfig } from "vite";

import type { ComponentDir } from "@/components/types";
import type { PluginRouterOptions } from "@/router/unplugin";
import { type Arrayable } from "@/utils";
import type { RuntimeHooks } from "@/context/hook.js";

import type { ResolvedConfig } from "./load.js";

/** Shape of a `syora.config.*` file, as authored by the user. */
export interface SyoraConfig {
  // --- Project root ---------------------------------------------------

  /** Directory containing the Vue.js application's source code. */
  appDir?: string;

  // --- Application structure -----------------------------------------

  /** Routing options defining the application's pages. */
  pages?: PluginRouterOptions[];

  /** Paths to layout files/directories. */
  layouts?: string[];

  /** Directory(ies) containing global components to auto-register. */
  components?: Arrayable<ComponentDir>;

  /** Files of global functions, variables, or composables to auto-import in the application. */
  globals?: string[];

  /** Syora plugins to load, by name or relative path. */
  plugins?: string[];

  /** Names or relative paths of Syora modules to load alongside this config. */
  modules?: string[];

  /** Global CSS files to include in the application. */
  css?: string[];

  // --- Build & output -------------------------------------------------

  /** Build output mode/format. */
  output?: string;

  /** Destination directory for the build output. */
  distDir?: string;

  /** Base URL the application is served from (routes/assets prefix). */
  baseUrl?: string;

  /** Module resolution aliases (import path → actual path). */
  alias?: Record<string, string>;

  /** Additional Vite options, merged with Syora's internal config. */
  vite?: Omit<
    UserConfig,
    "ssr" | "appType" | "server" | "root" | "base" | "publicDir" | "syoraConfig"
  >;

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
   * Runs once the module's options are resolved (`defaults` merged with the
   * consumer's overrides). Use it to mutate/extend `config` — register
   * plugins, components dirs, globals, etc.
   */
  setup?: (options: OptionsT, config: ResolvedConfig) => void | Promise<void>;
}
