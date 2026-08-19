---
title: $fetch
description: Send HTTP requests with the auto-imported ofetch client.
---

`$fetch` is a direct reference to `ofetch`.

```ts
const project = await $fetch<Project>("/api/projects/42");
```

```ts
const created = await $fetch<Project>("/api/projects", {
  method: "POST",
  body: {
    name: "Documentation",
  },
});
```

The client parses JSON responses automatically and throws on failed HTTP responses. To get caching, reactive state, and SSR hydration, call `$fetch` inside `useAsyncData()`.
