---
title: Hono
description: Use Syora as a fallback after Hono routes.
---

## Installation

```bash
pnpm add @syora/core vue vue-router hono
```

Add `@hono/node-server` when running Hono on Node.js.

## Configuration

```ts
// server.ts
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { hono } from "@syora/core";

const app = new Hono();

app.use("*", hono());

app.get("/api/health", (context) => {
  return context.json({ status: "ok" });
});

serve({ fetch: app.fetch, port: 3000 });
```

The middleware calls `next()` first. It therefore preserves every response other than `404` and renders Syora only when no Hono route has responded.

When the Node `incoming` and `outgoing` bindings are present, the adapter also lets Vite's Connect middleware process development assets. Otherwise, it uses standard `Request` and `Response` objects.
