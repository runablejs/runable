---
title: navigateTo
description: État actuel de l'helper de navigation navigateTo.
---

```ts
function navigateTo(
  to: RouteLocationRaw | undefined | null,
): Promise<void | NavigationFailure | false> | false | void | RouteLocationRaw
```

::u-tip
---
variant: warning
title: Implémentation en attente
---

La fonction possède actuellement sa signature publique, mais ne déclenche aucune navigation. Utilisez `useRouter().push()` ou `useRouter().replace()` jusqu'à la finalisation de cette API.

::

