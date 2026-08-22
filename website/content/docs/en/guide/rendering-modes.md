---
title: SSR and CSR
description: Choose the application's rendering mode and isolate browser-only code.
---

Runable enables server-side rendering by default. Each request creates a Vue application, resolves the route, loads awaited data, and injects generated HTML into the page.

## Choose the mode

```ts
// runable.config.ts
import { defineConfig } from "runable";

export default defineConfig({
  ssr: true,
});
```

With `ssr: false`, Runable serves the client template and Vue builds the interface in the browser.

| Mode | Choose it for |
| --- | --- |
| SSR | Indexable content, prefilled first render, data loaded before the response |
| CSR | Private interfaces, heavy browser-API usage, no need for a rendering server |

## Write SSR-compatible code

`window`, `document`, `localStorage`, and `navigator` do not exist on the server. Access them after mounting:

```vue
<script setup lang="ts">
const width = ref<number>();

onMounted(() => {
  width.value = window.innerWidth;
});
</script>
```

## Isolate a client component

```vue
<ClientOnly fallback="Loading the map…" fallback-tag="p">
  <InteractiveMap />
</ClientOnly>
```

You can also provide a slot:

```vue
<ClientOnly>
  <Chart />

  <template #fallback>
    <ChartSkeleton />
  </template>
</ClientOnly>
```

The fallback is rendered on the server. Main content appears after client mounting.

## Understand hydration

During SSR, Vue takes over existing HTML instead of recreating it. The first client render must therefore produce the same structure as the server. Use `ClientOnly` when a library cannot meet this constraint.

::u-tip
---
variant: warning
title: Avoid unstable values during the first render
---

A local date, random number, or viewport measurement may differ between server and browser. Compute it after `onMounted()` or provide a stable initial value.

::
