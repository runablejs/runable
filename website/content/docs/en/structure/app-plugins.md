---
title: app/plugins
description: Run code when each Vue application is created.
---

A plugin configures the Vue application before rendering. Use `defineVuePlugin()` to install a library, provide a value, or register hooks.

```ts
// app/plugins/api.ts
export default defineVuePlugin(() => {
  return {
    provide: {
      apiBase: "/api",
    },
  };
});
```

During SSR, a new Vue application is created for every render. Do not store user state in a shared module variable.

Suffix files to restrict their environment:

```text
app/plugins/
├── analytics.client.ts
├── database.server.ts
└── api.ts
```

The development server watches this directory and regenerates the registry when a plugin is added, renamed, or removed.
