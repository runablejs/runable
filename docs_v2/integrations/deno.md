---
title: Deno
description: Utilisez l'adaptateur Fetch API de Syora avec Deno.serve().
---

## Configuration

```ts
// server.ts
import { deno } from "@syora/core";

Deno.serve({ port: 3000 }, deno());
```

`deno()` possède la même signature Fetch API que l'adaptateur Bun.

```ts
const renderSyora = deno();

Deno.serve({ port: 3000 }, (request) => {
  const url = new URL(request.url);

  if (url.pathname === "/api/health") {
    return Response.json({ status: "ok" });
  }

  return renderSyora(request);
});
```

Configurez l'import npm de `@syora/core` selon la stratégie choisie par votre projet Deno.

