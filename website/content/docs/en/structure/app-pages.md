---
title: app/pages
description: Create Vue routes from the file tree.
---

Every Vue component in `app/pages/` becomes a route. Its file path determines the URL.

```text
app/pages/
├── index.vue             → /
├── about.vue             → /about
├── users/[id].vue        → /users/:id
└── docs/[...slug].vue    → /docs/:slug(.*)
```

Create a page like a regular Vue component:

```vue
<!-- app/pages/users/[id].vue -->
<script setup lang="ts">
const route = useRoute();
</script>

<template>
  <h1>User {{ route.params.id }}</h1>
</template>
```

Add a layout or middleware with `definePageMeta()`:

```ts
definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
});
```

Syora delegates page detection and reloading to Vue Router. Configure `pages` in `syora.config.ts` only when your views live elsewhere.
