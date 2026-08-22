---
title: Koa
description: Add Runable as the last middleware in a Koa application.
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

The adapter disables Koa's automatic response with `context.respond = false`, then writes directly to `context.res`. Mount it last: it does not forward the request to subsequent middleware.
