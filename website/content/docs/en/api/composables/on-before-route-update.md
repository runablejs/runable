---
title: onBeforeRouteUpdate
description: Register a guard that is removed automatically when its Vue scope ends.
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

In the current implementation, Syora registers the guard with `router.beforeEach()` and removes it with `onScopeDispose()`. It is therefore a global guard whose lifetime follows the calling scope.
