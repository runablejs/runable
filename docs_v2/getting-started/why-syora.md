---
title: Pourquoi Syora ?
description: Retrouvez une expérience proche de Nuxt dans Vue tout en conservant le backend et le serveur HTTP de votre choix.
---

Syora apporte à Vue les conventions attendues d'un framework full-stack, sans vous imposer un runtime serveur particulier.

## Le problème

Vue et Vite forment une base simple et flexible. Dès qu'une application grandit, vous devez toutefois choisir, intégrer et maintenir plusieurs briques :

<div class="py-3 space-y-2">
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-1-filled" class="size-5 text-muted-foreground"></u-icon>
    <span>un routeur et des conventions pour organiser les pages ;</span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-2-filled" class="size-5 text-muted-foreground"></u-icon>
    <span>des layouts, des middlewares et des auto-imports ;</span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-3-filled" class="size-5 text-muted-foreground"></u-icon>
    <span>le rendu serveur, l'hydratation et le chargement des données ;</span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-4-filled" class="size-5 text-muted-foreground"></u-icon>
    <span>un système de plugins et de modules réutilisables.</span>
  </div>
</div>

Nuxt fournit déjà cette expérience. Il s'appuie cependant sur Nitro pour exécuter la partie serveur. Ce choix convient à de nombreux projets, mais pas à ceux qui doivent conserver Express, Fastify, NestJS, AdonisJS, Koa, Hono ou un serveur HTTP interne.

Sans solution intermédiaire, vous devez généralement choisir entre deux architectures :

| Choix | Avantage | Contrepartie |
| --- | --- | --- |
| Vue et Vite seuls | Contrôle complet du serveur | Les conventions et fonctionnalités doivent être assemblées manuellement |
| Backend et frontend Nuxt séparés | Expérience Nuxt complète | Deux applications à développer, connecter et déployer |

## Ce que change Syora

Syora place une couche applicative Vue dans votre serveur existant. Votre backend continue de gérer HTTP, les routes API, l'authentification et la logique métier. Syora prend en charge le rendu de l'interface.

```text
Requête HTTP
    │
    ▼
Votre backend ──────► Routes API et logique métier
    │
    └───────────────► Syora ──► Application Vue
```

Concrètement, votre serveur transmet à Syora les requêtes destinées au frontend :

```ts
// server.ts
import Express from "express";
import { express } from "@syora/core";

const server = Express();

// Votre backend reste responsable de ses routes API.
server.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// L'adaptateur initialise Syora et rend les autres requêtes avec Vue.
server.use(express());

server.listen(3000);
```

::u-tip
---
variant: info
title: Une intégration additive
---

Vous n'avez pas besoin de réécrire votre backend. Ajoutez Syora à l'endroit où votre serveur doit rendre l'application Vue.

::

## Ce que Syora fournit

| Fonctionnalité | Convention ou API |
| --- | --- |
| Routing basé sur les fichiers | `app/pages/` |
| Layouts | `app/layouts/` |
| Composants et composables auto-importés | `app/components/` et `app/composables/` |
| Middlewares de navigation | `app/middlewares/` et `definePageMeta()` |
| Chargement de données | `useAsyncData()` |
| SSR et hydratation | Rendu serveur et restauration du cache côté client |
| Plugins applicatifs | `defineVuePlugin()` |
| Modules configurables | `defineModule()` |

Cette séparation vous permet de choisir le backend pour ses capacités propres sans reconstruire toute l'expérience développeur du frontend.

## Quand choisir Syora ?

Syora est adapté si :

<div class="py-3 space-y-2">
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon>
    <span>vous avez déjà un <strong>backend en production</strong> ;</span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon>
    <span>votre équipe dépend des conventions, plugins ou outils de ce backend ;</span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon>
    <span>vous voulez le SSR et une organisation proche de Nuxt dans la même application ;</span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon>
    <span>vous devez garder le contrôle du cycle de vie et du déploiement du serveur.</span>
  </div>
</div>

Un autre choix peut être plus simple dans les cas suivants :

| Besoin | Choix à envisager |
| --- | --- |
| Une solution intégrée avec son propre runtime serveur | Nuxt |
| Une SPA légère sans SSR ni conventions supplémentaires | Vue et Vite |
| Un frontend totalement indépendant du backend | Deux applications séparées |

::u-tip
---
variant: warning
title: Projet en version alpha
---

Syora est actuellement en version alpha. Vérifiez la disponibilité des fonctionnalités dont votre application dépend avant de l'utiliser en production.

::

## À retenir

Syora ne remplace pas votre backend. Il lui ajoute une application Vue structurée, rendue côté serveur ou côté client, avec des conventions prêtes à l'emploi.

::u-tip
---
variant: info
title: Prochaine étape
---

Installez les dépendances nécessaires dans <a href="./installation.md">Installation</a>.

::
