---
title: Fastify
description: Enregistrez Syora comme plugin frontend fallback dans Fastify.
---

## Installation

```bash
pnpm add @syora/core vue vue-router fastify
```

## Configuration

```ts
// server.ts
import Fastify from "fastify";
import { fastify } from "@syora/core";

const app = Fastify();

app.get("/api/health", async () => ({ status: "ok" }));

await app.register(fastify());
await app.listen({ port: 3000 });
```

`fastify()` retourne un `FastifyPluginAsync`. Le plugin ajoute une route catch-all, transmet les objets Node bruts à Syora puis appelle `reply.hijack()` parce que Syora écrit directement dans la réponse.

Enregistrez vos routes métier avant le plugin pour qu'elles restent prioritaires.

