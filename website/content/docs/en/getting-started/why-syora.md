---
title: Why Syora?
description: Get a Nuxt-like experience in Vue while keeping the backend and HTTP server of your choice.
---

Syora brings full-stack framework conventions to Vue without imposing a specific server runtime.

## The problem

Vue and Vite provide a simple, flexible foundation. As an application grows, you still have to select, integrate, and maintain several pieces:

<div class="py-3 space-y-2">
  <div class="flex flex-wrap items-center gap-2"><u-icon name="tabler:circle-1-filled" class="size-5 text-muted-foreground"></u-icon><span>a router and conventions for organizing pages;</span></div>
  <div class="flex flex-wrap items-center gap-2"><u-icon name="tabler:circle-2-filled" class="size-5 text-muted-foreground"></u-icon><span>layouts, middleware, and auto-imports;</span></div>
  <div class="flex flex-wrap items-center gap-2"><u-icon name="tabler:circle-3-filled" class="size-5 text-muted-foreground"></u-icon><span>server rendering, hydration, and data loading;</span></div>
  <div class="flex flex-wrap items-center gap-2"><u-icon name="tabler:circle-4-filled" class="size-5 text-muted-foreground"></u-icon><span>a reusable plugin and module system.</span></div>
</div>

Nuxt already provides this experience, but relies on Nitro for its server layer. That choice suits many projects, but not those that must keep Express, Fastify, NestJS, AdonisJS, Koa, Hono, or an internal HTTP server.

Without a middle ground, you usually choose between two architectures:

| Choice | Advantage | Trade-off |
| --- | --- | --- |
| Vue and Vite alone | Complete server control | Conventions and features must be assembled manually |
| Separate backend and Nuxt frontend | Complete Nuxt experience | Two applications to build, connect, and deploy |

## What Syora changes

Syora places a Vue application layer inside your existing server. Your backend continues to handle HTTP, API routes, authentication, and application logic. Syora renders the interface.

```text
HTTP request
    │
    ▼
Your backend ──────► API routes and application logic
    │
    └───────────────► Syora ──► Vue application
```

Your server forwards frontend requests to Syora:

```ts
// server.ts
import Express from "express";
import { express } from "@syora/core";

const server = Express();

// Your backend remains responsible for its API routes.
server.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// The adapter initializes Syora and renders other requests with Vue.
server.use(express());

server.listen(3000);
```

::u-tip
---
variant: info
title: An additive integration
---

You do not need to rewrite your backend. Add Syora where your server should render the Vue application.

::

## What Syora provides

| Feature | Convention or API |
| --- | --- |
| File-system routing | `app/pages/` |
| Layouts | `app/layouts/` |
| Auto-imported components and composables | `app/components/` and `app/composables/` |
| Navigation middleware | `app/middlewares/` and `definePageMeta()` |
| Data loading | `useAsyncData()` |
| SSR and hydration | Server rendering and client cache restoration |
| Application plugins | `defineVuePlugin()` |
| Configurable modules | `defineModule()` |

This separation lets you choose a backend for its own capabilities without rebuilding the entire frontend developer experience.

## When should you choose Syora?

Syora is a good fit when:

<div class="py-3 space-y-2">
  <div class="flex flex-wrap items-center gap-2"><u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon><span>you already have a <strong>production backend</strong>;</span></div>
  <div class="flex flex-wrap items-center gap-2"><u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon><span>your team relies on that backend's conventions, plugins, or tools;</span></div>
  <div class="flex flex-wrap items-center gap-2"><u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon><span>you want SSR and Nuxt-like organization in the same application;</span></div>
  <div class="flex flex-wrap items-center gap-2"><u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon><span>you need control over the server lifecycle and deployment.</span></div>
</div>

Another choice may be simpler in these cases:

| Need | Consider |
| --- | --- |
| An integrated solution with its own server runtime | Nuxt |
| A lightweight SPA without SSR or extra conventions | Vue and Vite |
| A frontend completely independent from the backend | Two separate applications |

::u-tip
---
variant: warning
title: Alpha project
---

Syora is currently in alpha. Check the availability of features your application depends on before using it in production.

::

## Key takeaway

Syora does not replace your backend. It adds a structured Vue application that can render on the server or client, with ready-to-use conventions.

::u-tip
---
variant: info
title: Next step
---

Install the required dependencies in <a href="./installation.md">Installation</a>.

::
