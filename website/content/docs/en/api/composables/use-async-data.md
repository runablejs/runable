---
title: useAsyncData
description: Load, cache, and hydrate asynchronous data during SSR.
---

```ts
function useAsyncData<Data, TransformedData = Data>(
  key: string,
  fetcher: (signal?: AbortSignal) => Promise<Data>,
  options?: AsyncDataOptions<Data, TransformedData>,
): AsyncDataResult<TransformedData, Error> & PromiseLike<AsyncDataResult<TransformedData, Error>>
```

```ts
const { data, pending, error, refresh } = await useAsyncData(
  "projects",
  async (signal) => {
    const response = await fetch("/api/projects", { signal });
    return response.json() as Promise<Project[]>;
  },
);
```

## Options

| Option | Default | Purpose |
| --- | --- | --- |
| `server` | `true` | Allows execution during SSR |
| `lazy` | `false` | Does not wait for the result before completing the render |
| `immediate` | `true` | Starts the fetcher immediately |
| `ttl` | `300000` | Cache duration in milliseconds |
| `default` | `() => null` | Initial value |
| `transform` | — | Transforms the result before caching it |
| `watch` | — | Re-runs the request when a source changes |

The result exposes `data`, `pending`, `error`, `status`, `execute()`, and `refresh()`. The key is used for caching and deduplication: include every parameter that changes the resource.
