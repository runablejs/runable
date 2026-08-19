---
title: Concepts
description: Understand the backend, Syora engine, Vue application, generated files, and SSR lifecycle.
---

Syora connects three layers: your HTTP server, the framework engine, and your Vue application.

## Three responsibilities

| Layer | Responsibility |
| --- | --- |
| Your backend | Listen on the network, run API routes, and handle application logic |
| Syora | Prepare the application, generate conventions, and produce the frontend response |
| Your Vue application | Define pages, components, layouts, and user interactions |

This separation lets you replace Express with Fastify or Hono without reorganizing Vue files.

## The backend remains the entry point

Syora does not automatically start your application server. You create the server, then forward frontend requests to it.

```ts
// server.ts
import { express } from "@syora/core/adapters/express";

server.get("/api/orders", ordersController);
server.use(express());
```

You control the order. Place API routes before the Syora adapter so the backend handles them first.

## Adapters for each backend

Each adapter initializes Syora once and translates framework objects for the rendering engine:

| Adapter | Environment |
| --- | --- |
| `express()` | Express middleware |
| `fastify()` | Fastify plugin |
| `hono()` | Hono middleware |
| `koa()` | Koa middleware |
| `nestjs()` | NestJS middleware on the Express platform |
| `adonis()` | AdonisJS catch-all route handler |
| `bun()` | `fetch` function for `Bun.serve()` |
| `deno()` | `fetch` function for `Deno.serve()` |

Node adapters use Node request and response objects internally. Bun and Deno adapters use standard `Request` and `Response` objects.

### Connect other backends

Always place the adapter after API routes or as the router's final fallback.

::u-code-group

```ts [Express]
import Express from "express";
import { express } from "@syora/core/adapters/express";

const app = Express();
app.use(express());
app.listen(3000);
```

```ts [Fastify]
import Fastify from "fastify";
import { fastify } from "@syora/core/adapters/fastify";

const app = Fastify();
await app.register(fastify());
await app.listen({ port: 3000 });
```

```ts [Hono]
import { Hono } from "hono";
import { hono } from "@syora/core/adapters/hono";

const app = new Hono();
app.use("*", hono());

export default app;
```

```ts [Koa]
import Koa from "koa";
import { koa } from "@syora/core/adapters/koa";

const app = new Koa();
app.use(koa());
app.listen(3000);
```

```ts [NestJS]
import { NestFactory } from "@nestjs/core";
import { nestjs } from "@syora/core/adapters/nestjs";
import { AppModule } from "./app.module.js";

const app = await NestFactory.create(AppModule);
app.use(nestjs());
await app.listen(3000);
```

```ts [AdonisJS]
import router from "@adonisjs/core/services/router";
import { adonis } from "@syora/core/adapters/adonis";

router.any("*", adonis());
```

```ts [Bun]
import { bun } from "@syora/core/adapters/bun";

Bun.serve({ port: 3000, fetch: bun() });
```

```ts [Deno]
import { deno } from "@syora/core/adapters/deno";

Deno.serve({ port: 3000 }, deno());
```

::

## Conventions become generated code

At startup, Syora reads `syora.config.ts`, resolves paths, and configures several Vite plugins.

```text
app/pages/          ──► Vue Router routes
app/layouts/        ──► layout registry
app/components/     ──► available components
app/composables/    ──► automatic imports
app/globals/        ──► auto-imported global functions and variables
app/middlewares/    ──► navigation guards
app/plugins/        ──► plugins installed in Vue
```

Required declarations and virtual files are written to `.app/`. This directory is generated; do not use it for source code.

## One Vue application per server render

For every SSR render, Syora creates a new Vue application, then installs the router, layouts, plugins, data manager, and Unhead.

This isolation prevents request-specific state from being shared with another user.

```text
Request A ──► Vue App A ──► Cache A ──► HTML A
Request B ──► Vue App B ──► Cache B ──► HTML B
```

Do not store user-specific data in a global module variable. Use state created in the application context.

## The SSR lifecycle

When `ssr` is `true`, a request follows these steps:

<div class="py-3 space-y-2">
  <div class="flex flex-wrap items-center gap-2"><u-icon name="tabler:circle-1-filled" class="size-5 text-muted-foreground"></u-icon><span>the backend forwards the URL to Syora;</span></div>
  <div class="flex flex-wrap items-center gap-2"><u-icon name="tabler:circle-2-filled" class="size-5 text-muted-foreground"></u-icon><span>Vue Router resolves the page and its middleware;</span></div>
  <div class="flex flex-wrap items-center gap-2"><u-icon name="tabler:circle-3-filled" class="size-5 text-muted-foreground"></u-icon><span><code>useAsyncData()</code> waits for non-lazy data;</span></div>
  <div class="flex flex-wrap items-center gap-2"><u-icon name="tabler:circle-4-filled" class="size-5 text-muted-foreground"></u-icon><span>Vue produces HTML and Unhead injects the head;</span></div>
  <div class="flex flex-wrap items-center gap-2"><u-icon name="tabler:circle-5-filled" class="size-5 text-muted-foreground"></u-icon><span>Syora serializes the data cache into the response;</span></div>
  <div class="flex flex-wrap items-center gap-2"><u-icon name="tabler:circle-6-filled" class="size-5 text-muted-foreground"></u-icon><span>the browser restores the cache and hydrates the application.</span></div>
</div>

With `ssr: false`, Syora returns the client template without rendering components on the server.

## Pages and metadata

A file in `app/pages/` becomes a route:

```text
app/pages/
├── index.vue            → /
├── account.vue          → /account
├── users/[id].vue       → /users/:id
└── docs/[...slug].vue   → /docs/:slug(.*)
```

`definePageMeta()` supplements file-name conventions:

```vue
<!-- app/pages/account.vue -->
<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
});
</script>

<template>
  <h1>My account</h1>
</template>
```

Global middleware runs on every navigation. Named middleware is loaded when referenced by a page.

## Plugins and modules

A plugin runs when the Vue application is created. It can provide values, register hooks, or install a client integration.

```ts
// app/plugins/api.ts
export default defineVuePlugin(() => {
  return {
    provide: {
      apiBase: "/api",
    },
  };
});
```

A module runs earlier, while configuration loads. It can add directories, plugins, or Vite options to an application.

| Extension | Execution time | Typical use |
| --- | --- | --- |
| Plugin | Vue application creation | Injection, client SDK, runtime hooks |
| Module | Configuration loading | Reusable feature, generation, and configuration |

## Development and production

In development, `createSyoraApp()` returns a Vite instance in middleware mode. Your backend uses it for HMR and module transformation.

In production, `createSyoraApp()` loads configuration without creating a Vite server. `syora build` must generate the expected files in `.output/` before startup.

| Directory | Status | Content |
| --- | --- | --- |
| `app/` | Source | Your Vue application |
| `public/` | Source | Static assets |
| `.app/` | Generated | Types, routes, and virtual registries |
| `.output/` | Generated | Production build artifacts |

## Mental model

Remember this rule: your backend owns HTTP, Syora owns application assembly, and Vue owns the interface.

::u-tip
---
variant: success
title: Getting Started complete
---

You can now browse the Structure section to understand every directory in a Syora project.

::
