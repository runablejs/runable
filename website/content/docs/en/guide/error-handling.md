---
title: Error handling
description: Capture Vue, Router, and browser errors in a consistent interface.
---

Runable installs error state isolated to each Vue application. It captures Vue rendering errors, Vue Router errors, global browser errors, and unhandled promise rejections.

## Display an error manually

```vue
<script setup lang="ts">
const { showError } = useAppError();

async function save() {
  try {
    await saveProject();
  } catch (error) {
    showError(error, {
      code: "PROJECT_SAVE_FAILED",
      statusCode: 500,
      info: "Unable to save the project",
    });
  }
}
</script>
```

When the state contains an error, `RunableApp` replaces the current interface with the error screen.

## Customize the screen

Create `app/error.vue`:

```vue
<script setup lang="ts">
defineProps<{ error: { code: string; message: string } }>();
defineEmits<{ clear: [] }>();
</script>

<template>
  <main>
    <p>{{ error.code }}</p>
    <h1>{{ error.message }}</h1>
    <button type="button" @click="$emit('clear')">Try again</button>
  </main>
</template>
```

The `clear` event resets the error and restores the application.

## Read and clear state

```ts
const { error, showError, clearError } = useAppError();

console.log(error.value?.source);
clearError();
```

An error includes `code`, `statusCode`, `message`, `stack`, `source`, `info`, `url`, and `timestamp`.

## Errors during SSR

If server rendering fails, Runable records the error and renders `app/error.vue` in a second pass. The exception therefore does not automatically produce an empty HTML page.

::u-tip
---
variant: info
title: API errors remain in the backend
---

Express, Fastify, or Hono errors must be converted into HTTP responses by those frameworks. This system concerns the Vue application.

::
