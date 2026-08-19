---
title: AdonisJS
description: Serve the Vue application from an AdonisJS catch-all route.
---

## Installation

```bash
pnpm add @syora/core vue vue-router @adonisjs/core
```

## Configuration

```ts
// start/routes.ts
import router from "@adonisjs/core/services/router";
import { adonis } from "@syora/core/adapters/adonis";

router.get("/api/health", async () => ({ status: "ok" }));

router.any("*", adonis());
```

`adonis()` returns a handler that reads the internal Node objects from `HttpContext`, lets Vite handle development assets, then renders the Syora page.

Declare the catch-all route after more specific AdonisJS routes.
