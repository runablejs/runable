---
title: navigateTo
description: Navigate to another route from a component, composable, or plugin.
---

```ts
function navigateTo(
  to: RouteLocationRaw | undefined | null,
  options?: { replace?: boolean },
): Promise<void | NavigationFailure> | undefined
```

By default, `navigateTo()` adds an entry to the browser history with `router.push()`:

```ts
await navigateTo("/projects");
await navigateTo({
  name: "project-details",
  params: { id: "42" },
});
```

Set `replace` to avoid keeping the current URL in the history:

```ts
await navigateTo("/login", { replace: true });
```

Passing `null` or `undefined` does nothing and returns `undefined`. Navigation failures and errors are returned or rejected by Vue Router, so callers can handle them normally.
