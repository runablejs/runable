---
title: Integrations
description: Connect Runable to Express, Fastify, Hono, Koa, NestJS, AdonisJS, Bun, Deno, or a custom server.
---

An adapter connects requests from your backend to the Runable rendering engine. It initializes the application once, lets Vite serve development assets when the runtime allows it, then produces the Vue response.

## Available adapters

| Backend | Runable API | Form |
| --- | --- | --- |
| Express | `express()` | Middleware |
| Fastify | `fastify()` | Plugin |
| Hono | `hono()` | Middleware |
| Koa | `koa()` | Middleware |
| NestJS | `RunableModule.register()` | Express platform module |
| AdonisJS | `adonis()` | Catch-all handler |
| Bun | `bun()` | Fetch API handler |
| Deno | `deno()` | Fetch API handler |

h3 and other servers currently use the low-level `createRunableApp()`, `requestNode()`, or `requestWeb()` functions.

## Shared option

Every adapter accepts an already initialized instance:

```ts
type RunableAdapterOptions = {
  runableApp?: Promise<ViteDevServer | null> | ViteDevServer | null;
};
```

Without this option, the adapter calls `createRunableApp()` itself once.

::u-tip
---
variant: warning
title: Keep your API routes first
---

Mount the adapter as a fallback after application routes, unless the framework requires middleware to run before routes so it can call `next()`.

::
