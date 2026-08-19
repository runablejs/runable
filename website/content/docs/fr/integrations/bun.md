---
title: Bun
description: Utilisez l'adaptateur Fetch API de Syora avec Bun.serve().
---

## Installation

```bash
bun add @syora/core vue vue-router
```

## Configuration

```ts
// server.ts
import { bun } from "@syora/core/adapters/bun";

Bun.serve({
  port: 3000,
  fetch: bun(),
});
```

`bun()` retourne une fonction `(request: Request) => Response | Promise<Response>`. Elle utilise directement les objets de la Fetch API, sans conversion vers les classes HTTP Node.

Pour conserver des routes API, placez l'adaptateur en fallback :

```ts
const renderSyora = bun();

Bun.serve({
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/api/health") {
      return Response.json({ status: "ok" });
    }

    return renderSyora(request);
  },
});
```

