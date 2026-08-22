---
title: Deno
description: Utilisez l'adaptateur Fetch API de Runable avec Deno.serve().
---

## Configuration

```ts
// server.ts
import { deno } from "runable/adapters/deno";

Deno.serve({ port: 3000 }, deno());
```

`deno()` possède la même signature Fetch API que l'adaptateur Bun.

```ts
const renderRunable = deno();

Deno.serve({ port: 3000 }, (request) => {
  const url = new URL(request.url);

  if (url.pathname === "/api/health") {
    return Response.json({ status: "ok" });
  }

  return renderRunable(request);
});
```

Configurez l'import npm de `runable` selon la stratégie choisie par votre projet Deno.

