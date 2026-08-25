---
title: useFetch
description: Fetch data with reactive options, SSR hydration, caching, and request deduplication.
---

`useFetch` is an SSR-friendly wrapper around `$fetch`. It combines Runable's
HTTP client with `useAsyncData`, so a request made during server rendering can
be reused during hydration instead of being sent again in the browser.

```ts
const {
  data,
  pending,
  error,
  status,
  refresh,
  execute,
  clear,
} = await useFetch<Data>(request, options);
```

The request and supported fetch options may be refs or computed getters. When
one of them changes, `useFetch` automatically sends a new request.

```vue
<script setup lang="ts">
const page = ref(1);

const { data: projects, status, error } = await useFetch<Project[]>(
  "/api/projects",
  {
    query: { page },
  },
);
</script>
```

## Parameters

### `request`

The URL or request accepted by `$fetch`. It can also be a ref or a getter.

```ts
const projectId = ref("runable");

const { data: project } = await useFetch<Project>(
  () => `/api/projects/${projectId.value}`,
);
```

### `options`

`useFetch` accepts `$fetch` options together with the following async-data
options:

| Option | Default | Purpose |
| --- | --- | --- |
| `key` | Generated | Overrides the cache and deduplication key |
| `server` | `true` | Allows the request to run during SSR |
| `lazy` | `false` | Does not wait for the request before completing navigation or rendering |
| `immediate` | `true` | Starts the request when the composable is created |
| `default` | `() => undefined` | Provides the value used before the request resolves |
| `transform` | — | Transforms the response before storing it |
| `pick` | — | Keeps only the selected keys from an object response |
| `watch` | Automatic | Adds reactive sources to watch; use `false` to disable automatic refetching |
| `deep` | `false` | Returns deeply reactive data instead of a shallow ref |
| `dedupe` | `"cancel"` | Uses `"cancel"` or `"defer"` when another request with the same key is pending |
| `timeout` | — | Aborts the request after the given number of milliseconds |
| `enabled` | `true` | Enables the request; accepts a boolean, ref, or getter |
| `getCachedData` | Built in | Customizes cache lookup; returning `undefined` triggers a request |
| `serialize` | `true` | Includes server-fetched data in the hydration payload |
| `ttl` | `300000` | Controls the Runable cache lifetime in milliseconds |
| `$fetch` | Runable `$fetch` | Uses a custom fetch implementation for this request |

All regular `ofetch` options are also supported, including `method`,
`baseURL`, `query`/`params`, `body`, `headers`, `credentials`, `retry`, and
request or response interceptors.

```ts
const token = ref<string>();

const { data } = await useFetch<User>("/api/me", {
  method: "GET",
  headers: () => ({
    authorization: `Bearer ${token.value}`,
  }),
  timeout: 5_000,
});
```

::u-tip
---
title: Reactive requests
---

The request, `method`, `baseURL`, `query`, `params`, `body`, and `headers` can
be refs or getters. They are resolved immediately before each request. Set
`watch: false` when you want to update them without automatically refetching.

::

## Return value

`useFetch` returns a thenable reactive object. It can be awaited in
`<script setup>`, or used immediately when `lazy` or `immediate: false` is
appropriate.

| Property | Type | Purpose |
| --- | --- | --- |
| `data` | `Ref<Data \| undefined>` | The resolved and optionally transformed response |
| `pending` | `Ref<boolean>` | Whether a request is currently running |
| `error` | `Ref<Error \| undefined>` | The most recent request error |
| `status` | `Ref<"idle" \| "pending" \| "success" \| "error">` | Current request state |
| `refresh(options?)` | `Promise<void>` | Sends the request again |
| `execute(options?)` | `Promise<void>` | Alias for `refresh` |
| `clear()` | `void` | Cancels the request and resets data, error, status, and cache |

```ts
const { data, execute, clear } = useFetch<Project[]>("/api/projects", {
  immediate: false,
});

await execute();

// Restore the default value and remove the cached response.
clear();
```

`refresh` and `execute` accept per-execution `dedupe`, `timeout`, and `signal`
options.

```ts
await refresh({
  dedupe: "defer",
  timeout: 2_000,
});
```

## Transforming and selecting data

Use `transform` to change the response, or `pick` to keep selected properties.

```ts
const { data: project } = await useFetch<ProjectResponse, Error, Project>(
  "/api/project",
  {
    transform: response => response.project,
  },
);
```

```ts
const { data: user } = await useFetch<User>("/api/user", {
  pick: ["id", "name"],
});
```

## Custom fetch client

Pass `$fetch` when an API needs its own base URL, headers, or interceptors.

```ts
const api = $fetch.create({
  baseURL: "https://api.example.com",
});

const { data } = await useFetch<Project[]>("/projects", {
  $fetch: api,
});
```

## `useLazyFetch`

`useLazyFetch` has the same API and options as `useFetch`, with `lazy: true`
applied automatically.

```ts
const { data, pending } = useLazyFetch<Project[]>("/api/projects");
```

Use `$fetch` directly when you only need an HTTP request and do not need
reactive state, SSR hydration, caching, or deduplication.
