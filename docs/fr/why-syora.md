---
title: Pourquoi Syora ?
description: Le compromis que Syora élimine, et pourquoi il existe.
---

# Pourquoi Syora ?

## Le couplage qui coince

Adopter Nuxt aujourd'hui, c'est adopter **Nitro** comme runtime serveur.

Ce couplage est cohérent et excellent pour une majorité de projets. Mais il devient une **contrainte réelle** dès que vous souhaitez vous appuyer sur un framework backend plus spécialisé :

- **Fastify** pour ses performances
- **NestJS** pour son architecture modulaire et son injection de dépendances
- **AdonisJS** pour ses conventions robustes et son IoC
- **Koa** pour sa légèreté
- **Hono** pour l'edge
- Ou simplement votre **propre serveur HTTP** maison

Ces frameworks offrent des écosystèmes riches, éprouvés, déjà adoptés par les entreprises. Leur abandonner la main sur le runtime, c'est renoncer à des années d'investissement.

## Le dilemme

Face à ce besoin d'infrastructure spécifique, les développeurs se retrouvent coincés entre **deux options insatisfaisantes**.

### Option 1 : Le retour au "Vue pur"

::u-tip
---
variant: warning
title: Vous choisissez la liberté du serveur...
::
---

<div class="py-3">
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-x" class="size-6 text-destructive"></u-icon>
    <span>Routage automatique basé sur les fichiers</span>
  </div>

  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-x" class="size-6 text-destructive"></u-icon>
    <span>Layouts déclaratifs</span>
  </div>

  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-x" class="size-6 text-destructive"></u-icon>
    <span>Auto-imports de composables et composants</span>
  </div>

  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-x" class="size-6 text-destructive"></u-icon>
    <span>`useAsyncData` et son hydratation SSR</span>
  </div>

  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-x" class="size-6 text-destructive"></u-icon>
    <span>Système de modules et de plugins</span>
  </div>

  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-x" class="size-6 text-destructive"></u-icon>
    <span>Middlewares de route</span>
  </div>
</div>

**Résultat** : vous recodez Nuxt morceau par morceau, ou vous vivez sans.
::

### Option 2 : Les projets séparés (Headless)

::u-tip
---
variant: warning
title: Vous développez votre backend idéal d'un côté...
::
---

...et un frontend Nuxt de l'autre.

**Résultat** :

<div class="py-3">
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-x" class="size-6 text-destructive"></u-icon>
    <span>Architecture lourde avec deux codebases</span>
  </div>

  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-x" class="size-6 text-destructive"></u-icon>
    <span>Complexité de déploiement doublée</span>
  </div>

  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-x" class="size-6 text-destructive"></u-icon>
    <span>Duplication des logiques (validation, types, auth)</span>
  </div>

  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-x" class="size-6 text-destructive"></u-icon>
    <span>Context switching permanent entre les équipes</span>
  </div>
</div>
::

## Syora supprime ce compromis

**Syora apporte toute l'expérience développeur de Nuxt directement à Vue.js**, tout en restant strictement indépendant du serveur.

Vous conservez :

| Ce que Nuxt fait bien | Ce que Syora vous apporte                     |
| --------------------- | --------------------------------------------- |
| Routage automatique   | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> `pages/` avec conventions filesystem       |
| Layouts               | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> `layouts/default.vue`, sélection dynamique |
| Auto-imports          | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> Composables, composants, globals           |
| Data fetching         | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> `useAsyncData` avec cache, SSR, hydration  |
| SSR                   | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> Rendu serveur complet + sérialisation      |
| Modules               | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> `defineModule()` avec typage généré        |
| Plugins               | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> `defineVuePlugin()` avec lifecycle hooks   |
| Middlewares           | <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon> Route guards intégrés                      |

**La seule différence ?** Vous êtes libre d'exécuter l'application sur le serveur de votre choix.

## Intégration naturelle

Que votre architecture repose sur **Fastify**, **NestJS**, **AdonisJS**, **Express**, **Koa**, **Hono**, **H3**, **Bun**, **Deno**, ou toute autre technologie capable de traiter des requêtes HTTP — Syora s'y intègre sans friction.

```ts
// Express : 10 lignes
import { createSyoraApp, requestNode } from "@syora/core";
import express from "express";

const app = express();
const vite = await createSyoraApp();

app.use(vite?.middlewares ?? express.static("./dist/client"));
app.use("*all", (req, res) => requestNode({ vite, req, res }));

app.listen(5173);
```

Syora ne remplace pas votre backend. Il s'installe **à côté**, comme une couche Vue qui sait dialoguer avec n'importe quel serveur HTTP.

## Le résultat

> **Choisissez votre backend pour ses qualités intrinsèques, sans jamais renoncer au confort de développement de Nuxt.**

Vous gardez :

- Votre architecture backend
- Vos conventions métier
- Vos performances et vos optimisations serveur

Vous gagnez :

- La DX Nuxt (routing, layouts, auto-imports, SSR)
- Un projet unique, pas deux
- Un déploiement simplifié

## Quand choisir quoi ?

| Votre situation                                    | Le bon choix                                 |
| -------------------------------------------------- | -------------------------------------------- |
| Projet from scratch, batteries included            | **Nuxt** — tout est intégré                  |
| Backend déjà existant (NestJS, Fastify, Adonis...) | **Syora** — intégration sans migration       |
| Besoin de contrôler le runtime serveur             | **Syora** — zéro lock-in                     |
| Architecture API-first, frontend léger             | **Vue + Vite** — pas besoin de framework app |
| Application enterprise avec IoC / DI               | **Syora** — conserve votre container         |

## Prêt à essayer ?

Si ce compromis vous parle, [démarrez votre premier projet en 60 secondes](./getting-started/quickstart.md).
