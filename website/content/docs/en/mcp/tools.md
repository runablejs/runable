---
title: MCP Tools
description: Reference for the eight read-only tools exposed by the Runable MCP server.
---

The server exposes eight tools backed by the target project's `runable/inspector`. Responses use structured JSON so an agent can reason about the result without parsing terminal output.

## `get_project`

Returns the project root, installed Runable version, SSR mode, and resolved application paths.

Use it first to verify that the MCP server targets the correct project.

```json
{
  "rootDir": "/work/my-app",
  "runableVersion": "1.0.0-alpha.4",
  "ssr": true,
  "paths": {
    "appDir": "app",
    "generatedDir": ".app",
    "outputDir": ".output",
    "publicDir": "public"
  }
}
```

## `get_config`

Returns the resolved application directory, SSR mode, base URL, site URL, DevTools setting, default head metadata, and runtime configuration.

Private runtime values are excluded. The response contains only their key names:

```json
{
  "runtime": {
    "public": { "apiBase": "/api" },
    "privateKeys": ["databaseUrl", "sessionSecret"]
  }
}
```

## `get_routes`

Returns every route currently resolved by Runable. Each item can include its name, path, page file, parent, layout, middleware, and other statically resolved metadata.

Use it before creating a page, changing navigation, or investigating a route conflict.

## `get_extensions`

Pass one of these values as `kind`:

| `kind` | Returns |
| --- | --- |
| `layouts` | Registered layout names and files |
| `middlewares` | Middleware names, files, and global state |
| `plugins` | Plugin names, order constraints, and dependencies |
| `modules` | Local and package modules with their configuration keys |
| `auto-imports` | Components, composables, and globals available without imports |

Example input:

```json
{ "kind": "plugins" }
```

## `resolve_route`

Pass an absolute URL path:

```json
{ "path": "/users/42?tab=profile#details" }
```

The tool uses the same Vue Router matching semantics as Runable and returns the matched route, extracted params, query, and hash. A miss returns `{ "matched": false, "match": null }`.

This tool requires a Runable Inspector version that implements `resolveRoute()`. Other tools remain available when an older compatible Inspector lacks this optional capability.

## `diagnose`

Runs deterministic structural checks and returns `{ valid, summary, issues }`. Current checks cover:

- duplicate route names and paths;
- routes referencing missing layouts or middleware;
- plugins depending on missing plugins;
- duplicate layout and middleware names.

Every issue has a stable `code`, a severity, a direct message, and—when available—a file, route, and suggested correction. The tool does not produce subjective style warnings.

## `search_api`

Searches the official Runable documentation bundled with the MCP package:

```json
{ "query": "useAsyncData", "limit": 5 }
```

`limit` defaults to `5` and accepts values from `1` to `20`. Search runs locally with no embeddings, vector database, or network request. Results include the documentation version and the Runable version installed in the project so the agent can detect a mismatch.

## `refresh`

Reloads the Inspector state after project files or configuration change:

```text
edit project → refresh → get_routes / get_config / get_extensions
```

Other tools do not refresh implicitly. `refresh` returns `{ "refreshed": true }` and does not return project data itself.

::u-tip
---
variant: info
title: Refresh is read-only
---

`refresh` rebuilds the MCP server's in-memory inspection state. It does not write `.app`, run a production build, or start the development server.

::
