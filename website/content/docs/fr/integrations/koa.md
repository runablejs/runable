---
title: Koa
description: Ajoutez Runable comme dernier middleware d'une application Koa.
---

## Installation

```bash
pnpm add runable vue vue-router koa
pnpm add -D @types/koa
```

## Configuration

```ts
// server.ts
import Koa from "koa";
import { koa } from "runable/adapters/koa";

const app = new Koa();

app.use(async (context, next) => {
  if (context.path === "/api/health") {
    context.body = { status: "ok" };
    return;
  }

  await next();
});

app.use(koa());
app.listen(3000);
```

L'adaptateur désactive la réponse automatique de Koa avec `context.respond = false`, puis écrit directement dans `context.res`. Montez-le en dernier : il ne transmet pas la requête à un middleware suivant.

