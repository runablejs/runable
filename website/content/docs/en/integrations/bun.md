---
title: Bun
description: Use Runable's Fetch API adapter with Bun.serve().
---

## Installation

```bash
bun add runable vue vue-router
```

## Configuration

```ts
// server.ts
import { bun } from "runable/adapters/bun";

Bun.serve({
  port: 3000,
  fetch: bun(),
});
```

`bun()` returns a `(request: Request) => Response | Promise<Response>` function. It uses Fetch API objects directly, with no conversion to Node HTTP classes.

To keep API routes, use the adapter as a fallback:

```ts
const renderRunable = bun();

Bun.serve({
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/api/health") {
      return Response.json({ status: "ok" });
    }

    return renderRunable(request);
  },
});
```
