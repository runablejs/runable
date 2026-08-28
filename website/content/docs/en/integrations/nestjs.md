---
title: NestJS
description: Register Runable as the catch-all controller of a NestJS application using Express.
---

The current adapter targets the NestJS Express platform.

## Installation

```bash
pnpm add runable vue vue-router @nestjs/common @nestjs/core @nestjs/platform-express
```

## Configuration

```ts
// app.module.ts
import { Module } from "@nestjs/common";
import { RunableModule } from "runable/adapters/nestjs";

@Module({
  imports: [RunableModule.register()],
})
export class AppModule {}
```

`RunableModule` registers a catch-all controller. NestJS gives more specific application controllers priority, then sends unmatched requests to Runable.

`register()` accepts `RunableAdapterOptions`, so you can provide an already initialized application with `RunableModule.register({ runableApp })`.

::u-tip
---
variant: warning
title: Fastify is not supported by this adapter
---

A Nest application built with `FastifyAdapter` does not expose the Express request and response objects expected by `RunableModule`.

::
