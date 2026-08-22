---
title: useAsyncData
description: Chargez, mettez en cache et hydratez des données asynchrones pendant le rendu SSR.
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

| Option | Défaut | Rôle |
| --- | --- | --- |
| `server` | `true` | Autorise l'exécution pendant le SSR |
| `lazy` | `false` | N'attend pas le résultat pour terminer le rendu |
| `immediate` | `true` | Lance immédiatement le fetcher |
| `ttl` | `300000` | Durée du cache en millisecondes |
| `default` | `() => null` | Valeur initiale |
| `transform` | — | Transforme le résultat avant sa mise en cache |
| `watch` | — | Relance la requête quand une source change |

Le résultat expose `data`, `pending`, `error`, `status`, `execute()` et `refresh()`. La clé sert au cache et à la déduplication : incluez les paramètres qui modifient la ressource.

