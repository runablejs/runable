---
title: Syora vs Nuxt
description: Comparez Syora et Nuxt selon le runtime serveur, l'intégration backend, les conventions Vue et la maturité de l'écosystème.
---

Syora et Nuxt proposent une expérience Vue structurée. Leur différence principale concerne la propriété du serveur.

## La différence en une phrase

Nuxt fournit une application complète autour de Nitro. Syora ajoute une application Vue à un backend que vous choisissez et exploitez vous-même.

```text
Nuxt                          Syora
┌──────────────────────┐      ┌────────────────────────────┐
│ Application Vue      │      │ Votre backend              │
│ Nuxt                 │      │ Express, Fastify, Hono…    │
│ Nitro                │      │ └─ Syora ─ Application Vue │
└──────────────────────┘      └────────────────────────────┘
```

## Comparaison rapide

| Sujet | Nuxt | Syora |
| --- | --- | --- |
| Runtime serveur | Nitro | Votre serveur HTTP |
| Pages basées sur les fichiers | Oui | Oui |
| Layouts | Oui | Oui |
| Auto-imports | Oui | Oui |
| Middlewares de route | Oui | Oui |
| SSR et hydratation | Oui | Oui |
| Chargement de données | `useAsyncData()` | `useAsyncData()` |
| Modules et plugins | Écosystème Nuxt | Systèmes propres à Syora |
| Déploiements documentés | Nombreux presets Nitro | Dépend de votre backend |
| Maturité | Écosystème établi | Projet en version alpha |

Une fonctionnalité portant le même nom ne garantit pas une API strictement identique. Consultez toujours la référence Syora avant de reprendre du code Nuxt.

## Choisir Nuxt

Choisissez Nuxt si vous voulez une solution intégrée et que Nitro convient à votre architecture.

Nuxt est généralement plus adapté si :

<div class="py-3 space-y-2">
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon>
    <span>vous démarrez un nouveau projet sans contrainte de runtime ;</span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon>
    <span>vous voulez profiter d'un écosystème ancien et étendu ;</span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon>
    <span>vous préférez des presets de déploiement déjà intégrés ;</span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon>
    <span>votre équipe connaît déjà les conventions Nuxt.</span>
  </div>
</div>

## Choisir Syora

Choisissez Syora lorsque le backend est une décision structurante et ne doit pas être remplacé.

Syora est généralement plus adapté si :

<div class="py-3 space-y-2">
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon>
    <span>Express, Fastify, NestJS, AdonisJS, Koa ou Hono héberge déjà votre métier ;</span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon>
    <span>vous devez conserver un conteneur IoC, des middlewares ou un cycle de vie serveur précis ;</span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon>
    <span>vous voulez servir l'API et l'interface depuis la même application ;</span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon>
    <span>votre infrastructure dépend directement du runtime choisi.</span>
  </div>
</div>

## Ce qui change dans le code serveur

Avec Syora, le point d'entrée HTTP vous appartient :

```ts
// server.ts
import { express } from "@syora/core/adapters/express";

server.get("/api/users", usersController);
server.use(express());
```

Vous décidez de l'ordre des middlewares, des routes API, de l'observabilité et du démarrage du serveur. L'adaptateur initialise Syora et prend en charge les requêtes qui lui parviennent.

## Ce qui reste familier

Un développeur Nuxt reconnaîtra plusieurs conventions :

| Nuxt | Syora |
| --- | --- |
| `pages/` | `app/pages/` |
| `layouts/` | `app/layouts/` |
| `components/` | `app/components/` |
| `composables/` | `app/composables/` |
| `plugins/` | `app/plugins/` |
| `middleware/` | `app/middlewares/` |
| `definePageMeta()` | `definePageMeta()` |
| `useAsyncData()` | `useAsyncData()` |
| `defineNuxtPlugin()` | `defineVuePlugin()` |
| `defineNuxtModule()` | `defineModule()` |

::u-tip
---
variant: warning
title: Pas un remplacement à l'identique
---

Syora reprend des conventions utiles, pas l'intégralité de Nuxt. Les modules Nuxt, les API Nitro et les presets de déploiement Nitro ne sont pas directement compatibles.

::

## Décider rapidement

| Question | Si la réponse est oui |
| --- | --- |
| Nitro répond-il à vos besoins serveur ? | Commencez par évaluer Nuxt |
| Un backend existant doit-il rester maître du serveur ? | Évaluez Syora |
| Avez-vous seulement besoin d'une SPA légère ? | Vue et Vite peuvent suffire |
| La stabilité de production prime-t-elle sur la liberté du runtime ? | Tenez compte du statut alpha de Syora |

::u-tip
---
variant: info
title: Prochaine étape
---

Personnalisez les dossiers, le SSR et Vite dans <a href="/docs/getting-started/configuration.md">Configuration</a>.

::
