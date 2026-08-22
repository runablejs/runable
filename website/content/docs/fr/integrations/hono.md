---
title: Hono
description: Utilisez Runable comme fallback après les routes Hono.
---

## Installation

```bash
pnpm add runable vue vue-router hono
```

Ajoutez `@hono/node-server` si vous exécutez Hono avec Node.js.

## Configuration

```ts
// server.ts
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { hono } from "runable/adapters/hono";

const app = new Hono();

app.use("*", hono());

app.get("/api/health", (context) => {
  return context.json({ status: "ok" });
});

serve({ fetch: app.fetch, port: 3000 });
```

Le middleware appelle d'abord `next()`. Il conserve donc toute réponse différente de `404` et rend Runable uniquement lorsqu'aucune route Hono n'a répondu.

Avec les bindings Node `incoming` et `outgoing`, l'adaptateur laisse aussi le middleware Connect de Vite traiter les ressources de développement. Sinon, il utilise les objets standards `Request` et `Response`.

