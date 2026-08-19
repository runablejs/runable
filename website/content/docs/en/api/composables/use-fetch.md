---
title: useFetch
description: Retrieve the ofetch HTTP client exposed by Syora.
---

```ts
function useFetch(): typeof $fetch
```

`useFetch()` currently returns the `ofetch` client used by `$fetch`.

```ts
const fetcher = useFetch();
const projects = await fetcher<Project[]>("/api/projects");
```

::u-tip
---
variant: warning
title: Not a reactive data composable
---

This API returns no `data`, `pending`, or SSR cache. Wrap `$fetch` with `useAsyncData()` when you need these features.

::
