/**
 * Public, read-only, JSON-serializable representation of how Runable
 * resolves a project — see `createRunableInspector()` in `./index.js`.
 *
 * Every type here is intentionally a plain data shape (no Vue instances,
 * no Vite/Rollup objects, no functions, no classes, no `Map`/`Set`): the
 * Inspector is a public boundary meant for external tooling (MCP servers,
 * DevTools, CLI diagnostics, IDE integrations, tests), so every value it
 * returns must survive `JSON.stringify()` unchanged.
 */

export interface CreateRunableInspectorOptions {
  /**
   * Root directory of the Runable project to inspect.
   * @default process.cwd()
   */
  rootDir?: string;
}

export interface RunableInspector {
  /** General project info: root dir, Runable version, SSR flag, key paths. */
  getProject(): Promise<InspectorProject>;
  /** The resolved configuration, as a public/stable/serializable subset. */
  getConfig(): Promise<InspectorConfig>;
  /** Routes as Runable resolves them after file-based routing conventions. */
  getRoutes(): Promise<InspectorRoute[]>;
  /** Layouts discovered under the project's configured layout directories. */
  getLayouts(): Promise<InspectorLayout[]>;
  /** Navigation middlewares discovered under the project's middleware directories. */
  getMiddlewares(): Promise<InspectorMiddleware[]>;
  /** Vue plugins discovered under the project's plugin directories. */
  getPlugins(): Promise<InspectorPlugin[]>;
  /** Runable modules loaded alongside the main app config. */
  getModules(): Promise<InspectorModule[]>;
  /** Auto-imported components, composables, and globals. */
  getAutoImports(): Promise<InspectorAutoImports>;

  /**
   * Re-resolves the project from disk, so subsequent calls reflect changes
   * made after this Inspector was created (a page added, the config
   * changed, a module changed). Does not start or maintain a watcher —
   * call it explicitly whenever the caller knows something may have
   * changed.
   */
  refresh(): Promise<void>;
}

// --- getProject() ----------------------------------------------------------

export interface InspectorProject {
  /** Absolute root directory this Inspector was created for. */
  rootDir: string;
  /** Version of the `runable` package resolved for this project, if it could be determined. */
  runableVersion: string | undefined;

  /** Whether server-side rendering is enabled. */
  ssr: boolean;

  /**
   * Key project paths, relative to `rootDir` (see `rootDir` above for the
   * absolute base every other path in this object is relative to).
   */
  paths: {
    /** Directory containing the application's source code (pages, layouts, ...). */
    appDir: string;
    /** Directory Runable writes generated types/virtual-module output to (`.app` by default). */
    generatedDir: string;
    /** Build output directory (`.output` by default). */
    outputDir: string;
    /** Directory of static assets served as-is, or `undefined` if disabled (`publicDir: false`). */
    publicDir: string | undefined;
  };
}

// --- getConfig() ------------------------------------------------------------

export interface InspectorConfig {
  appDir: string;
  ssr: boolean;
  baseUrl: string | undefined;
  siteUrl: string | undefined;
  devtools: boolean | undefined;
  /** Default HTML `<head>` metadata, if it's a plain serializable value. */
  head: unknown;

  /**
   * Runtime configuration split the same way Runable itself splits it
   * (`RUN_PUBLIC_*`/`VITE_PUBLIC_*` vs. everything else — see
   * `loadRuntimeEnv()` in `utils/load-env.ts`).
   */
  runtime: {
    /** Public runtime values — safe to expose, shipped to the client bundle. */
    public: Record<string, unknown>;
    /**
     * Names (camelCased, prefix stripped) of the private runtime values
     * this project defines. Never their values — see the module doc for
     * why this boundary never returns a private runtime value.
     */
    privateKeys: string[];
  };
}

// --- getRoutes() -------------------------------------------------------------

export interface InspectorRoute {
  /** Route name, if Runable could resolve one. */
  name?: string;
  /** Resolved route path, e.g. `/users/:id`. */
  path: string;
  /** Page file this route renders, relative to `rootDir`. */
  file: string;
  /**
   * File of the layout route (e.g. `users.vue` for pages under `users/`)
   * this route is nested under, relative to `rootDir` — `undefined` for a
   * top-level route with no such wrapping file.
   */
  parent?: string;

  meta?: {
    /** Layout selection, as declared via `definePageMeta({ layout: ... })` — reproduced as-is, unvalidated against the project's actual layouts. */
    layout?: unknown;
    /** Middleware names applied to this route, as declared via `definePageMeta({ middleware: [...] })`. */
    middleware?: string[];
    /** Any other statically-declared `definePageMeta()` field not covered above. */
    [key: string]: unknown;
  };
}

// --- getLayouts() ------------------------------------------------------------

export interface InspectorLayout {
  /** Layout name, as registered under `:layouts` (camelCased relative path). */
  name: string;
  /** Layout file, relative to `rootDir`. */
  file: string;
}

// --- getMiddlewares() ---------------------------------------------------------

export interface InspectorMiddleware {
  /** Middleware name, as referenced from `definePageMeta({ middleware: [...] })`. */
  name: string;
  /** Middleware file, relative to `rootDir`. */
  file: string;
  /** Whether this middleware runs on every navigation (`*.global.*` file name) rather than only when referenced by name. */
  global: boolean;
}

// --- getPlugins() --------------------------------------------------------------

export interface InspectorPlugin {
  /**
   * Plugin name, if it could be statically determined from a
   * `defineVuePlugin({ name: "..." })` string literal. Runable itself only
   * requires a name when another plugin depends on it — most plugins have
   * none.
   */
  name?: string;
  /** Plugin file, relative to `rootDir`. */
  file: string;
  /** Execution priority group, if statically declared. */
  enforce?: "pre" | "post";
  /** Names of plugins this one depends on, if statically declared. */
  dependsOn?: string[];
}

// --- getModules() ---------------------------------------------------------------

export interface InspectorModule {
  /** Canonical module name (`meta.name`, its `configKey`, or the name/path it was referenced by). */
  name: string;
  /**
   * The module's own `runable.config.*` file, relative to `rootDir`
   * (absolute if it lives outside it, e.g. inside `node_modules`). A
   * module can be referenced by more than one parent config with
   * different specifiers (a diamond dependency) but only ever resolves to
   * one config file, so this — not the reference string — is what's
   * exposed here.
   */
  source: string;
  /** Key this module's options are configured under in the consumer's `runable.config`. */
  configKey?: string;
  /** `"local"` for a module whose config file lives inside `rootDir` (a `./relative/path` reference), `"package"` for one resolved from `node_modules`. */
  kind: "local" | "package";
}

// --- getAutoImports() -------------------------------------------------------------

export interface InspectorImport {
  /** Name available in application code without an explicit import. */
  name: string;
  /** Source file it's imported from, relative to `rootDir` when inside the project, absolute otherwise (e.g. a package inside `node_modules`). */
  file: string;
  /** Named export it resolves to, when different from `name` (e.g. re-exported under an alias). Omitted for a default export. */
  exportName?: string;
}

export interface InspectorComponent {
  /** Tag name the component is auto-registered as. */
  name: string;
  /** Component file, relative to `rootDir` when inside the project, absolute otherwise (a built-in Runable component). */
  file: string;
}

export interface InspectorAutoImports {
  components: InspectorComponent[];
  composables: InspectorImport[];
  globals: InspectorImport[];
}
