---
title: Express
description: Utilisez Runable comme dernier middleware d'une application Express.
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

`express()` retourne un `RequestHandler`. Placez-le après les routes API et les middlewares qui doivent traiter la requête avant le frontend. Une erreur d'initialisation ou de rendu est transmise au prochain middleware d'erreur Express.

## Réutiliser une instance

```ts
const runableApp = createRunableApp();

app.use(express({ runableApp }));
```

