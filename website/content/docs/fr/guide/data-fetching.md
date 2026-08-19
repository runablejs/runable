---
title: Data Fetching
description: Chargez des données avec cache, déduplication, annulation et hydratation SSR.
---

Utilisez `useAsyncData()` pour charger une ressource liée au rendu d'une page. Syora attend le résultat pendant le SSR, sérialise le cache dans le HTML puis le restaure avant l'hydratation.

## Charger une ressource

```vue
<script setup lang="ts">
type Project = { id: number; name: string };

const { data: projects, pending, error, refresh } = await useAsyncData(
  "projects",
  async (signal) => {
    return $fetch<Project[]>("/api/projects", { signal });
  },
);
</script>

<template>
  <p v-if="pending">Chargement…</p>
  <p v-else-if="error">{{ error.message }}</p>
  <ul v-else>
    <li v-for="project in projects" :key="project.id">{{ project.name }}</li>
  </ul>
  <button type="button" @click="refresh">Actualiser</button>
</template>
```

## Choisir une clé stable

La clé identifie l'entrée de cache et déduplique les requêtes simultanées. Incluez les paramètres qui changent le résultat :

```ts
const route = useRoute();
const id = computed(() => String(route.params.id));

const project = await useAsyncData(
  `project:${id.value}`,
  (signal) => $fetch(`/api/projects/${id.value}`, { signal }),
  { watch: [id] },
);
```

## Adapter l'exécution

```ts
const result = await useAsyncData("stats", loadStats, {
  server: true,
  lazy: false,
  immediate: true,
  ttl: 60_000,
  default: () => [],
  transform: (items) => items.slice(0, 10),
});
```

| Option | Utilisez-la pour |
| --- | --- |
| `server: false` | Réserver l'appel au navigateur |
| `lazy: true` | Ne pas bloquer le rendu SSR |
| `immediate: false` | Déclencher l'appel avec `execute()` |
| `ttl` | Régler la durée du cache |
| `default` | Fournir une valeur initiale |
| `transform` | Transformer avant la mise en cache |
| `watch` | Recharger après un changement réactif |

`refresh()` force un nouvel appel. `execute()` utilise le même moteur d'exécution.

::u-tip
---
variant: warning
title: URLs pendant le SSR
---

Une URL relative n'est pas toujours résolue comme dans le navigateur lorsque le fetcher s'exécute côté serveur. Utilisez une origine disponible dans votre configuration runtime si votre backend HTTP l'exige.

::
