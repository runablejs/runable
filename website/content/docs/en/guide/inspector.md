---
title: Inspector
description: Programmatically inspect how Runable resolves a project — routes, layouts, middleware, plugins, modules, and auto-imports.
---

`runable/inspector` is a read-only, public API that answers one question: **how does Runable currently interpret this project?** It reuses Runable's own resolution — the same conventions that turn `app/pages/users/[id].vue` into a route, or a `composables/` directory into auto-imports — instead of a second, separate implementation of them.

It's meant as a building block for external tooling — a CLI diagnostic, an IDE extension, a DevTools panel, a test — anything that needs a structured, JSON-serializable view of a Runable project. It is not itself an MCP server, a DevTools UI, or an IDE extension; those can be built on top of it.

## Create an inspector

```ts
import { createRunableInspector } from "runable/inspector";

const inspector = await createRunableInspector({
  rootDir: process.cwd(), // optional, this is the default
});
```

`rootDir` must directly contain a `runable.config.*` file — the Inspector does not search parent directories. Pointing it at a directory that isn't a Runable project rejects with a `RunableInspectorError` describing exactly what's missing.

## Read the project

Every method is async and returns a plain, `JSON.stringify()`-safe value — no Vue instances, no Vite/Rollup objects, no functions.

```ts
const project = await inspector.getProject();
// { rootDir, runableVersion, ssr, paths: { appDir, generatedDir, outputDir, publicDir } }

const routes = await inspector.getRoutes();
// [{ name: "users-id", path: "/users/:id", file: "app/pages/users/[id].vue", parent: "app/pages/users.vue" }, ...]

const layouts = await inspector.getLayouts();
const middlewares = await inspector.getMiddlewares();
const plugins = await inspector.getPlugins();
const modules = await inspector.getModules();

const { components, composables, globals } = await inspector.getAutoImports();
// answers "does useCurrency() exist in this project?" or "what file is BaseButton?"
```

File paths are relative to `rootDir` (a file outside it, e.g. a dependency package, stays absolute) — pair them with `project.rootDir` to get an absolute path back.

## Resolving a route

Given a path, `resolveRoute()` answers "which route matches this, and with what params?" — using Vue Router's own matcher against the routes `getRoutes()` would return, so dynamic (`:id`), optional (`:slug?`), catch-all (`:slug(.*)`), and nested routes all resolve exactly as a real navigation would.

```ts
const match = await inspector.resolveRoute("/users/42");

if (match) {
  console.log(match.route.file); // "app/pages/users/[id].vue"
  console.log(match.params); // { id: "42" }
}
```

`path` must be absolute (start with `/`); anything else rejects with a `RunableInspectorError`. When nothing matches, `resolveRoute()` returns `null` — it never throws for that. A `?query` and `#hash` on `path` are parsed and returned (`match.query`, `match.hash`) but don't affect which route matches; matching itself only considers the path.

Like every other getter, `resolveRoute()` reflects the state as of the last `refresh()` — it doesn't reach out to the filesystem on every call.

## Configuration and runtime privacy

`getConfig()` returns a stable, public subset of the resolved configuration — not Runable's full internal config object, which carries Vite plugins, functions, and other values that don't belong on a public boundary.

Runtime environment variables follow the same public/private split Runable itself uses everywhere else (`RUN_PUBLIC_*`/`VITE_PUBLIC_*` vs. everything else): public values are returned as-is, private ones are exposed **by key name only**, never their value.

```ts
const config = await inspector.getConfig();
console.log(config.runtime.public); // { apiBase: "/api" }
console.log(config.runtime.privateKeys); // ["databaseUrl", "secretKey"]
```

## Refreshing

An Inspector snapshots the project when it's created and caches each result the first time it's requested. If the project changes while it stays open (a page added, the config edited, a module changed), call `refresh()` to re-resolve everything before reading again:

```ts
await inspector.refresh();
const routes = await inspector.getRoutes(); // reflects the new state
```

There's no background watcher — `refresh()` is explicit, so the Inspector stays cheap to create and doesn't hold a file watcher open for callers that only need a one-off snapshot (a CLI command, a test).

## What "read-only" actually guarantees

"Read-only" describes what the Inspector **itself** does, not a sandbox around the project it inspects:

- The Inspector itself does not generate or modify a Runable project/build file — not even `.app/`, which `runable prepare`/`build` do write to.
- It does not mutate `process.cwd()`.
- It does not touch the process-wide cache `loadConfig()`/`useConfig()`/`useAllConfigs()` use elsewhere in your process — a live dev server running alongside it is unaffected, in both directions.
- Because of that, Inspector instances don't share Runable's resolved configuration state or caches, and don't interfere with each other through `process.cwd()`.

None of that means "never executes project code", and the Inspector is **not a sandbox**. Resolving a project's configuration executes every `runable.config.*` file in its module graph, including each module's `setup()` hook — this is unavoidable (loading a config file *is* running it; there's no static alternative) and, for `setup()` specifically, deliberate: a module's `setup()` is part of what Runable itself resolves a project's configuration with, so skipping it would make the Inspector answer a different question than "how does Runable actually see this project". `runable.config.*` is already trusted, project-owned code — resolving it isn't running something foreign.

That code runs in your Node.js process, though, so its side effects are real: `process.env` writes, filesystem writes, `globalThis` or third-party-singleton mutation from a module's `setup()` are all possible, and are outside the Inspector's isolation guarantee — two Inspectors running concurrently can still observe or race on each other's *project* code's side effects, even though neither can observe or disturb the other's Runable-owned state.

What the Inspector never executes itself is a **page** or **plugin** file — those need a live Vue app/router to run meaningfully, so their metadata (`definePageMeta()`, a plugin's `name`/`enforce`/`dependsOn`) is read statically from source instead of imported.

::u-tip
---
variant: info
title: What the Inspector deliberately does not do
---

It never starts a Vite dev server, never rescans routes/layouts/plugins/modules from scratch outside of already-resolved config, and never executes a page or plugin file just to read its metadata. `resolveRoute()` matches against already-discovered routes; it doesn't change how those routes are discovered. Broader diagnostics and IDE/MCP integrations are intentionally left for tooling built on top of this API, not part of it.

::
