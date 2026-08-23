---
name: runable-integrations
description: Connect Runable to a backend server — Express, Fastify, NestJS, AdonisJS, Hono, Koa, Bun, Deno, h3, or a custom runtime. Use when mounting a Runable adapter, choosing how to integrate Runable with an existing backend, or a Runable page isn't being reached because of mount order.
---

# Runable Server Integrations

Use this skill when connecting Runable to a backend server, choosing or troubleshooting an adapter, or deciding where the Runable fallback should mount relative to existing routes.

Scope: mounting Runable into a backend's request handling. It does not cover what the backend's own API routes do (that's the backend framework's job) or how the Vue application itself is built (see `runable-pages`, `runable-data-fetching`).

## Backend ownership

Runable does not start or replace the backend's HTTP server. The backend keeps handling its own routes, middleware, authentication, and lifecycle; Runable's adapter is mounted as the last handler and renders the Vue application for whatever the backend doesn't handle itself.

```text
HTTP request
    │
    ▼
Backend ──────► API routes and application logic (handled first)
    │
    └────────► Runable adapter (fallback) ──► Vue application
```

Always mount the adapter **after** the backend's own API routes — an adapter mounted first would intercept requests meant for the API.

## Inspect before modifying

1. Identify which backend/runtime the project actually uses (check `package.json` dependencies and the server entry point) — don't assume.
2. Find the existing adapter import and mount call before adding a second one.
3. Confirm whether API routes are already registered before or after the adapter; preserve that order unless the request specifically asks to change it.

## Node-based adapters

Express, Fastify, NestJS, Koa, and AdonisJS adapters work with Node's request/response objects internally.

| Backend | Import | Mount form |
| --- | --- | --- |
| Express | `runable/adapters/express` | `app.use(express())` — Express middleware |
| Fastify | `runable/adapters/fastify` | `await app.register(fastify())` — Fastify plugin |
| Koa | `runable/adapters/koa` | `app.use(koa())` — Koa middleware |
| NestJS | `runable/adapters/nestjs` | `app.use(nestjs())` — Express-platform middleware, after `app.init()` |
| AdonisJS | `runable/adapters/adonis` | `router.any("*", adonis())` — catch-all route |

```ts
// server.ts (Express)
import Express from "express";
import { express } from "runable/adapters/express";

const server = Express();

server.get("/api/health", (_req, res) => res.json({ status: "ok" }));
server.use(express()); // after API routes

server.listen(3000);
```

NestJS only supports the Express platform (`FastifyAdapter` is not compatible — it doesn't expose the Express request/response objects the adapter expects).

## Fetch API adapters (Bun, Deno)

Bun and Deno adapters use standard `Request`/`Response` objects directly, with no conversion to Node's HTTP classes:

```ts
// server.ts (Bun)
import { bun } from "runable/adapters/bun";

const renderRunable = bun();

Bun.serve({
  port: 3000,
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/api/health") return Response.json({ status: "ok" });
    return renderRunable(request);
  },
});
```

Deno follows the same pattern via `runable/adapters/deno` and `Deno.serve()`.

## h3 and custom runtimes

There's no dedicated adapter package for h3 or an arbitrary custom server. Use the low-level primitives directly in a catch-all handler:

```ts
import { defineEventHandler } from "h3";
import { createRunableApp, requestNode } from "runable";

const runableApp = createRunableApp();

export default defineEventHandler(async (event) => {
  await requestNode({
    runableApp: await runableApp,
    req: event.node.req,
    res: event.node.res,
  });
});
```

Use `requestWeb()` instead of `requestNode()` when the runtime provides a standard `Request`/`Response` pair rather than Node objects. Mount this handler after the project's own API routes, same as any other adapter.

## Reusing an already-initialized instance

Every adapter calls `createRunableApp()` itself if not given one. To share a single instance (e.g. across multiple mount points, or with h3/custom code that also needs it):

```ts
import { createRunableApp } from "runable";
import { express } from "runable/adapters/express";

const runableApp = createRunableApp();

app.use(express({ runableApp }));
```

## Common mistakes

- Mounting the Runable adapter before the backend's own API routes, causing it to intercept requests meant for the API.
- Assuming a Vue navigation middleware (see `runable-pages`) protects a backend route — it doesn't; API authorization belongs in the backend.
- Using the NestJS adapter with `FastifyAdapter` instead of the Express platform.
- Treating Bun/Deno's `Request`/`Response` objects as if they were Node's `req`/`res` (or vice versa) when adapting example code between runtimes.
- Building a custom h3/runtime integration without first checking whether a dedicated adapter already exists.

## When another skill is needed

- The Vue application itself (pages, layouts, middleware): `runable-pages`.
- Loading data inside the Vue application: `runable-data-fetching`.
- General project configuration and the production build: `runable-project`, `runable-configuration`.

Consult the current Runable API reference when exact behavior matters.
