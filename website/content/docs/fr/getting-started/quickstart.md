---
title: Quick Start
description: Créez une application Syora avec deux pages, un layout, une route API et des données rendues côté serveur.
---

Construisez une petite application qui combine routing automatique, layout partagé et chargement de données SSR.

Cette page part du projet Express créé dans <a href="./installation.md">Installation</a>.

## Ajouter une route API

Remplacez `server.ts` par cet exemple :

```ts
// server.ts
import Express from "express";
import { express } from "@syora/core";

const server = Express();

server.get("/api/projects", (_req, res) => {
  res.json([
    { id: 1, name: "Documentation" },
    { id: 2, name: "Dashboard" },
  ]);
});

server.use(express());

server.listen(3000, () => {
  console.log("http://localhost:3000");
});
```

Votre API reste une route Express normale. Syora ne la déplace pas dans le frontend.

## Créer un layout

```vue
<!-- app/layouts/default.vue -->
<template>
  <div>
    <header>
      <strong>Mon application</strong>

      <nav>
        <RouterLink to="/">Accueil</RouterLink>
        <RouterLink to="/projects">Projets</RouterLink>
      </nav>
    </header>

    <main>
      <slot />
    </main>
  </div>
</template>
```

Le layout `default.vue` enveloppe les pages qui ne demandent pas explicitement un autre layout.

## Créer la page d'accueil

```vue
<!-- app/pages/index.vue -->
<template>
  <section>
    <h1>Bienvenue</h1>
    <p>Le backend Express et l'application Vue vivent dans le même projet.</p>
  </section>
</template>
```

Le fichier `app/pages/index.vue` correspond automatiquement à `/`.

## Charger des données

Créez une seconde page :

```vue
<!-- app/pages/projects.vue -->
<script setup lang="ts">
type Project = {
  id: number;
  name: string;
};

const { data: projects, pending, error, refresh } = await useAsyncData(
  "projects",
  async (signal) => {
    const response = await fetch("http://localhost:3000/api/projects", {
      signal,
    });

    if (!response.ok) {
      throw new Error("Impossible de charger les projets");
    }

    return response.json() as Promise<Project[]>;
  },
);
</script>

<template>
  <section>
    <h1>Projets</h1>

    <p v-if="pending">Chargement…</p>
    <p v-else-if="error">{{ error.message }}</p>

    <ul v-else>
      <li v-for="project in projects" :key="project.id">
        {{ project.name }}
      </li>
    </ul>

    <button type="button" @click="refresh">Actualiser</button>
  </section>
</template>
```

`useAsyncData()` exécute le fetch pendant le rendu serveur. Syora place ensuite le résultat dans le HTML et restaure le cache côté client. Le navigateur ne relance donc pas immédiatement la même requête pendant l'hydratation.

::u-tip
---
variant: info
title: Une clé stable par ressource
---

La clé `projects` identifie l'entrée de cache et permet de dédupliquer les appels simultanés. Utilisez une clé différente lorsque les paramètres de la requête changent.

::

## Observer le routing automatique

Votre dossier contient maintenant deux routes :

```text
app/pages/
├── index.vue       → /
└── projects.vue    → /projects
```

Ajoutez un fichier dans `app/pages/` pour créer une route. Vous n'avez aucun tableau de routes à maintenir.

## Ce que vous venez d'utiliser

| Besoin | Solution Syora |
| --- | --- |
| Afficher plusieurs écrans | Routing basé sur `app/pages/` |
| Partager la navigation | Layout `default.vue` |
| Conserver les routes métier | Route `/api/projects` dans Express |
| Précharger des données en SSR | `useAsyncData()` |
| Éviter un second fetch au montage | Sérialisation et hydratation du cache |

::u-tip
---
variant: info
title: Prochaine étape
---

Comparez ce modèle à celui de Nuxt dans <a href="./vs-nuxt.md">Syora vs Nuxt</a>.

::
