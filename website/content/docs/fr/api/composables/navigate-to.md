---
title: navigateTo
description: Naviguez vers une autre route depuis un composant, un composable ou un plugin.
---

```ts
function navigateTo(
  to: RouteLocationRaw | undefined | null,
  options?: { replace?: boolean },
): Promise<void | NavigationFailure> | undefined
```

Par défaut, `navigateTo()` ajoute une entrée à l'historique avec `router.push()` :

```ts
await navigateTo("/projects");
await navigateTo({
  name: "project-details",
  params: { id: "42" },
});
```

Utilisez `replace` pour ne pas conserver l'URL courante dans l'historique :

```ts
await navigateTo("/login", { replace: true });
```

Passer `null` ou `undefined` ne déclenche aucune navigation et retourne `undefined`. Les échecs et erreurs de navigation sont transmis par Vue Router afin que l'appelant puisse les traiter normalement.

