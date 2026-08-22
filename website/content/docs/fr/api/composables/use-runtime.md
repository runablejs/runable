---
title: useRuntime
description: Accédez aux variables d'environnement publiques et privées chargées par Runable.
---

```ts
function useRuntime(): RuntimeValues
```

```dotenv
RUN_PUBLIC_API_BASE=/api
RUN_DATABASE_URL=postgres://localhost/acme
```

```ts
const runtime = useRuntime();

runtime.public.apiBase;

if (import.meta.server) {
  runtime.databaseUrl;
}
```

Les variables `*_PUBLIC_*` sont regroupées dans `public` et incluses dans les bundles client et serveur. Les autres variables reconnues ne sont présentes que côté serveur. Les propriétés sont converties en `camelCase` et typées dans `.app/runtime.d.ts`.

