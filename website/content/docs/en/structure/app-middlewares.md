---
title: app/middlewares
description: Control Vue navigation with global or named middleware.
---

Middleware runs during Vue Router navigation. Use it to check a session, redirect, or block access to a page.

```ts
// app/middlewares/auth.ts
export default defineRouterMiddleware((to) => {
  const user = useCurrentUser();

  if (!user.value && to.path !== "/login") {
    return "/login";
  }
});
```

Then reference its name from the page:

```ts
definePageMeta({
  middleware: ["auth"],
});
```

A file with the `.global.ts` suffix applies to every navigation:

```text
app/middlewares/analytics.global.ts
```

These middleware functions belong to the Vue router. HTTP middleware, API-route authentication, and request validation remain in your backend.
