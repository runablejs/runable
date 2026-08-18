AdonisJS est un framework complet basé sur un conteneur IoC et une structure de fichiers imposée (comme Nest, mais encore plus strict) — impossible de faire un simple script `app.use()` ad-hoc comme avec Express/Fastify. Il faut passer par les conventions du framework : un middleware serveur global (équivalent de `vite.middlewares`) et une route wildcard (équivalent du catch-all SSR).

⚠️ Ceci suppose un projet AdonisJS 6 déjà scaffoldé (`npm init adonisjs@latest`), pas un ajout sur un projet Express existant.

## Installation

```bash
npm install serve-static
```

## `app/vite.ts` — instance Vite partagée (singleton)

```typescript
import { createSyoraApp, useConfig } from "../../../src";

let vitePromise: ReturnType<typeof createSyoraApp> | null = null;

export function getVite() {
  if (!vitePromise) vitePromise = createSyoraApp();
  return vitePromise;
}

export const config = useConfig();
```

## `app/middleware/vite_middleware.ts` — pont vers `vite.middlewares`

```typescript
import type { HttpContext } from "@adonisjs/core/http";
import type { NextFn } from "@adonisjs/core/types/http";
import { join } from "node:path";
import serveStatic from "serve-static";
import { getVite, config } from "../vite.js";

let staticHandler: ReturnType<typeof serveStatic> | null = null;

export default class ViteMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const vite = await getVite();
    const req = ctx.request.request;
    const res = ctx.response.response;

    await new Promise<void>((resolve) => {
      if (vite) {
        vite.middlewares(req, res, () => resolve());
      } else {
        if (!staticHandler) {
          staticHandler = serveStatic(join(config.distDir, "client"), { extensions: [] });
        }
        staticHandler(req, res, () => resolve());
      }
    });

    if (res.writableEnded) return;
    await next();
  }
}
```

## `start/kernel.ts` — enregistrement en middleware serveur (global, avant le routing)

```typescript
import server from "@adonisjs/core/services/server";

server.use([() => import("../app/middleware/vite_middleware.js")]);
```

## `start/routes.ts` — catch-all SSR

```typescript
import router from "@adonisjs/core/services/router";
import { serve } from "../../../src";
import { getVite } from "../app/vite.js";

router.get("*", async ({ request, response }) => {
  const vite = await getVite();
  const html = await serve({ vite, url: request.url(true) });
  response.header("Content-Type", "text/html");
  return html;
});
```

## Différences avec la version Express

**1. `server.use()` vs middleware de route**
`server.use()` dans `start/kernel.ts` enregistre un middleware **global**, exécuté sur *toutes* les requêtes avant même le routing — c'est l'équivalent exact de `app.use(vite.middlewares)` placé avant les routes en Express. C'est distinct des "named middleware" ou "router middleware" d'Adonis, qui eux ne s'appliquent qu'à des routes spécifiques.

**2. Pont manuel obligatoire**
Comme Hono et Nitro, Adonis n'a pas de compatibilité Connect/Express native — j'utilise `ctx.request.request` / `ctx.response.response` pour récupérer les objets Node bruts et les passer à `vite.middlewares(req, res, next)`, exactement comme le fait `fromNodeMiddleware` de h3 en interne pour Nitro.

**3. `res.writableEnded` pour détecter la fin**
Contrairement à Fastify (`middie` gère ça nativement) ou Express (`next()` retombe naturellement), ici il faut vérifier manuellement si `vite.middlewares` a effectivement écrit une réponse avant d'appeler `next()` — sinon Adonis continuerait vers la route SSR même quand Vite a déjà servi un asset.

**4. `request.url(true)`**
Équivalent de `req.originalUrl` en Express : le `true` inclut la query string dans l'URL retournée.

**5. Singleton `getVite()`**
Comme le middleware et la route ont chacun besoin de l'instance Vite, je la centralise dans `app/vite.ts` plutôt que de rappeler `createSyoraApp()` à deux endroits (ce qui créerait deux serveurs Vite dev distincts).

---

⚠️ Vérifie la syntaxe exacte du wildcard `router.get("*", ...)` selon ta version d'Adonis — certaines versions préfèrent `router.get("/*", ...)` ou nécessitent une route séparée pour `/` racine en plus du wildcard. Dis-moi ta version exacte (`@adonisjs/core`) si tu veux que je l'ajuste précisément.
