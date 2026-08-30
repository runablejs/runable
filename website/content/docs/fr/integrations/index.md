---
title: Intégrations
description: Branchez Runable à Express, Fastify, Hono, Koa, NestJS, AdonisJS, Bun, Deno ou un serveur personnalisé.
---

Un adaptateur relie les requêtes de votre backend au moteur de rendu Runable. Il initialise l'application une seule fois, laisse Vite servir ses ressources en développement lorsque le runtime le permet, puis produit la réponse Vue.

En production, chaque adaptateur officiel sert également les fichiers générés depuis `distdir/client` avant de déléguer le reste au rendu Vue. Il n'est pas nécessaire d'enregistrer un plugin de fichiers statiques supplémentaire pour `.output/client`.

## Adaptateurs disponibles

| Backend | API Runable | Forme |
| --- | --- | --- |
| Express | `express()` | Middleware |
| Fastify | `fastify()` | Plugin |
| Hono | `hono()` | Middleware |
| Koa | `koa()` | Middleware |
| NestJS | `RunableModule.register()` | Module plateforme Express |
| AdonisJS | `adonis()` | Handler catch-all |
| Bun | `bun()` | Handler Fetch API |
| Deno | `deno()` | Handler Fetch API |

h3 et les autres serveurs utilisent actuellement les fonctions bas niveau `createRunableApp()`, `requestNode()` ou `requestWeb()`.

## Option commune

Tous les adaptateurs acceptent une instance déjà initialisée :

```ts
type RunableAdapterOptions = {
  runableApp?: Promise<ViteDevServer | null> | ViteDevServer | null;
};
```

Sans cette option, l'adaptateur appelle lui-même `createRunableApp()` une seule fois.

::u-tip
---
variant: warning
title: Gardez vos routes API prioritaires
---

Montez l'adaptateur comme fallback, après les routes métier, sauf lorsque le framework demande un middleware placé avant les routes pour pouvoir appeler `next()`.

::
