---
title: .env
description: Load typed environment variables and control which values Syora exposes to the browser.
---

Syora loads environment files for the active Vite mode and variables already present in `process.env`. Use `useRuntime()` to read them from the application.

## Declare variables

Syora recognizes three prefixes: `SYO_`, `SYORA_`, and `VITE_`. Prefer `SYO_` in new projects to distinguish Syora configuration clearly.

```dotenv
# Available in the browser and during SSR
SYO_PUBLIC_API_BASE=/api
SYO_PUBLIC_FEATURE_ENABLED=true

# Available only on the server
SYO_DATABASE_URL=postgres://localhost/acme
SYO_RETRY_COUNT=3
```

The `PUBLIC_` segment controls client exposure:

| Name in `.env` | Generated property | Client | Server |
| --- | --- | --- | --- |
| `SYO_PUBLIC_API_BASE` | `runtime.public.apiBase` | Yes | Yes |
| `SYORA_PUBLIC_APP_NAME` | `runtime.public.appName` | Yes | Yes |
| `SYO_DATABASE_URL` | `runtime.databaseUrl` | No | Yes |
| `SYORA_RETRY_COUNT` | `runtime.retryCount` | No | Yes |

Syora removes the prefix and converts the name to `camelCase`.

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

You can also import `useRuntime` from `@syora/core` in backend code. This version loads `.env`, merges values with `process.env`, and gives process variables priority.

## Generated types

At startup, Syora analyzes values and writes declarations to `.app/runtime.d.ts`. Your editor therefore knows the available properties without a manual TypeScript interface.

```dotenv
SYO_PUBLIC_ENABLED=true
SYO_PORT=3000
SYO_TAGS=["documentation","dashboard"]
```

These values become a boolean, number, and array respectively. Syora also recognizes `null`, `undefined`, and valid JSON objects. Every other value remains a string.

Restart the development server after adding or renaming a variable to regenerate types and injected values.

## Direct access with import.meta.env

Syora also replaces static accesses using the `SYO_` and `SYORA_` prefixes:

```ts
const apiBase = import.meta.env.SYO_PUBLIC_API_BASE;
```

Use dot notation and the full variable name. Dynamic access such as `import.meta.env[key]` is not transformed.

`useRuntime()` remains preferable: it clearly separates `public`, converts names, and provides generated types.

::u-tip
---
variant: destructive
surface: solid
title: Never put a secret in a public variable
---

Every `SYO_PUBLIC_*`, `SYORA_PUBLIC_*`, or `VITE_PUBLIC_*` variable is bundled for the client. Treat its value as public.

Also avoid the `VITE_` prefix for secrets: Vite exposes `VITE_*` variables through `import.meta.env` independently of the object built by `useRuntime()`.

::

## Files to commit

Keep local values in `.env` or standard Vite mode variants such as `.env.development` and `.env.production`. Commit a secret-free `.env.example` that describes the expected configuration.

```dotenv
# .env.example
SYO_PUBLIC_API_BASE=
SYO_DATABASE_URL=
```
