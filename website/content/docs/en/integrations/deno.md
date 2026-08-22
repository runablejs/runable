---
title: Deno
description: Use Runable's Fetch API adapter with Deno.serve().
---

## Configuration

```ts
// server.ts
import { deno } from "runable/adapters/deno";

Deno.serve({ port: 3000 }, deno());
```

`deno()` has the same Fetch API signature as the Bun adapter.

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

Configure the `runable` npm import according to your Deno project's chosen strategy.
