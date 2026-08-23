---
title: Express
description: Use Runable as the last middleware in an Express application.
---

## Installation

```bash
pnpm add runable vue vue-router express
pnpm add -D @types/express
```

## Configuration

```ts
// server.ts
import Express from "express";
import { express } from "runable/adapters/express";

const app = Express();

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(express());

app.listen(3000);
```

`express()` returns a `RequestHandler`. Place it after API routes and any middleware that must process requests before the frontend. Initialization and rendering errors are forwarded to the next Express error middleware.

## Reuse an instance

```ts
import { createRunableApp } from "runable";
import { express } from "runable/adapters/express";

const runableApp = createRunableApp();

app.use(express({ runableApp }));
```
