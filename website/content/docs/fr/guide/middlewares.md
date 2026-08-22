---
title: Middlewares
description: Autorisez, bloquez ou redirigez une navigation avant l'affichage d'une page.
---

Les middlewares de `app/middlewares/` sont des gardes Vue Router. Ils s'exécutent dans le navigateur et pendant la navigation SSR.

## Créer un middleware nommé

```ts
// app/middlewares/auth.ts
export default defineVueMiddleware((to) => {
  const authenticated = false;

  if (!authenticated) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }
});
```

Attachez-le à une page avec son nom de fichier :

```vue
<script setup lang="ts">
definePageMeta({ middleware: ["auth"] });
</script>
```

## Créer un middleware global

Ajoutez le suffixe `.global` pour l'exécuter sur toutes les navigations :

```ts
// app/middlewares/analytics.global.ts
export default defineVueMiddleware((to, from) => {
  console.debug("navigation", from.fullPath, to.fullPath);
});
```

## Contrôler la navigation

Un middleware peut :

| Retour | Résultat |
| --- | --- |
| `undefined` ou `true` | Continue la navigation |
| `false` | Annule la navigation |
| Une route | Redirige vers cette route |
| Une erreur levée | Déclenche la gestion des erreurs du routeur |

Plusieurs middlewares peuvent être déclarés :

```ts
definePageMeta({ middleware: ["auth", "admin"] });
```

Runable charge les middlewares nécessaires, supprime les doublons puis les exécute dans l'ordre. Les middlewares globaux passent avant ceux de la route.

::u-tip
---
variant: warning
title: Middleware Vue, pas middleware HTTP
---

Ce mécanisme contrôle la navigation de l'interface. Placez l'authentification réelle et la protection des routes API dans Express, Fastify, Hono ou votre backend.

::
