---
title: Keep Your Backend. Add Syora.
description: Add a structured Vue application to an existing backend without moving your API, authentication, or server lifecycle.
date: 2026-08-15
authors:
  - domutala
---

Most Vue applications begin with a simple decision: create a Vite project and add the pieces you need. That works well until the application needs file-based routing, layouts, middleware, server rendering, data hydration, and a predictable plugin system.

The usual answer is to adopt a full-stack frontend framework. But that can create a second problem when your backend already exists.

Your Express, Fastify, NestJS, AdonisJS, Hono, or Koa application may already own authentication, API routes, queues, database access, observability, and deployment. Replacing that foundation just to improve the Vue developer experience is an expensive trade.

Syora takes a different route: keep the backend and add the missing application layer around Vue.

## One server, two responsibilities

Your backend should continue handling the work it already does well:

- API endpoints and business logic;
- sessions and authentication;
- database access;
- webhooks and background jobs;
- infrastructure-specific middleware.

Syora handles the Vue application:

- pages generated from files;
- nested layouts and navigation middleware;
- server-side rendering and hydration;
- data loading with a shared cache;
- application plugins and reusable modules.

The boundary is the HTTP request. Backend routes run first. Requests that remain are passed to Syora for frontend rendering.

```text
Request
   │
   ├── /api/* ──► Backend handlers
   │
   └── other ───► Syora ──► Vue page
```

## Add Syora to Express

The adapter is regular Express middleware:

```ts
import Express from "express";
import { express } from "@syora/core/adapters/express";

const server = Express();

server.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

server.use(express());

server.listen(3000);
```

Order matters. Register API routes and backend middleware before `express()`. The adapter becomes the final handler for the frontend.

It initializes the Syora application once. During development, Vite can serve modules and assets before Syora renders the page. In production, the same integration point serves the built application.

## Build the Vue side with conventions

Create a page without configuring Vue Router manually:

```vue
<!-- app/pages/index.vue -->
<script setup lang="ts">
const { data: status } = await useAsyncData("health", (signal) => {
  return $fetch<{ status: string }>("/api/health", { signal });
});
</script>

<template>
  <main>
    <h1>Dashboard</h1>
    <p>API status: {{ status?.status }}</p>
  </main>
</template>
```

The page stays close to ordinary Vue. Syora supplies the surrounding conventions and connects the server-rendered data to client hydration.

## Keep one deployment model

This architecture does not force a separate frontend server. The backend remains the process receiving traffic, and its deployment lifecycle stays authoritative.

That is useful when an application depends on framework-specific behavior that would be difficult to reproduce elsewhere. It also avoids maintaining two authentication boundaries or proxying every API request between separate applications.

Syora is additive. You can introduce it at the point where your backend should start rendering Vue, without redesigning the rest of the system.

## When this model fits

Use this approach when the backend is a deliberate part of your architecture rather than a temporary API.

It is especially practical when:

- an existing backend already runs in production;
- the team relies on its middleware and ecosystem;
- frontend and backend should share one deployment;
- Vue needs SSR and stronger project conventions;
- changing the server runtime is not an option.

If you only need a small client-side interface, Vue and Vite may already be enough. If you want an integrated framework with its own server runtime, Nuxt may be the simpler choice. Syora is for the space between those two decisions.

Read <a href="/docs/getting-started/installation.md">Installation</a> to connect Syora to an existing server.
