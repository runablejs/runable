# runable

## 1.0.0-alpha.11

## 1.0.0-alpha.10

### Patch Changes

- [#59](https://github.com/runablejs/runable/pull/59) [`b129483`](https://github.com/runablejs/runable/commit/b129483a831db0812aa08213b2c0f910a2d4bebb) Thanks [@domutala](https://github.com/domutala)! - Call each `extendConfig` hook with its own resolved configuration and options.

## 1.0.0-alpha.9

### Minor Changes

- [#57](https://github.com/runablejs/runable/pull/57) [`5bed854`](https://github.com/runablejs/runable/commit/5bed854ef5541d52e008ec6b35ffbb5addd02bda) Thanks [@domutala](https://github.com/domutala)! - Add an `extendConfig` hook that can mutate or replace the fully resolved Runable configuration.

## 1.0.0-alpha.8

### Patch Changes

- [#53](https://github.com/runablejs/runable/pull/53) [`f6c9a82`](https://github.com/runablejs/runable/commit/f6c9a8232b3c6b29ec076808072d4d6d8c1ac44c) Thanks [@domutala](https://github.com/domutala)! - Fix generated application TypeScript configuration paths so aliases, source includes, configuration files, and local module directories resolve correctly from the build directory.

## 1.0.0-alpha.7

### Minor Changes

- [#51](https://github.com/runablejs/runable/pull/51) [`78f1a56`](https://github.com/runablejs/runable/commit/78f1a56275dc5b9fe32e09141b0ac222e3cacaf1) Thanks [@domutala](https://github.com/domutala)! - Add an `extendRoutes` configuration hook for modifying the complete file-based route tree before Vue Router writes generated routes and declarations.

- [#51](https://github.com/runablejs/runable/pull/51) [`3404609`](https://github.com/runablejs/runable/commit/34046096250242914ea90bc4b85952b840341ae2) Thanks [@domutala](https://github.com/domutala)! - Add a Nuxt-compatible `useFetch` composable with reactive requests and options, SSR-aware async data, caching, transforms, key picking, deduplication, timeouts, manual execution, and clearing.

## 1.0.0-alpha.6

### Minor Changes

- [#49](https://github.com/runablejs/runable/pull/49) [`9a99a77`](https://github.com/runablejs/runable/commit/9a99a77b87d51fc7d48c3adb7621c0d6f73104c4) Thanks [@domutala](https://github.com/domutala)! - Add `resolveRoute(path)` to `runable/inspector`: given an absolute path, resolves it against the project's routes using Vue Router's own matcher (the same one a real navigation would use), returning the matched `InspectorRoute` plus extracted `params`/`query`/`hash`, or `null` if nothing matches. Supports dynamic, optional, and catch-all params, nested routes, and `definePageMeta({ path, name })` overrides. Like every other Inspector getter, it reflects state as of the last `refresh()`.

### Patch Changes

- [#49](https://github.com/runablejs/runable/pull/49) [`10421c7`](https://github.com/runablejs/runable/commit/10421c750b224c72503dc4edde1909b93f8a1a5e) Thanks [@domutala](https://github.com/domutala)! - Validate that dynamically loaded server entries export a render function before handling SSR requests.

- [#49](https://github.com/runablejs/runable/pull/49) [`377d8e1`](https://github.com/runablejs/runable/commit/377d8e18c4f31580da5bbcc69c3241524d588454) Thanks [@domutala](https://github.com/domutala)! - Isolate the application context for concurrent SSR requests, avoid generated type writes and redundant configuration loading during production rendering, and resolve production manifest exports and server entry paths correctly.

- [#49](https://github.com/runablejs/runable/pull/49) [`6910aaf`](https://github.com/runablejs/runable/commit/6910aaf1d0757ac4e7e03b562a847a871c4cfdde) Thanks [@domutala](https://github.com/domutala)! - Fix `loadRuntimeEnv()` (used internally when resolving runtime config, e.g. by `runable/inspector`'s `getConfig()`) unconditionally writing an "injected env (...) from .env" notice to stdout via `dotenv` whenever a project's `.env` file defines any `RUN_`/`VITE_`-prefixed variable. This is now passed `quiet: true`, so loading runtime env stays silent on stdout — important for any host process that reserves stdout for something else, such as an MCP server speaking JSON-RPC over stdio.

## 1.0.0-alpha.4

### Minor Changes

- [#46](https://github.com/runablejs/runable/pull/46) [`180a915`](https://github.com/runablejs/runable/commit/180a915b441a2561ccc7be097139f9eb8e77f1a1) Thanks [@domutala](https://github.com/domutala)! - Add `runable/inspector`, a public, read-only API for programmatically inspecting how Runable resolves a project: `createRunableInspector({ rootDir })` returns an object with `getProject()`, `getConfig()`, `getRoutes()`, `getLayouts()`, `getMiddlewares()`, `getPlugins()`, `getModules()`, `getAutoImports()`, and `refresh()`. Every result is a plain, JSON-serializable value, and runtime environment variables follow Runable's existing public/private split — a private value's name is exposed, never its value. Built as the underlying primitive for future tooling (CLI diagnostics, IDE integrations, DevTools) to build on; it does not itself implement any of those.
  
  The Inspector itself never generates or modifies a Runable project/build file, never changes `process.cwd()`, and never touches the process-wide cache `loadConfig()`/`useConfig()`/`useAllConfigs()` use — each Inspector holds its own state, resolved and refreshed independently, so several can run concurrently for different projects (or alongside a live dev server in the same process) without their Runable-owned state interfering. This is powered by a new exported primitive, `resolveConfigGraph(rootDir)` (`runable`'s root export), which the existing `loadConfig()` now also uses internally — the two no longer duplicate the config/module resolution logic. Note that resolving a project's config still executes its `runable.config.*` files and module `setup()` hooks — ordinary project code, not sandboxed, that can have its own side effects (env vars, filesystem writes, ...) outside this isolation guarantee. As an incidental fix from threading `rootDir` explicitly through module resolution, a module referenced by another (non-root) module by a bare package name now resolves that package from the referencing module's own directory instead of always from `process.cwd()`.
