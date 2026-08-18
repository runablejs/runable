---
title: onBeforeRouteUpdate
description: Enregistrez un guard supprimé automatiquement à la fin du scope Vue.
---

```ts
function onBeforeRouteUpdate(guard: NavigationGuard): void
```

```ts
onBeforeRouteUpdate((to, from) => {
  if (to.params.id !== from.params.id) {
    refresh();
  }
});
```

Dans l'implémentation actuelle, Syora enregistre le guard avec `router.beforeEach()` puis le retire avec `onScopeDispose()`. Il s'agit donc d'un guard global dont la durée de vie suit le scope appelant.

