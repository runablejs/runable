---
title: Data Fetching
description: Load data with caching, deduplication, cancellation, and SSR hydration.
---

Use `useAsyncData()` to load a resource required to render a page. Syora waits during SSR, serializes the cache into the HTML, then restores it before hydration.

## Load a resource

```vue
<script setup lang="ts">
type Project = { id: number; name: string };

const { data: projects, pending, error, refresh } = await useAsyncData(
  "projects",
  async (signal) => {
    return $fetch<Project[]>("/api/projects", { signal });
  },
);
</script>

<template>
  <p v-if="pending">Loading…</p>
  <p v-else-if="error">{{ error.message }}</p>
  <ul v-else>
    <li v-for="project in projects" :key="project.id">{{ project.name }}</li>
  </ul>
  <button type="button" @click="refresh">Refresh</button>
</template>
```

## Choose a stable key

The key identifies the cache entry and deduplicates simultaneous requests. Include parameters that change the result:

```ts
const route = useRoute();
const id = computed(() => String(route.params.id));

const project = await useAsyncData(
  `project:${id.value}`,
  (signal) => $fetch(`/api/projects/${id.value}`, { signal }),
  { watch: [id] },
);
```

## Adjust execution

```ts
const result = await useAsyncData("stats", loadStats, {
  server: true,
  lazy: false,
  immediate: true,
  ttl: 60_000,
  default: () => [],
  transform: (items) => items.slice(0, 10),
});
```

| Option | Use it to |
| --- | --- |
| `server: false` | Run the call only in the browser |
| `lazy: true` | Avoid blocking SSR |
| `immediate: false` | Trigger the call with `execute()` |
| `ttl` | Set the cache duration |
| `default` | Provide an initial value |
| `transform` | Transform before caching |
| `watch` | Reload after a reactive change |

`refresh()` forces a new call. `execute()` uses the same execution engine.

::u-tip
---
variant: warning
title: URLs during SSR
---

A relative URL is not always resolved as it is in the browser when the fetcher runs on the server. Use an origin from runtime configuration if your HTTP backend requires one.

::
