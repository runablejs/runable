---
title: NestJS
description: Enregistrez Runable comme contrôleur catch-all d'une application NestJS utilisant Express.
---

L'adaptateur actuel cible la plateforme Express de NestJS.

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

`RunableModule` enregistre un contrôleur catch-all. NestJS donne la priorité aux contrôleurs applicatifs plus spécifiques, puis transmet les requêtes sans correspondance à Runable.

`register()` accepte `RunableAdapterOptions`. Vous pouvez donc fournir une application déjà initialisée avec `RunableModule.register({ runableApp })`.

::u-tip
---
variant: warning
title: Fastify n'est pas pris en charge par cet adaptateur
---

Une application Nest construite avec `FastifyAdapter` ne possède pas les objets requête/réponse Express attendus par `RunableModule`.

::
