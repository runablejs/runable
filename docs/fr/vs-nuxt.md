---
title: Syora vs Nuxt
description: Comprendre les différences fondamentales et choisir le bon outil pour votre projet.
---

::u-tip
---
variant: info
title: Avant tout
---

**Nuxt est excellent.** C'est le framework de référence pour les applications Vue full-stack. Syora n'existe pas pour le remplacer, mais pour offrir une alternative quand Nuxt impose un compromis que vous ne souhaitez pas faire.

::

## Ce qu'ils partagent

Syora et Nuxt partagent la même philosophie de **Developer Experience (DX)**. Si vous connaissez l'un, l'autre vous sera immédiatement familier :

| Fonctionnalité | Nuxt | Syora |
| --- | --- | --- |
| Routage filesystem (`pages/`) | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> |
| Layouts (`layouts/`) | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> |
| Auto-imports (composables, composants) | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> |
| `useAsyncData` + SSR | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> |
| Middlewares de route | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> |
| Modules extensibles | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> |
| Plugins Vue avec hooks | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> |
| SEO / `<Head>` | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> (Unhead natif) | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> (Unhead natif) |
| Dev server Vite | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> |
| SSG / Prerender | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> | 🚧 (roadmap) |

**Sur le plan de l'expérience développeur, Syora est un cousin proche de Nuxt.** La courbe d'apprentissage est quasi nulle si vous venez de l'écosystème Nuxt.

## La différence fondamentale : le runtime

C'est ici que les deux frameworks divergent radicalement.

### Nuxt : le framework tout-en-un

Nuxt est un **framework full-stack complet**. Il embarque :

- Le framework Vue (frontend)
- **Nitro** (backend / runtime serveur)
- Le bundler (Vite)
- Le router (vue-router)
- Le système de modules
- Les API routes (`server/api/`)
- Le middleware serveur

```
┌────────────────────────────────────────┐
│              Votre App                 │
│  ┌─────────┐      ┌─────────────────┐  │
│  │  Vue    │◄────►│     Nitro       │  │
│  │ (pages) │      │ (API, middleware)│  │
│  └─────────┘      └─────────────────┘  │
│         ↑ Tout est intégré             │
└────────────────────────────────────────┘
```

**Avantage** : zéro configuration, tout fonctionne ensemble dès le premier `npm run dev`.

**Inconvénient** : vous ne pouvez pas remplacer Nitro par un autre backend. Si vous avez besoin de Fastify, NestJS ou AdonisJS, vous devez les faire coexister avec Nitro (ou les abandonner).

### Syora : le framework Vue agnostique

Syora est un **framework d'application Vue**. Il embarque :

- Le framework Vue (frontend)
- Le bundler (Vite)
- Le router (vue-router)
- Le système de modules
- Les auto-imports
- Le SSR / hydration

Mais il **ne fournit pas de runtime serveur**. Il s'attend à ce que **vous** fournissiez le serveur HTTP.

```
┌────────────────────────────────────────┐
│           Votre Backend                │
│  (Express / Fastify / NestJS / ...)    │
│         ← Vous le contrôlez            │
└────────────────────────────────────────┘
                  │
                  │ app.use(syora)
                  ▼
┌────────────────────────────────────────┐
│              Syora                     │
│  (Routing, Layouts, SSR, Vue App)      │
│         ← Syora le fournit             │
└────────────────────────────────────────┘
```

**Avantage** : liberté totale sur le serveur. Vous gardez votre infrastructure existante.

**Inconvénient** : vous devez configurer vous-même le pont entre votre backend et Syora (même si cela ne prend que quelques lignes).

## Matrice de décision

### Choisissez Nuxt si...

<div class="py-3 space-y-2">
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon>
    <span>Vous démarrez un projet <strong>from scratch</strong></span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon>
    <span>Vous voulez un framework <strong>batteries-included</strong> sans configurer de serveur</span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon>
    <span>Vous avez besoin des <strong>API routes</strong> (`server/api/`) et du middleware serveur natif</span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon>
    <span>Vous voulez du <strong>SSG / prerendering</strong> natif et mature</span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon>
    <span>Vous voulez le plus grand <strong>écosystème de modules</strong> (Nuxt Modules)</span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon>
    <span>Votre équipe n'a pas de préférence backend forte</span>
  </div>
</div>

### Choisissez Syora si...

<div class="py-3 space-y-2">
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon>
    <span>Vous avez déjà un <strong>backend en production</strong> (Fastify, NestJS, AdonisJS, Koa, Express, Hono...)</span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon>
    <span>Vous avez besoin de <strong>fonctionnalités serveur</strong> que Nitro n'expose pas facilement</span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon>
    <span>Votre architecture impose un <strong>runtime spécifique</strong> (edge, workers, IoC container...)</span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon>
    <span>Vous voulez <strong>un seul projet</strong> (backend + frontend) sans duplication de logique</span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon>
    <span>Vous préférez <strong>séparer</strong> clairement la couche Vue de la couche serveur</span>
  </div>
</div>

## Comparaison détaillée

### Architecture

| | Nuxt | Syora |
| --- | --- | --- |
| **Runtime serveur** | Nitro (imposé) | Aucun (vous choisissez) |
| **API routes** | `server/api/` natif | Via votre backend |
| **Middleware serveur** | Natif (Nitro) | Via votre backend |
| **Déploiement** | Vercel, Netlify, Node, Deno, Bun... | Node, Deno, Bun, Workers... (via votre backend) |
| **Taille du bundle** | Framework + Nitro | Framework Vue uniquement |

### Intégration backend

| Backend | Avec Nuxt | Avec Syora |
| --- | --- | --- |
| **Express** | Coexiste avec Nitro | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> Intégration native |
| **Fastify** | Coexiste avec Nitro | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> Intégration native |
| **NestJS** | Séparation frontend/backend | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> Intégration dans un module |
| **AdonisJS** | Séparation frontend/backend | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> Intégration via middleware |
| **Hono** | Possible mais non natif | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> Intégration native |
| **Bun/Deno natif** | Via Nitro | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> Direct |

### Developer Experience

| | Nuxt | Syora |
| --- | --- | --- |
| **Courbe d'apprentissage** | Douce | Douce (mêmes conventions) |
| **Configuration** | `nuxt.config.ts` | `syora.config.ts` |
| **CLI** | `nuxt dev`, `nuxt build` | `syora dev`, `syora build` |
| **Auto-imports** | Composables, composants | Composables, composants, globals |
| **TypeScript** | Excellent | Excellent (types générés pour les modules) |
| **Devtools** | Nuxt DevTools | 🚧 (roadmap) |

## Les cas limites

### "J'ai un backend NestJS mais je veux la DX Nuxt"

**Avec Nuxt** : vous avez deux options :

1. **Abandonner NestJS** et migrer toute votre logique métier dans Nitro (coûteux, risqué)
2. **Séparer les projets** : API NestJS + frontend Nuxt (duplication, complexité)

**Avec Syora** : vous intégrez Syora **dans** votre application NestJS comme un module. Une seule codebase, un seul déploiement, zéro duplication.

### "Je veux du SSG pour un blog"

**Avec Nuxt** : `nuxt generate` — natif, mature, parfait.

**Avec Syora** : Le SSG n'est pas encore implémenté. Pour un blog purement statique, Nuxt est le choix évident aujourd'hui.

### "Je démarre un SaaS from scratch"

**Avec Nuxt** : Vous avez tout en main. Nitro gère les API routes, le middleware, le caching. C'est le chemin le plus rapide.

**Avec Syora** : Vous devez choisir et configurer votre backend (Fastify ? Express ?). C'est un peu plus de travail initial, mais vous gardez la liberté de changer d'avis plus tard.

## Migration : Nuxt → Syora

Si vous avez un projet Nuxt et que vous envisagez Syora, voici ce qui change concrètement :

### Ce qui reste identique

- La structure `pages/`, `layouts/`, `composables/`
- La syntaxe `useAsyncData`, `useRoute`, `useRouter`
- Les layouts via `definePageMeta({ layout: 'admin' })`
- Les auto-imports

### Ce qui change

| Avant (Nuxt) | Après (Syora) |
| --- | --- |
| `nuxt.config.ts` | `syora.config.ts` |
| `server/api/` | Votre propre backend (Express routes, NestJS controllers...) |
| `server/middleware/` | Votre propre middleware serveur |
| `useFetch` | `useFetch` (même API, basé sur `ofetch`) — sans typage automatique des routes backend |
| `useNuxtApp()` | `useApp()` |
| `defineNuxtPlugin()` | `defineVuePlugin()` |
| `defineNuxtRouteMiddleware()` | `defineVueMiddleware()` |
| `defineNuxtModule()` | `defineModule()` |
| `nuxt dev` | Votre serveur Node (ex: `tsx watch server.ts`) |

## En résumé

> **Nuxt est un framework full-stack. Syora est un framework frontend qui s'intègre dans votre stack existante.**

| | Nuxt | Syora |
| --- | --- | --- |
| **Mental model** | "Donnez-moi un projet vide, je vous donne une app full-stack" | "Donnez-moi votre backend, je vous donne la DX Nuxt" |
| **Quand le choisir** | From scratch, batteries-included | Backend existant, liberté runtime |
| **Lock-in** | Nitro | Aucun (runtime-agnostic) |

Les deux sont des outils excellents. Le bon choix dépend de **ce que vous avez déjà** et de **ce que vous voulez garder**.

::u-tip
---
variant: info
title: Encore hésitant ?
---

Si vous avez un backend existant que vous ne voulez pas abandonner → <a href="./getting-started/quickstart.md">essayez Syora</a>.

Si vous démarrez un nouveau projet sans contrainte backend → <a href="https://nuxt.com">Nuxt</a> est probablement votre meilleur ami.

::
