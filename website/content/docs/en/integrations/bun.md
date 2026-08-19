---
title: Bun
description: Use Syora's Fetch API adapter with Bun.serve().
---

## Installation

```bash
bun add @syora/core vue vue-router
```

## Configuration

```ts
// server.ts
import { bun } from "@syora/core";

Bun.serve({
  port: 3000,
  fetch: bun(),
});
```

`bun()` returns a `(request: Request) => Response | Promise<Response>` function. It uses Fetch API objects directly, with no conversion to Node HTTP classes.

To keep API routes, use the adapter as a fallback:

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
