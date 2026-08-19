---
title: Deno
description: Use Syora's Fetch API adapter with Deno.serve().
---

## Configuration

```ts
// server.ts
import { deno } from "@syora/core";

Deno.serve({ port: 3000 }, deno());
```

`deno()` has the same Fetch API signature as the Bun adapter.

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

Configure the `@syora/core` npm import according to your Deno project's chosen strategy.
