---
title: server.ts
description: Start your backend and mount the Runable adapter as the last middleware.
---

`server.ts` is your backend entry point. It configures the HTTP server, API routes, and Runable adapter.

```ts
// server.ts
import Express from "express";
import { express } from "runable/adapters/express";

const server = Express();

server.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

server.use(express());

server.listen(3000, () => {
  console.log("http://localhost:3000");
});
```

Place API routes and application middleware before the adapter. Runable then receives only requests that have not already produced a response.

The `server.ts` name is a project convention, not a framework requirement. You can split the backend across files or use the entry point required by NestJS, AdonisJS, Bun, or Deno.

The adapter initializes the Runable instance once, connects Vite in development, and uses the `.output/` build in production.
