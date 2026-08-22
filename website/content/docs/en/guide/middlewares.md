---
title: Middleware
description: Allow, block, or redirect navigation before displaying a page.
---

Files in `app/middlewares/` are Vue Router guards. They run in the browser and during SSR navigation.

## Create named middleware

```ts
// app/middlewares/auth.ts
export default defineVueMiddleware((to) => {
  const authenticated = false;

  if (!authenticated) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }
});
```

Attach it to a page using its file name:

```vue
<script setup lang="ts">
definePageMeta({ middleware: ["auth"] });
</script>
```

## Create global middleware

Add the `.global` suffix to run it on every navigation:

```ts
// app/middlewares/analytics.global.ts
export default defineVueMiddleware((to, from) => {
  console.debug("navigation", from.fullPath, to.fullPath);
});
```

## Control navigation

Middleware can return:

| Return value | Result |
| --- | --- |
| `undefined` or `true` | Continue navigation |
| `false` | Cancel navigation |
| A route | Redirect to that route |
| A thrown error | Trigger router error handling |

You can declare several middleware functions:

```ts
definePageMeta({ middleware: ["auth", "admin"] });
```

Runable loads required middleware, removes duplicates, and runs them in order. Global middleware runs before route middleware.

::u-tip
---
variant: warning
title: Vue middleware, not HTTP middleware
---

This mechanism controls interface navigation. Keep real authentication and API-route protection in Express, Fastify, Hono, or your backend.

::
