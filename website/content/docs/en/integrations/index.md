---
title: Integrations
description: Connect Syora to Express, Fastify, Hono, Koa, NestJS, AdonisJS, Bun, Deno, or a custom server.
---

An adapter connects requests from your backend to the Syora rendering engine. It initializes the application once, lets Vite serve development assets when the runtime allows it, then produces the Vue response.

## Available adapters

| Backend | Syora API | Form |
| --- | --- | --- |
| Express | `express()` | Middleware |
| Fastify | `fastify()` | Plugin |
| Hono | `hono()` | Middleware |
| Koa | `koa()` | Middleware |
| NestJS | `nestjs()` | Express platform middleware |
| AdonisJS | `adonis()` | Catch-all handler |
| Bun | `bun()` | Fetch API handler |
| Deno | `deno()` | Fetch API handler |

h3 and other servers currently use the low-level `createSyoraApp()`, `requestNode()`, or `requestWeb()` functions.

## Shared option

Every adapter accepts an already initialized instance:

```ts
type SyoraAdapterOptions = {
  syoraApp?: Promise<ViteDevServer | null> | ViteDevServer | null;
};
```

Without this option, the adapter calls `createSyoraApp()` itself once.

::u-tip
---
variant: warning
title: Keep your API routes first
---

Mount the adapter as a fallback after application routes, unless the framework requires middleware to run before routes so it can call `next()`.

::
