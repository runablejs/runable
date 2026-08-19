---
title: navigateTo
description: Current state of the navigateTo navigation helper.
---

```ts
function navigateTo(
  to: RouteLocationRaw | undefined | null,
): Promise<void | NavigationFailure | false> | false | void | RouteLocationRaw
```

::u-tip
---
variant: warning
title: Implementation pending
---

The function currently exposes its public signature but does not trigger navigation. Use `useRouter().push()` or `useRouter().replace()` until this API is complete.

::
