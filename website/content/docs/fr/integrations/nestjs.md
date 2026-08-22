---
title: NestJS
description: Branchez Runable après les contrôleurs d'une application NestJS utilisant Express.
---

L'adaptateur actuel cible la plateforme Express de NestJS.

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

// Enregistre d'abord les contrôleurs Nest sur Express.
await app.init();

app.use(nestjs());
await app.listen(3000);
```

`nestjs()` retourne une fonction compatible avec `NestMiddleware["use"]`. L'appel à `app.init()` avant `app.use()` garantit que les routes des contrôleurs sont enregistrées avant le fallback Runable.

::u-tip
---
variant: warning
title: Fastify n'est pas pris en charge par cet adaptateur
---

Une application Nest construite avec `FastifyAdapter` ne possède pas les objets requête/réponse Express attendus par `nestjs()`.

::

