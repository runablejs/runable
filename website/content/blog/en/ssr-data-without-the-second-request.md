---
title: SSR Data Without the Second Request
description: Load data on the server, serialize it into the page, and hydrate Vue without immediately fetching the same resource again.
date: 2026-08-17
authors:
  - domutala
---

Server-side rendering is only useful when the browser can take over the rendered page cleanly. Data loading is where that handoff often becomes wasteful.

A page fetches a resource on the server, renders HTML, and sends it to the browser. Vue then starts on the client and runs the same request again because its local state is empty. The user sees the correct page, but the application has paid for the data twice.

Runable's `useAsyncData()` connects both sides of that lifecycle.

## Load once during server rendering

Use a stable key and return the data required by the page:

```vue
<script setup lang="ts">
type Project = {
  id: number;
  name: string;
};

const {
  data: projects,
  pending,
  error,
  refresh,
} = await useAsyncData("projects", (signal) => {
  return $fetch<Project[]>("/api/projects", { signal });
});
</script>

<template>
  <p v-if="pending">Loading projects…</p>
  <p v-else-if="error">{{ error.message }}</p>
  <ul v-else>
    <li v-for="project in projects" :key="project.id">
      {{ project.name }}
    </li>
  </ul>

  <button type="button" @click="refresh">Refresh</button>
</template>
```

During SSR, Runable waits for the awaited data, stores the result in its request cache, and renders the list. It then serializes that cache into the HTML response.

Before Vue hydrates in the browser, Runable restores the serialized entries. The client finds `projects` in the cache and can reuse it instead of starting the same request immediately.

## Treat the key as part of the data model

The key identifies the cache entry. Two components using the same key share the same pending work and result.

For parameterized data, include the parameter:

```ts
const route = useRoute();
const id = computed(() => String(route.params.id));

const { data: project } = await useAsyncData(
  `project:${id.value}`,
  (signal) => $fetch(`/api/projects/${id.value}`, { signal }),
  { watch: [id] },
);
```

Using only `project` would let different project pages compete for the same entry. A descriptive key makes caching and debugging easier.

## Pass the cancellation signal

The loader receives an `AbortSignal`. Pass it to `$fetch` or any client that accepts it.

```ts
await useAsyncData("search", (signal) => {
  return $fetch("/api/search", {
    signal,
    query: { q: search.value },
  });
});
```

When a watched dependency changes before the previous request completes, cancellation prevents obsolete work from winning the race.

## Choose what should block rendering

Not every resource belongs on the critical path.

```ts
const { data: recommendations } = await useAsyncData(
  "recommendations",
  loadRecommendations,
  {
    lazy: true,
    default: () => [],
    ttl: 60_000,
  },
);
```

Use `lazy: true` for data that can arrive after the initial render. Use `server: false` for browser-only data. Use `ttl` when a cached value can remain valid for a known period.

`refresh()` forces another execution when the user asks for current data. `transform` can reduce or normalize a result before it enters the cache.

## Keep hydration deterministic

The server and the first browser render must produce the same structure. Restored async data helps, but other unstable values can still cause mismatches.

Do not render `window.innerWidth`, a random number, or a locale-dependent timestamp during SSR unless the server and browser receive the same value. Compute browser-only values after `onMounted()`, or isolate an incompatible component with `ClientOnly`.

The goal is not simply to render HTML on the server. The goal is to transfer a complete, stable application state to the browser and continue from there without repeating work.

Read <a href="/docs/guide/data-fetching.md">Data Fetching</a> and <a href="/docs/guide/rendering-modes.md">SSR and CSR</a> for the available options.
