---
title: Concepts
description: Comprenez le rôle du backend, du moteur Runable, de l'application Vue, des fichiers générés et du rendu SSR.
---

Runable relie trois couches : votre serveur HTTP, le moteur du framework et votre application Vue.

## Les trois responsabilités

| Couche | Responsabilité |
| --- | --- |
| Votre backend | Écouter le réseau, exécuter les routes API et gérer le métier |
| Runable | Préparer l'application, générer ses conventions et produire la réponse frontend |
| Votre application Vue | Définir les pages, composants, layouts et interactions utilisateur |

Cette séparation permet de remplacer Express par Fastify ou Hono sans réorganiser les fichiers Vue.

## Le backend reste le point d'entrée

Runable ne démarre pas automatiquement votre serveur métier. Vous créez le serveur, puis vous lui transmettez les requêtes destinées au frontend.

```ts
// server.ts
import Express from "express";
import { express } from "runable/adapters/express";

const server = Express();

server.get("/api/orders", ordersController);
server.use(express());

server.listen(3000);
```

L'ordre reste sous votre contrôle. Placez les routes API avant l'adaptateur Runable pour qu'elles soient traitées par le backend.

## Des adaptateurs pour chaque backend

Chaque adaptateur initialise Runable une seule fois et traduit les objets du framework vers le moteur de rendu :

| Adaptateur | Environnement |
| --- | --- |
| `express()` | Middleware Express |
| `fastify()` | Plugin Fastify |
| `hono()` | Middleware Hono |
| `koa()` | Middleware Koa |
| `nestjs()` | Middleware NestJS avec plateforme Express |
| `adonis()` | Handler de route catch-all AdonisJS |
| `bun()` | Fonction `fetch` pour `Bun.serve()` |
| `deno()` | Fonction `fetch` pour `Deno.serve()` |

Les adaptateurs Node utilisent en interne les requêtes et réponses Node. Ceux de Bun et Deno utilisent les objets standards `Request` et `Response`.

### Brancher les autres backends

Placez toujours l'adaptateur après vos routes API ou en dernier fallback du routeur.

::u-code-group

```ts [Express]
// server.ts
import Express from "express";
import { express } from "runable/adapters/express";

const app = Express();
app.use(express());
app.listen(3000);
```

```ts [Fastify]
// server.ts
import Fastify from "fastify";
import { fastify } from "runable/adapters/fastify";

const app = Fastify();
await app.register(fastify());
await app.listen({ port: 3000 });
```

```ts [Hono]
// server.ts
import { Hono } from "hono";
import { hono } from "runable/adapters/hono";

const app = new Hono();
app.use("*", hono());

export default app;
```

```ts [Koa]
// server.ts
import Koa from "koa";
import { koa } from "runable/adapters/koa";

const app = new Koa();
app.use(koa());
app.listen(3000);
```

```ts [NestJS]
// main.ts
import { NestFactory } from "@nestjs/core";
import { nestjs } from "runable/adapters/nestjs";
import { AppModule } from "./app.module.js";

const app = await NestFactory.create(AppModule);
app.use(nestjs());
await app.listen(3000);
```

```ts [AdonisJS]
// start/routes.ts
import router from "@adonisjs/core/services/router";
import { adonis } from "runable/adapters/adonis";

router.any("*", adonis());
```

```ts [Bun]
// server.ts
import { bun } from "runable/adapters/bun";

Bun.serve({
  port: 3000,
  fetch: bun(),
});
```

```ts [Deno]
// server.ts
import { deno } from "runable/adapters/deno";

Deno.serve({ port: 3000 }, deno());
```

::

## Les conventions deviennent du code généré

Au démarrage, Runable lit `runable.config.ts`, résout les chemins puis configure plusieurs plugins Vite.

```text
app/pages/          ──► routes Vue Router
app/layouts/        ──► registre de layouts
app/components/     ──► composants disponibles
app/composables/    ──► imports automatiques
app/globals/        ──► fonctions et variables globales auto-importées
app/middlewares/    ──► guards de navigation
app/plugins/        ──► plugins installés dans Vue
```

Les déclarations et fichiers virtuels nécessaires sont écrits dans `.app/`. Ce dossier est généré : ne l'utilisez pas pour votre code source.

## Une application Vue par rendu serveur

Pour chaque rendu SSR, Runable crée une nouvelle application Vue. Elle installe ensuite le routeur, les layouts, les plugins, le gestionnaire de données et Unhead.

Cette isolation évite qu'un état lié à une requête soit partagé avec un autre utilisateur.

```text
Requête A ──► App Vue A ──► Cache A ──► HTML A
Requête B ──► App Vue B ──► Cache B ──► HTML B
```

Ne placez pas de données propres à un utilisateur dans une variable globale de module. Utilisez l'état créé dans le contexte de l'application.

## Le cycle SSR

Quand `ssr` vaut `true`, une requête suit ce parcours :

<div class="py-3 space-y-2">
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-1-filled" class="size-5 text-muted-foreground"></u-icon>
    <span>le backend transmet l'URL à Runable ;</span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-2-filled" class="size-5 text-muted-foreground"></u-icon>
    <span>Vue Router résout la page et ses middlewares ;</span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-3-filled" class="size-5 text-muted-foreground"></u-icon>
    <span><code>useAsyncData()</code> attend les données non lazy ;</span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-4-filled" class="size-5 text-muted-foreground"></u-icon>
    <span>Vue produit le HTML et Unhead injecte le head ;</span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-5-filled" class="size-5 text-muted-foreground"></u-icon>
    <span>Runable sérialise le cache de données dans la réponse ;</span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-6-filled" class="size-5 text-muted-foreground"></u-icon>
    <span>le navigateur restaure le cache puis hydrate l'application.</span>
  </div>
</div>

Avec `ssr: false`, Runable renvoie le template client sans rendre les composants sur le serveur.

## Pages et métadonnées

Un fichier placé dans `app/pages/` devient une route :

```text
app/pages/
├── index.vue            → /
├── account.vue          → /account
├── users/[id].vue       → /users/:id
└── docs/[...slug].vue   → /docs/:slug*
```

`definePageMeta()` complète les conventions du nom de fichier :

```vue
<!-- app/pages/account.vue -->
<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
});
</script>

<template>
  <h1>Mon compte</h1>
</template>
```

Les middlewares globaux s'exécutent sur chaque navigation. Les middlewares nommés sont chargés lorsqu'une page les référence.

## Plugins et modules

Un plugin agit au moment où l'application Vue est créée. Il peut fournir des valeurs, enregistrer des hooks ou installer une intégration cliente.

```ts
// app/plugins/api.ts
export default defineVuePlugin(() => {
  return {
    provide: {
      apiBase: "/api",
    },
  };
});
```

Un module agit plus tôt, pendant le chargement de la configuration. Il peut ajouter des dossiers, des plugins ou des options Vite à une application.

| Extension | Moment d'exécution | Usage typique |
| --- | --- | --- |
| Plugin | Création de l'application Vue | Injection, SDK client, hooks runtime |
| Module | Chargement de la configuration | Feature réutilisable, génération et configuration |

## Développement et production

En développement, `createRunableApp()` retourne une instance Vite en mode middleware. Votre backend l'utilise pour le HMR et la transformation des modules.

En production, `createRunableApp()` charge la configuration sans créer de serveur Vite. `runable build` doit avoir produit les fichiers attendus dans `.output/` avant le démarrage.

| Dossier | Statut | Contenu |
| --- | --- | --- |
| `app/` | Source | Votre application Vue |
| `public/` | Source | Assets statiques |
| `.app/` | Généré | Types, routes et registres virtuels |
| `.output/` | Généré | Artefacts du build de production |

## Modèle mental

Retenez cette règle : votre backend possède HTTP, Runable possède l'assemblage de l'application et Vue possède l'interface.

::u-tip
---
variant: success
title: Getting Started terminé
---

Vous pouvez maintenant parcourir la section Structure pour comprendre chaque dossier d'un projet Runable.

::
