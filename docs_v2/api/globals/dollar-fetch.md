---
title: $fetch
description: Envoyez des requêtes HTTP avec le client ofetch auto-importé.
---

`$fetch` est une référence directe à `ofetch`.

```ts
const project = await $fetch<Project>("/api/projects/42");
```

```ts
const created = await $fetch<Project>("/api/projects", {
  method: "POST",
  body: {
    name: "Documentation",
  },
});
```

Le client analyse automatiquement les réponses JSON et lève une erreur pour une réponse HTTP en échec. Pour bénéficier du cache, de l'état réactif et de l'hydratation SSR, appelez `$fetch` dans `useAsyncData()`.

