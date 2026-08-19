---
title: app/composables
description: Share auto-imported Vue logic across components and pages.
---

Place functions that compose Vue state and APIs here. Named exports are auto-imported into the application.

```ts
// app/composables/useCounter.ts
export function useCounter() {
  const count = ref(0);

  return {
    count,
    increment: () => count.value++,
  };
}
```

```vue
<script setup lang="ts">
const { count, increment } = useCounter();
</script>
```

Use `app/composables/` for Vue-related functions: reactive state, lifecycle, injections, or application context. Put Vue-independent TypeScript utilities in an explicit domain directory.

To scan multiple directories:

```ts
export default defineConfig({
  composables: ["./app/composables", "./shared/composables"],
});
```
