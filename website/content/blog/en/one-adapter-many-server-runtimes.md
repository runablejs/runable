---
title: One Vue Application, Many Server Runtimes
description: Understand what Syora adapters do and why the backend framework stays a dependency of the consuming project.
date: 2026-08-18
authors:
  - domutala
---

Rendering Vue is only one part of integrating a frontend into an existing server. Each backend framework has its own request objects, response lifecycle, middleware order, and error conventions.

Syora adapters translate those differences into one rendering pipeline.

## The adapter owns the integration boundary

Without an adapter, a Node server must create the Syora application and forward every frontend request manually:

```ts
import { createServer } from "node:http";
import { createSyoraApp, requestNode } from "@syora/core";

const syoraApp = createSyoraApp();

createServer(async (request, response) => {
  await requestNode({
    syoraApp: await syoraApp,
    req: request,
    res: response,
  });
}).listen(3000);
```

That code is small, but a production integration also needs to account for development assets, errors, and responses that another middleware has already completed.

An official adapter packages those decisions behind the API expected by the backend.

For Express, the result is a request handler:

```ts
import Express from "express";
import { express } from "@syora/core/adapters/express";

const app = Express();

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use(express());
```

For Hono, the result is Hono middleware:

```ts
import { Hono } from "hono";
import { hono } from "@syora/core/adapters/hono";

const app = new Hono();

app.get("/api/health", (context) => {
  return context.json({ status: "ok" });
});

app.use("*", hono());
```

The public shape follows the host framework instead of forcing every project through a Syora-specific server abstraction.

## Initialize once, render many times

An adapter creates the Syora application once and reuses the resulting promise across requests. That avoids rebuilding the Vite server or production renderer for each visit.

During development, Node adapters first let Vite process the request. If Vite serves a module, stylesheet, or another development asset, the response is already complete and rendering stops. Other requests continue to the Vue renderer.

This response check matters. Writing headers after another middleware has sent the response causes errors such as `ERR_HTTP_HEADERS_SENT`. The adapter protects the boundary by checking whether the response has ended before rendering.

## Let backend routes run first

Syora should not intercept application APIs. Register the adapter after the routes that belong to the backend.

```ts
app.use(authentication());
app.use("/api", apiRouter);
app.use(express());
```

This order makes ownership clear:

1. shared backend middleware runs;
2. API and server routes get the first chance to respond;
3. Syora renders the remaining frontend request.

Hono uses its own middleware flow, so its adapter waits for downstream handlers and renders only when the result is still a `404`.

## Install only the framework you use

`@syora/core` exposes integrations for several runtimes, but it should not install all of those frameworks in every consuming application.

If the project uses Express, install Express. If it uses Fastify, install Fastify. Framework packages required to type and develop adapters belong in Syora's development dependencies, while the consuming project owns its chosen runtime.

That keeps the production dependency graph aligned with the actual server.

## Drop down to the primitives when needed

Dedicated adapters cover common frameworks. A custom server can use one of two lower-level functions:

- `requestNode()` writes to Node's `ServerResponse`;
- `requestWeb()` accepts a Fetch API `Request` and returns a `Response`.

Use those primitives when a runtime has no adapter or when an internal server needs a specialized lifecycle. Otherwise, prefer the official adapter: it centralizes integration details that are easy to miss and difficult to diagnose later.

Browse the available servers in <a href="/docs/integrations/index.md">Integrations</a>.
