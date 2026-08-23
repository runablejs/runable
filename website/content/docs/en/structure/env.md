---
title: .env
description: Load typed environment variables and control which values Runable exposes to the browser.
---

Runable loads environment files for the active Vite mode and variables already present in `process.env`. Use `useRuntime()` to read them from the application.

## Declare variables

Runable recognizes two prefixes: `RUN_` and `VITE_`. Prefer `RUN_` in new projects to distinguish Runable configuration clearly.

```dotenv
# Available in the browser and during SSR
RUN_PUBLIC_API_BASE=/api
RUN_PUBLIC_FEATURE_ENABLED=true

# Available only on the server
RUN_DATABASE_URL=postgres://localhost/acme
RUN_RETRY_COUNT=3
```

The `PUBLIC_` segment controls client exposure:

| Name in `.env` | Generated property | Client | Server |
| --- | --- | --- | --- |
| `RUN_PUBLIC_API_BASE` | `runtime.public.apiBase` | Yes | Yes |
| `RUN_PUBLIC_APP_NAME` | `runtime.public.appName` | Yes | Yes |
| `RUN_DATABASE_URL` | `runtime.databaseUrl` | No | Yes |
| `RUN_RETRY_COUNT` | `runtime.retryCount` | No | Yes |

Runable removes the prefix and converts the name to `camelCase`.

## Read configuration

`useRuntime()` is auto-imported into the Vue application:

```vue
<script setup lang="ts">
const runtime = useRuntime();

const apiBase = runtime.public.apiBase;
</script>

<template>
  <a :href="`${apiBase}/projects`">View projects</a>
</template>
```

A private variable exists in the object produced for the SSR bundle, but not in the client bundle. Read it only in server code:

```ts
if (import.meta.server) {
  const runtime = useRuntime();
  console.log(runtime.databaseUrl);
}
```

You can also import `useRuntime` from `runable` in backend code. This version loads `.env`, merges values with `process.env`, and gives process variables priority.

## Generated types

At startup, Runable analyzes values and writes declarations to `.app/runtime.d.ts`. Your editor therefore knows the available properties without a manual TypeScript interface.

```dotenv
RUN_PUBLIC_ENABLED=true
RUN_PORT=3000
RUN_TAGS=["documentation","dashboard"]
```

These values become a boolean, number, and array respectively. Runable also recognizes `null`, `undefined`, and valid JSON objects. Every other value remains a string.

Restart the development server after adding or renaming a variable to regenerate types and injected values.

## Direct access with import.meta.env

Runable also replaces static accesses using the `RUN_` and `VITE_` prefixes:

```ts
const apiBase = import.meta.env.RUN_PUBLIC_API_BASE;
```

Use dot notation and the full variable name. Dynamic access such as `import.meta.env[key]` is not transformed.

`useRuntime()` remains preferable: it clearly separates `public`, converts names, and provides generated types.

::u-tip
---
variant: destructive
surface: solid
title: Never put a secret in a public variable
---

Every `RUN_PUBLIC_*` or `VITE_PUBLIC_*` variable is bundled for the client. Treat its value as public.

Also avoid the `VITE_` prefix for secrets: Vite exposes `VITE_*` variables through `import.meta.env` independently of the object built by `useRuntime()`.

::

## Files to commit

Keep local values in `.env` or standard Vite mode variants such as `.env.development` and `.env.production`. Commit a secret-free `.env.example` that describes the expected configuration.

```dotenv
# .env.example
RUN_PUBLIC_API_BASE=
RUN_DATABASE_URL=
```
