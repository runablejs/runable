---
title: AdonisJS
description: Servez l'application Vue depuis une route catch-all AdonisJS.
---

## Installation

```bash
pnpm add runable vue vue-router @adonisjs/core
```

## Configuration

```ts
// start/routes.ts
import router from "@adonisjs/core/services/router";
import { adonis } from "runable/adapters/adonis";

router.get("/api/health", async () => ({ status: "ok" }));

router.any("*", adonis());
```

`adonis()` retourne un handler qui lit les objets Node internes depuis `HttpContext`, laisse Vite traiter les ressources en développement puis rend la page Runable.

Déclarez la route catch-all après les routes AdonisJS plus précises.

