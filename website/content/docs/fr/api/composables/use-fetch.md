---
title: useFetch
description: Récupérez le client HTTP ofetch exposé par Runable.
---

```ts
function useFetch(): typeof $fetch
```

`useFetch()` retourne actuellement le client `ofetch` utilisé par `$fetch`.

```ts
const fetcher = useFetch();
const projects = await fetcher<Project[]>("/api/projects");
```

::u-tip
---
variant: warning
title: Pas un composable de données réactif
---

Cette API ne retourne ni `data`, ni `pending`, ni cache SSR. Utilisez `useAsyncData()` autour de `$fetch` lorsque vous avez besoin de ces fonctionnalités.

::

