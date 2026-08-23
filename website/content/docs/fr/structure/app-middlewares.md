---
title: app/middlewares
description: Contrôlez les navigations Vue avec des middlewares globaux ou nommés.
---

Un middleware s'exécute pendant une navigation Vue Router. Utilisez-le pour vérifier une session, rediriger ou bloquer l'accès à une page.

```ts
// app/middlewares/auth.ts
export default defineVueMiddleware((to) => {
  const user = useCurrentUser();

  if (!user.value && to.path !== "/login") {
    return "/login";
  }
});
```

Référencez ensuite son nom depuis la page :

```ts
definePageMeta({
  middleware: ["auth"],
});
```

Un fichier portant le suffixe `.global.ts` s'applique à toutes les navigations :

```text
app/middlewares/analytics.global.ts
```

Ces middlewares appartiennent au routeur Vue. Les middlewares HTTP, l'authentification de vos routes API et la validation des requêtes restent dans votre backend.

