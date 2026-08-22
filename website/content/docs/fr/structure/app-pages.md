---
title: app/pages
description: Créez les routes Vue à partir de l'arborescence des fichiers.
---

Chaque composant Vue placé dans `app/pages/` devient une route. Le chemin du fichier détermine l'URL.

```text
app/pages/
├── index.vue             → /
├── about.vue             → /about
├── users/[id].vue        → /users/:id
└── docs/[...slug].vue    → /docs/:slug(.*)
```

Créez une page comme un composant Vue normal :

```vue
<!-- app/pages/users/[id].vue -->
<script setup lang="ts">
const route = useRoute();
</script>

<template>
  <h1>Utilisateur {{ route.params.id }}</h1>
</template>
```

Ajoutez un layout ou des middlewares avec `definePageMeta()` :

```ts
definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
});
```

Runable délègue la détection et le rechargement des pages à Vue Router. Configurez `pages` dans `runable.config.ts` seulement si vos vues se trouvent ailleurs.

