import { type ResolvableHead } from "@unhead/vue";
import type { UserConfig } from "vite";

import type { ComponentDir } from "@/components/types";
import type { PluginRouterOptions } from "@/router/unplugin";
import { type Arrayable } from "@/utils";

/** Shape of a `syora.config.*` file, as authored by the user. */
export interface SyoraConfig {
  // --- Project root ---------------------------------------------------

  /** Working directory from which relative paths are resolved. */
  cwd?: string;

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
}
