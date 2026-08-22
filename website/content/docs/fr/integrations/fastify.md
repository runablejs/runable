---
title: Fastify
description: Enregistrez Runable comme plugin frontend fallback dans Fastify.
---

## Installation

```bash
pnpm add runable vue vue-router fastify
```

## Configuration

```ts
// server.ts
import Fastify from "fastify";
import { fastify } from "runable/adapters/fastify";

const app = Fastify();

app.get("/api/health", async () => ({ status: "ok" }));

await app.register(fastify());
await app.listen({ port: 3000 });
```

`fastify()` retourne un `FastifyPluginAsync`. Le plugin ajoute une route catch-all, transmet les objets Node bruts à Runable puis appelle `reply.hijack()` parce que Runable écrit directement dans la réponse.

Enregistrez vos routes métier avant le plugin pour qu'elles restent prioritaires.

