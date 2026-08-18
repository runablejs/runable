---
title: Intégrations
description: Branchez Syora à Express, Fastify, Hono, Koa, NestJS, AdonisJS, Bun, Deno ou un serveur personnalisé.
---

Un adaptateur relie les requêtes de votre backend au moteur de rendu Syora. Il initialise l'application une seule fois, laisse Vite servir ses ressources en développement lorsque le runtime le permet, puis produit la réponse Vue.

## Adaptateurs disponibles

| Backend | API Syora | Forme |
| --- | --- | --- |
| Express | `express()` | Middleware |
| Fastify | `fastify()` | Plugin |
| Hono | `hono()` | Middleware |
| Koa | `koa()` | Middleware |
| NestJS | `nestjs()` | Middleware plateforme Express |
| AdonisJS | `adonis()` | Handler catch-all |
| Bun | `bun()` | Handler Fetch API |
| Deno | `deno()` | Handler Fetch API |

h3 et les autres serveurs utilisent actuellement les fonctions bas niveau `createSyoraApp()`, `requestNode()` ou `requestWeb()`.

## Option commune

Tous les adaptateurs acceptent une instance déjà initialisée :

```ts
type SyoraAdapterOptions = {
  syoraApp?: Promise<ViteDevServer | null> | ViteDevServer | null;
};
```

Sans cette option, l'adaptateur appelle lui-même `createSyoraApp()` une seule fois.

::u-tip
---
variant: warning
title: Gardez vos routes API prioritaires
---

Montez l'adaptateur comme fallback, après les routes métier, sauf lorsque le framework demande un middleware placé avant les routes pour pouvoir appeler `next()`.

::

