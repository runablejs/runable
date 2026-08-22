---
title: Fastify
description: Register Runable as a frontend fallback plugin in Fastify.
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

`fastify()` returns a `FastifyPluginAsync`. The plugin adds a catch-all route, passes the raw Node objects to Runable, then calls `reply.hijack()` because Runable writes directly to the response.

Register your application routes before the plugin so they retain priority.
