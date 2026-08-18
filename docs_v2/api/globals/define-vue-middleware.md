---
title: defineVueMiddleware
description: Déclarez un ou plusieurs middlewares de navigation typés.
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

La fonction normalise toujours son argument en tableau. Chaque middleware reçoit `to` et `from`, puis peut retourner les mêmes valeurs qu'un guard Vue Router : une destination, `false`, `true`, `undefined` ou une promesse.

Suffixez le fichier avec `.global.ts` pour l'exécuter sur toutes les routes.

