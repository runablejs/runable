---
title: defineVueMiddleware
description: Declare one or more typed navigation middleware functions.
---

```ts
function defineVueMiddleware(
  middleware: VueRouterMiddleware | VueRouterMiddleware[],
): VueRouterMiddleware[]
```

```ts
// app/middlewares/auth.ts
export default defineVueMiddleware((to) => {
  const user = useCurrentUser();

  if (!user.value && to.path !== "/login") {
    return "/login";
  }
});
```

The function always normalizes its argument into an array. Each middleware receives `to` and `from`, then can return the same values as a Vue Router guard: a destination, `false`, `true`, `undefined`, or a promise.

Suffix the file with `.global.ts` to run it on every route.
