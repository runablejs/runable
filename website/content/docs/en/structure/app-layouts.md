---
title: app/layouts
description: Share an interface structure across several pages.
---

A layout wraps page content. `default.vue` is used when a page does not explicitly select another layout.

```vue
<!-- app/layouts/default.vue -->
<template>
  <div>
    <header>My application</header>
    <main><slot /></main>
  </div>
</template>
```

Create a named layout for a specific area:

```vue
<!-- app/pages/admin.vue -->
<script setup lang="ts">
definePageMeta({ layout: "dashboard" });
</script>

<template>
  <h1>Administration</h1>
</template>
```

The `dashboard` name maps to `app/layouts/dashboard.vue`. Runable generates the registry and related types in `.app/layouts.d.ts`.

Layouts can use composables, auto-imported components, and `RouterLink` like the rest of the application.
