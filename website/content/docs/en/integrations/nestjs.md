---
title: NestJS
description: Connect Runable after the controllers of a NestJS application using Express.
---

The current adapter targets the NestJS Express platform.

## Installation

```bash
pnpm add runable vue vue-router @nestjs/common @nestjs/core @nestjs/platform-express
```

## Configuration

```ts
// main.ts
import { NestFactory } from "@nestjs/core";
import { nestjs } from "runable/adapters/nestjs";
import { AppModule } from "./app.module.js";

const app = await NestFactory.create(AppModule);

// Register Nest controllers on Express first.
await app.init();

app.use(nestjs());
await app.listen(3000);
```

`nestjs()` returns a function compatible with `NestMiddleware["use"]`. Calling `app.init()` before `app.use()` ensures controller routes are registered before the Runable fallback.

::u-tip
---
variant: warning
title: Fastify is not supported by this adapter
---

A Nest application built with `FastifyAdapter` does not expose the Express request and response objects expected by `nestjs()`.

::
