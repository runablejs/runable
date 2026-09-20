---
title: "Runable 1.0: All the Vue Conventions. Your Server Runtime."
description: Runable reaches its first stable release with file-system routing, SSR, data fetching, modules, generated types, and freedom to keep your backend.
date: 2026-09-09
cover: /images/blog/v1dot0.png
authors:
  - domutala
---

Runable 1.0 is now available.

This release marks the first stable version of a Vue framework built around one idea: adopting a productive frontend framework should not require replacing the server architecture that already fits your application.

Runable brings file-system routing, layouts, middleware, server-side rendering, data fetching, plugins, modules, auto-imports, and generated types to Vue. Express, Fastify, NestJS, AdonisJS, Hono, Koa, Bun, Deno, or a custom server remains in charge of the backend.

## Why Runable exists

Vue and Vite provide an excellent foundation for building interfaces. As an application grows, teams often assemble the same additional pieces: a route convention, layouts, middleware, SSR, hydration, data loading, head management, generated types, and an extension system.

A meta-framework solves that coordination problem, but it commonly brings its own server runtime. That is a good default for many projects. It becomes a constraint when the backend is already a deliberate architectural choice.

Your NestJS application may organize a large domain. Your Fastify server may be tuned for a specific workload. Your AdonisJS project may already own authentication, validation, queues, and database access. An established Express service may carry years of middleware and operational knowledge.

Runable does not ask you to recreate that work elsewhere. It adds the Vue application layer to the server you chose.

```text
Your backend  +  Runable  +  Vue
     ↓             ↓        ↓
HTTP and APIs   Conventions   Interface
```

The backend continues to own API routes, authentication, business logic, infrastructure, and deployment. Runable handles the conventions required to build and render the Vue application.

## A complete Vue application layer

Runable 1.0 turns the application directory into a readable description of the frontend:

```text
app/
├── components/
├── composables/
├── layouts/
├── middleware/
├── pages/
├── plugins/
└── app.vue
```

Files in `app/pages/` become Vue Router routes. Layouts provide reusable application shells. Middleware attaches navigation behavior to pages. Components and composables are discovered automatically, while generated declarations keep those APIs visible to TypeScript and your editor.

The conventions remove repeated configuration without hiding Vue. You can still use Vue Router, Vue plugins, lifecycle hooks, provide/inject, and the rest of the Vue ecosystem directly.

## Server rendering without moving the backend

Each supported runtime receives an adapter shaped for its own API. An Express application uses regular Express middleware:

```ts
import Express from "express";
import { express } from "runable/adapters/express";

const server = Express();

server.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

server.use(express());

server.listen(3000);
```

The API route remains an Express route. Runable receives the requests left for the frontend and renders the matching Vue page.

The same boundary applies to Fastify, Hono, Koa, NestJS, AdonisJS, Bun, and Deno. Projects with a specialized server can use the lower-level Node or Web Request primitives.

In development, the adapter connects the host server to Vite. In production, it serves the generated assets and renders the built application. The server remains the process your team starts, monitors, and deploys.

## Data that crosses the SSR boundary

Server rendering is most useful when the browser can continue from the state produced on the server. Runable's async data APIs coordinate that handoff.

```vue
<script setup lang="ts">
const { data: projects, pending, error } = await useAsyncData(
  "projects",
  (signal) => $fetch("/api/projects", { signal }),
);
</script>

<template>
  <p v-if="pending">Loading…</p>
  <p v-else-if="error">{{ error.message }}</p>
  <ProjectList v-else :projects="projects" />
</template>
```

During SSR, Runable waits for the request, stores its result, and renders the page. The cache is serialized into the response and restored before hydration, so the browser does not immediately request the same data again.

`useFetch()` builds on the same system for reactive requests, transformations, key selection, deduplication, timeouts, manual execution, and cache control.

## Extensions at the right level

Runable has two complementary extension points.

Plugins initialize each Vue application instance. Use them to install Vue libraries, register directives, provide services, or connect lifecycle hooks.

Modules package broader conventions. A module can contribute configuration, plugins, components, composables, layouts, middleware, styles, and other modules. Module options receive generated types, and module-owned paths resolve from the module itself.

Configuration hooks can extend the resolved configuration and the complete route tree. This gives integrations room to participate in code generation without requiring applications to patch framework internals.

## Tooling that explains the generated application

Conventions are most useful when developers can inspect what they produce. Runable generates its application files in `.app/`, including the route table, auto-import declarations, module options, and TypeScript configuration.

The public Inspector API exposes the same resolved project model to tools. It can report routes, layouts, middleware, plugins, modules, auto-imports, and configuration as serializable data without modifying the project.

The CLI supports project preparation and production builds, and it can create applications for the supported server frameworks. Runable also ships Agent Skills and an MCP integration so coding agents can work from the framework's actual conventions instead of guessing from generic Vue patterns.

## Stable does not mean finished

Version 1.0 establishes the public foundation: the application structure, adapter boundary, rendering pipeline, extension model, data APIs, generated types, and tooling surface are ready for real projects.

There is still a great deal to build. The module ecosystem will grow. Runtime integrations will become deeper. Documentation, diagnostics, and developer tools will keep improving through feedback from applications using Runable in different server environments.

Stability means that this work now has a dependable base.

## Start with the server you want

Install Runable alongside Vue, Vue Router, and the backend framework used by your project:

```bash
pnpm add runable vue vue-router express
pnpm add -D @runablejs/cli tsx typescript @types/node @types/express
```

Create `app/pages/index.vue`, connect the matching adapter after your API routes, and start the server as usual.

Follow <a href="/docs/getting-started/installation.md">Installation</a> for the complete setup, continue with the <a href="/docs/getting-started/quickstart.md">Quick Start</a>, or compare the architecture in <a href="/docs/getting-started/vs-nuxt.md">Runable vs Nuxt</a>.

Runable 1.0 is the framework experience for teams that want all the Vue conventions—and their own server runtime.
