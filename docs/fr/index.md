---
layout: home

hero:
  text: "The Vue framework that brings the <em class='font-display italic text-primary'>Nuxt</em> developer experience to <em class='font-display italic text-primary'>any</em> backend."
  tagline: File-system routing, auto-imports, layouts, SSR, and more — without
          imposing a specific server runtime. Run on NestJS, Fastify, Express,
          Hono, Deno, or any HTTP server you choose.
  
  actions:
    - theme: brand
      text: Commencer
      link: /getting-started/installation
    - theme: alt
      text: Pourquoi Syora ?
      link: /why-syora

features:
  - icon: 🔌
    title: Backend-agnostic
    details: Intégrez Syora dans Express, Fastify, NestJS, AdonisJS, Hono, Koa, Bun, Deno... ou votre propre serveur HTTP. Vous gardez votre backend.
  - icon: 🗂️
    title: Filesystem Routing
    details: Un fichier dans app/pages/ = une route. Zéro configuration de router. Conventions dynamiques [id], [...catchall], index.vue imbriqués.
  - icon: ⚡
    title: Auto-imports
    details: Composables, composants, globals et plugins sont automatiquement disponibles sans import explicite. Écrivez moins, faites plus.
  - icon: 🌊
    title: SSR & Hydration
    details: useAsyncData récupère les données côté serveur, les sérialise dans le HTML et les réhydrate côté client. Zéro flash, zéro double requête.
  - icon: 🖼️
    title: Layouts
    details: Définissez des layouts dans app/layouts/ et sélectionnez-les par page avec definePageMeta. Le layout default est appliqué automatiquement.
  - icon: 🔧
    title: Modules & Plugins
    details: Étendez Syora avec des modules typés (build-time) et des plugins Vue (runtime). Même API que Nuxt, même puissance.
---

## Intégrez Syora en 10 lignes

Ajoutez la couche Vue à votre backend existant. Vos routes API ne bougent pas.

::: code-group

```ts [Express]
import express from "express";
import { createServer, requestNode } from "@syora/core";

const app = express();
const vite = await createServer();

app.get("/api/users", (req, res) => res.json([{ id: 1, name: "Alice" }]));
app.use("*all", (req, res) => requestNode({ vite, req, res }));

app.listen(3000);
```

```ts [Fastify]
import Fastify from "fastify";
import { createServer, serve } from "@syora/core";

const app = Fastify();
const vite = await createServer();

app.get("/api/users", async () => [{ id: 1, name: "Alice" }]);
app.all("*", async (req, reply) => {
  const html = await serve({ vite, url: req.raw.url ?? req.url });
  reply.type("text/html").send(html);
});

await app.listen({ port: 3000 });
```

```ts [NestJS]
import { NestFactory } from "@nestjs/core";
import { createServer, requestNode } from "@syora/core";

const app = await NestFactory.create(AppModule);
const vite = await createServer();

app.use("*", async (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  await requestNode({ vite, req, res });
});

await app.listen(3000);
```

:::

## Ce que vous gagnez

| Fonctionnalité | Sans Syora | Avec Syora |
|---|---|---|
| Routing | `router.ts` manuel | `app/pages/` filesystem |
| Layouts | Composant wrapper manuel | `app/layouts/` + `definePageMeta` |
| Auto-imports | `import` partout | Rien à importer |
| Data fetching | `onMounted` + spinner | `useAsyncData` avec SSR |
| Composants globaux | Import manuel | `app/components/` auto-global |
| Plugins Vue | `app.use` manuel | `app/plugins/` auto-exécutés |

## Quand choisir Syora ?

::: tip Choisissez Syora si...
- Vous avez un backend existant que vous ne voulez pas abandonner
- Vous utilisez Fastify, NestJS, AdonisJS, Express, Koa, Hono...
- Vous voulez la DX Nuxt sans adopter Nitro
- Vous préférez un projet unique plutôt que frontend/backend séparés
:::

::: warning Nuxt reste excellent si...
- Vous démarrez un projet from scratch sans contrainte backend
- Vous voulez un framework batteries-included avec API routes natives
- Vous avez besoin de SSG / prerendering mature
:::

> **Syora n'est pas un concurrent de Nuxt. C'est une alternative quand Nuxt impose un compromis que vous ne souhaitez pas faire.**

## Prêt ?

```bash
npm create syora@latest
```

[Commencer l'installation →](/getting-started/installation)

