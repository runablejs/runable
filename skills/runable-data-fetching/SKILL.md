---
name: runable-data-fetching
description: Load data with useAsyncData, use $fetch/useFetch correctly, choose SSR or CSR, isolate browser-only code with ClientOnly, and handle Vue application errors. Use when working with useAsyncData, useFetch, $fetch, the ssr config option, hydration, ClientOnly, or useAppError.
---

# Runable Data Fetching

Use this skill when a page or component needs to load data, when rendering must be adjusted for SSR/CSR or hydration, or when handling a Vue application error.

Scope: data loading, rendering mode, hydration safety, and application-level error handling. It does not cover routing/layouts (see `runable-pages`), page metadata like `useHead`/`useSeoMeta` (see `runable-head`), or backend API implementation (see `runable-integrations`).

## Load data with useAsyncData

```vue
<script setup lang="ts">
type Project = { id: number; name: string };

const { data: projects, pending, error, refresh } = await useAsyncData(
  "projects",
  async (signal) => $fetch<Project[]>("/api/projects", { signal }),
);
</script>

<template>
  <p v-if="pending">Loading…</p>
  <p v-else-if="error">{{ error.message }}</p>
  <ul v-else>
    <li v-for="project in projects" :key="project.id">{{ project.name }}</li>
  </ul>
</template>
```

`useAsyncData(key, fetcher, options?)` is a "thenable" — `await` it for the resolved result, or use it directly for its reactive refs. During SSR it waits for the fetch, serializes the result into the HTML, and restores it on the client instead of re-fetching.

The `key` identifies the cache entry and deduplicates concurrent calls with the same key — always include any parameter that changes the result:

```ts
const route = useRoute();
const id = computed(() => String(route.params.id));

const project = await useAsyncData(
  `project:${id.value}`,
  (signal) => $fetch(`/api/projects/${id.value}`, { signal }),
  { watch: [id] },
);
```

Options:

| Option | Effect |
| --- | --- |
| `server` | Set to `false` to run the fetcher only in the browser |
| `lazy` | Set to `true` to avoid blocking SSR (renders before data resolves) |
| `immediate` | Set to `false` to wait for a manual `execute()` call |
| `ttl` | Cache duration in ms |
| `default` | Factory for the initial value before data resolves |
| `transform` | Transforms the raw result before it's cached |
| `watch` | Reactive sources that trigger a refresh |

`refresh()` forces a new call, bypassing the cache. `execute()` runs through the same engine (used with `immediate: false`).

## $fetch and useFetch — critical difference from Nuxt

`$fetch` is a direct reference to `ofetch`, auto-imported. It parses JSON automatically and throws on a failed HTTP response:

```ts
const project = await $fetch<Project>("/api/projects/42");
```

**`useFetch()` in Runable is not a data-fetching composable.** It takes no arguments and simply returns the same `$fetch` client:

```ts
function useFetch(): typeof $fetch
```

It returns no `data`, `pending`, `error`, or SSR cache — nothing reactive. Do not assume it behaves like Nuxt's `useFetch(url, options)`. When you need reactive state, caching, or SSR hydration for a request, wrap `$fetch` in `useAsyncData()` as shown above; don't reach for `useFetch()` expecting that behavior.

## Choose SSR or CSR

```ts
// runable.config.ts
export default defineConfig({
  ssr: true, // default
});
```

| Mode | Choose it for |
| --- | --- |
| `ssr: true` | Indexable content, a prefilled first render, data loaded before the response |
| `ssr: false` | Private interfaces, heavy browser-API usage, no need for a rendering server |

## Write SSR-safe code

`window`, `document`, `localStorage`, and `navigator` don't exist on the server. Access them after mounting:

```vue
<script setup lang="ts">
const width = ref<number>();

onMounted(() => {
  width.value = window.innerWidth;
});
</script>
```

During hydration, Vue reuses the server-rendered HTML instead of recreating it — the first client render must produce the same structure as the server. Don't compute a local date, random number, or viewport-dependent value directly in the render path; compute it after `onMounted()` or use a stable initial value.

## Isolate unavoidable browser-only code

When a component genuinely cannot render on the server (e.g. it depends on a browser-only library), wrap it in `ClientOnly` instead of guarding every access manually:

```vue
<ClientOnly fallback="Loading the map…" fallback-tag="p">
  <InteractiveMap />
</ClientOnly>
```

A `#fallback` slot works too. The fallback renders on the server; the real content appears only after client mounting.

## Handle errors

Runable installs error state isolated per Vue application instance. It captures Vue rendering errors, Vue Router errors, global browser errors, and unhandled promise rejections.

`showError()`/`clearError()` are **not** global auto-imports (unlike Nuxt) — get them from `useAppError()` first:

```ts
const { error, showError, clearError } = useAppError();

try {
  await saveProject();
} catch (e) {
  showError(e, { code: "PROJECT_SAVE_FAILED", statusCode: 500 });
}
```

An error object includes `code`, `statusCode`, `message`, `stack`, `source`, `info`, `url`, `timestamp`. When present, Runable renders `app/error.vue` instead of the current interface:

```vue
<!-- app/error.vue -->
<script setup lang="ts">
defineProps<{ error: { code: string; message: string } }>();
defineEmits<{ clear: [] }>();
</script>
```

If server rendering itself fails, Runable records the error and renders `app/error.vue` in a second pass — a server error does not produce an empty HTML response by default.

This system is for the Vue application only. Backend/API errors (Express, Fastify, Hono, …) must still be converted into proper HTTP responses by the backend — this does not substitute for that.

## Common mistakes

- Calling `useFetch()` expecting Nuxt-style `{ data, pending, error }` — it returns the plain `$fetch` client with no reactivity.
- Calling `showError()`/`clearError()` as globals instead of destructuring them from `useAppError()`.
- Reading `window`/`document`/`localStorage` outside `onMounted()` or a client-only guard.
- Choosing a `useAsyncData()` key that doesn't include the parameters the result depends on, causing stale cached data.
- Wrapping something in `useAsyncData()` purely for routing/layout needs that have nothing to do with data loading.

## When another skill is needed

- Creating or modifying routes, layouts, or navigation middleware: `runable-pages`.
- Page `<title>`, meta tags, or structured data: `runable-head`.
- Implementing the `/api/...` endpoint the frontend calls: `runable-integrations` (or the backend framework's own docs — Runable doesn't implement your API).

Consult the current Runable API reference when exact behavior matters.
