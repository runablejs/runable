---
title: Runtime configuration
description: Load typed variables without exposing secrets to the browser.
---

Syora reads `.env` files for the active Vite mode and variables from `process.env`. It keeps names prefixed with `SYO_`, `SYORA_`, or `VITE_`.

## Declare values

```dotenv
SYO_PUBLIC_API_BASE=/api
SYO_PUBLIC_FEATURE_ENABLED=true
SYO_DATABASE_URL=postgres://localhost/acme
SYO_RETRY_COUNT=3
```

The `PUBLIC_` segment determines visibility:

| Variable | Generated access | Client | Server |
| --- | --- | --- | --- |
| `SYO_PUBLIC_API_BASE` | `runtime.public.apiBase` | Yes | Yes |
| `SYO_PUBLIC_FEATURE_ENABLED` | `runtime.public.featureEnabled` | Yes | Yes |
| `SYO_DATABASE_URL` | `runtime.databaseUrl` | No | Yes |
| `SYO_RETRY_COUNT` | `runtime.retryCount` | No | Yes |

## Read values

```ts
const runtime = useRuntime();

const apiBase = runtime.public.apiBase;

if (import.meta.server) {
  console.log(runtime.databaseUrl);
}
```

Syora removes the prefix, converts names to `camelCase`, and infers booleans, numbers, arrays, JSON objects, `null`, and `undefined`.

## Use import.meta.env

Static accesses are also replaced during compilation:

```ts
const apiBase = import.meta.env.SYO_PUBLIC_API_BASE;
```

Dynamic notation such as `import.meta.env[key]` is not transformed. Prefer `useRuntime()` for the `public` separation and generated types.

## Provide editor types

Syora writes `.app/runtime.d.ts` at startup. Restart the server after adding or renaming a variable to regenerate the declaration.

::u-tip
---
variant: destructive
title: A public variable is never secret
---

Every `*_PUBLIC_*` value is included in the client bundle. Never use one for a password, private token, or connection string.

::
