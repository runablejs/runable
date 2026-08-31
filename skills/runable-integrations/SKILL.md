---
name: runable-integrations
description: Connect Runable to a backend server — Express, Fastify, NestJS, AdonisJS, Hono, Koa, Bun, Deno, h3, or a custom runtime. Use when mounting a Runable adapter, choosing how to integrate Runable with an existing backend, or a Runable page isn't being reached because of mount order.
---

# Runable Server Integrations

Use this skill when connecting Runable to a backend server, choosing or troubleshooting an adapter, or deciding where the Runable fallback should mount relative to existing routes.

Scope: mounting Runable into a backend's request handling. It does not cover what the backend's own API routes do (that's the backend framework's job) or how the Vue application itself is built (see `runable-pages`, `runable-data-fetching`).

## Backend ownership

Runable does not start or replace the backend's HTTP server. The backend keeps handling its own routes, middleware, authentication, and lifecycle; Runable's adapter renders the Vue application as the frontend fallback for whatever the backend doesn't handle itself.

```text
HTTP request
    │
    ▼
Backend ──────► API routes and application logic
    │
    └────────► Runable adapter (fallback) ──► Vue application
```

Runable must behave as the frontend fallback, but **the exact registration order depends on the adapter** — some adapters only take over after checking that nothing else responded, others render unconditionally the moment they're invoked. Applying one adapter's ordering rule to another without checking how that adapter implements fallback handling is the most common mistake here. See the table below, then each adapter's section for the reasoning.

| Runtime | Fallback mechanism | Ordering requirement |
| --- | --- | --- |
| Express | Renders unconditionally once invoked — never yields to a later handler | Must mount **after** API routes |
| Koa | Renders unconditionally once invoked — doesn't even forward Koa's own `next` | Must mount **after** API routes |
| NestJS | Same handler as Express (Express platform only) | Must mount **after** API routes, after `app.init()` |
| Fastify | Registered as a wildcard catch-all route; Fastify's router matches static routes before wildcards regardless of declaration order | Register API routes normally — Fastify's router resolves precedence, not source order |
| AdonisJS | Registered as a wildcard catch-all route; renders unconditionally once matched | Declare specific routes before the catch-all (per Runable's own docs) |
| Hono | Calls `await next()` first, only renders if the result is still a 404 | Registration position doesn't matter for correctness — Hono composes the full route chain regardless of where `hono()` sits |
| Bun / Deno | Bare Fetch API handler, no framework routing at all | No automatic fallback — the code must branch manually before calling it |
| h3 / custom | Bare handler, no framework routing at all | No automatic fallback — mount it as an explicit catch-all after other routes |

## Inspect before modifying

1. Identify which backend/runtime the project actually uses (check `package.json` dependencies and the server entry point) — don't assume.
2. Find the existing adapter import and mount call before adding a second one.
3. Check the table above for that specific adapter's ordering requirement before changing where anything is registered.

## Node-based adapters (unconditional render)

Express, Koa, and NestJS share the same underlying handler: once invoked, it always renders Runable's response (or forwards an error) — it never yields to a later handler on a normal request. Mounting it before other routes would intercept everything meant for those routes.

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

## Fastify and AdonisJS (catch-all routes)

Fastify (`app.all("*", fastify_plugin)`) and AdonisJS (`router.any("*", adonis())`) register Runable as a wildcard **route** rather than a middleware in a linear stack. Once that route is matched, it also renders unconditionally — there's no next-handler check inside the adapter itself. Whether a more specific route "wins" against the wildcard is decided by each framework's own router:

- Fastify's router (find-my-way) prioritizes static/specific paths over a wildcard regardless of registration order, so this is more forgiving of ordering than Express.
- For AdonisJS, declare more specific routes before the catch-all, per Runable's own integration guide — verify this against the project's actual AdonisJS router configuration if routes still seem to be intercepted.

## Hono (defers to other handlers first)

Hono's adapter explicitly waits for the rest of the chain before rendering:

```ts
app.use("*", hono());

app.get("/api/health", (context) => {
  return context.json({ status: "ok" });
});
```

Internally, `hono()` calls `await next()` first, and only renders Runable's response if the result is still a 404 after that. Because Hono composes the full matching handler chain for a request regardless of source order, this example is correct even though the API route is declared *after* `app.use("*", hono())` — do not "fix" it by moving the route earlier.

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

Use `requestWeb()` instead of `requestNode()` when the runtime provides a standard `Request`/`Response` pair rather than Node objects. Like Bun and Deno, there's no framework routing here to defer to — mount this handler as an explicit fallback after the project's own API routes.

## Reusing an already-initialized instance

Every adapter calls `createRunableApp()` itself if not given one. To share a single instance (e.g. across multiple mount points, or with h3/custom code that also needs it):

```ts
import { createRunableApp } from "runable";
import { express } from "runable/adapters/express";

const runableApp = createRunableApp();

app.use(express({ runableApp }));
```

In production, the official adapters and the low-level `requestNode()` / `requestWeb()` primitives serve generated assets from `distdir/client` before rendering application routes. Do not add a second static-file handler for `.output/client`.

## Common mistakes

- Applying one adapter's ordering rule to another without checking how that adapter implements fallback handling (e.g. assuming Hono needs the same strict "mount last" order as Express, or that Express will defer to a later route like Hono does).
- Mounting an unconditional-render adapter (Express, Koa, NestJS) before the backend's own API routes, causing it to intercept requests meant for the API.
- Assuming a Vue navigation middleware (see `runable-pages`) protects a backend route — it doesn't; API authorization belongs in the backend.
- Using the NestJS adapter with `FastifyAdapter` instead of the Express platform.
- Treating Bun/Deno's `Request`/`Response` objects as if they were Node's `req`/`res` (or vice versa) when adapting example code between runtimes.
- Building a custom h3/runtime integration without first checking whether a dedicated adapter already exists.

## When another skill is needed

- The Vue application itself (pages, layouts, middleware): `runable-pages`.
- Loading data inside the Vue application: `runable-data-fetching`.
- General project configuration and the production build: `runable-project`, `runable-configuration`.

Consult the current Runable API reference when exact behavior matters.
