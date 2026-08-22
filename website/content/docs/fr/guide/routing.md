---
title: Routing
description: Créez les routes de votre application à partir des fichiers du dossier app/pages.
---

Runable transforme les composants de `app/pages/` en routes Vue Router. Ajoutez, déplacez ou supprimez un fichier : la table de routes suit automatiquement.

## Créer des routes

```text
app/pages/
├── index.vue                 → /
├── about.vue                 → /about
├── projects/
│   ├── index.vue             → /projects
│   └── [id].vue              → /projects/:id
├── blog/[[page]].vue         → /blog/:page?
└── docs/[...path].vue        → /docs/:path*
```

Dans une route dynamique, lisez les paramètres avec `useRoute()` :

```vue
<script setup lang="ts">
const route = useRoute();
const projectId = computed(() => String(route.params.id));
</script>

<template>
  <h1>Projet {{ projectId }}</h1>
</template>
```

## Définir les métadonnées d'une page

`definePageMeta()` est auto-importé dans les pages.

```vue
<script setup lang="ts">
definePageMeta({
  name: "project-details",
  layout: "dashboard",
  middleware: ["auth"],
});
</script>
```

Utilisez les champs suivants pour piloter la route :

| Champ | Effet |
| --- | --- |
| `name` | Remplace le nom généré |
| `path` | Remplace le chemin généré |
| `alias` | Ajoute un ou plusieurs chemins alternatifs |
| `layout` | Sélectionne le layout |
| `middleware` | Exécute les middlewares nommés |

Les métadonnées des routes parentes sont transmises aux enfants. Une valeur définie par l'enfant prend le dessus.

## Naviguer

Utilisez `RunableLink` dans le template ou `navigateTo()` dans le script :

```vue
<template>
  <RunableLink to="/projects">Voir les projets</RunableLink>
</template>
```

```ts
await navigateTo({ name: "project-details", params: { id: "42" } });
```

Pour accéder directement à Vue Router, utilisez `useRoute()` et `useRouter()`.

## Afficher les pages imbriquées

Placez `RunablePage` dans une page parente pour afficher sa route enfant :

```vue
<!-- app/pages/projects.vue -->
<template>
  <section>
    <h1>Projets</h1>
    <RunablePage />
  </section>
</template>
```

::u-tip
---
variant: info
title: Rechargement à chaud
---

Vue Router prend en charge les changements dans `app/pages/`. Vous n'avez pas besoin de redémarrer le serveur après l'ajout d'une page.

::
