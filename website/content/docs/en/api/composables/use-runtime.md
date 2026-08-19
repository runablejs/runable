---
title: useRuntime
description: Access public and private environment variables loaded by Syora.
---

```ts
function useRuntime(): RuntimeValues
```

```dotenv
SYO_PUBLIC_API_BASE=/api
SYO_DATABASE_URL=postgres://localhost/acme
```

```ts
const runtime = useRuntime();

runtime.public.apiBase;

if (import.meta.server) {
  runtime.databaseUrl;
}
```

`*_PUBLIC_*` variables are grouped under `public` and included in both client and server bundles. Other recognized variables are available only on the server. Properties are converted to `camelCase` and typed in `.app/runtime.d.ts`.
