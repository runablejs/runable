---
title: error.vue
description: Display a consistent interface when an error reaches the Vue application.
---

Create `app/error.vue` to customize the application's error screen.

```vue
<!-- app/error.vue -->
<script setup lang="ts">
const { error, clearError } = useAppError();
</script>

<template>
  <main>
    <h1>An error occurred</h1>
    <p>{{ error?.message }}</p>
    <button type="button" @click="clearError()">Try again</button>
  </main>
</template>
```

Runable captures Vue errors passed to the application handler and exposes their state through `useAppError()`. Keep the error component robust: avoid reusing logic that may have caused the failure.

::u-tip
---
variant: info
title: HTTP errors remain in the backend
---

`error.vue` concerns the Vue interface. An error produced by an API route must still be converted into an HTTP response by Express, Fastify, Hono, or your other backend.

::
