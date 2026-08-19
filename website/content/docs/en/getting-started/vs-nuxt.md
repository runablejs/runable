---
title: Syora vs Nuxt
description: Compare Syora and Nuxt by server runtime, backend integration, Vue conventions, and ecosystem maturity.
---

Syora and Nuxt both provide a structured Vue experience. Their main difference is who owns the server.

## The difference in one sentence

Nuxt provides a complete application around Nitro. Syora adds a Vue application to a backend that you choose and operate yourself.

```text
Nuxt                          Syora
┌──────────────────────┐      ┌────────────────────────────┐
│ Vue application      │      │ Your backend               │
│ Nuxt                 │      │ Express, Fastify, Hono…    │
│ Nitro                │      │ └─ Syora ─ Vue application │
└──────────────────────┘      └────────────────────────────┘
```

## Quick comparison

| Topic | Nuxt | Syora |
| --- | --- | --- |
| Server runtime | Nitro | Your HTTP server |
| File-based pages | Yes | Yes |
| Layouts | Yes | Yes |
| Auto-imports | Yes | Yes |
| Route middleware | Yes | Yes |
| SSR and hydration | Yes | Yes |
| Data loading | `useAsyncData()` | `useAsyncData()` |
| Modules and plugins | Nuxt ecosystem | Syora's own systems |
| Documented deployments | Many Nitro presets | Depends on your backend |
| Maturity | Established ecosystem | Alpha project |

Features with the same name do not guarantee identical APIs. Always check the Syora reference before reusing Nuxt code.

## Choose Nuxt

Choose Nuxt when you want an integrated solution and Nitro fits your architecture.

Nuxt is generally a better fit when:

<div class="py-3 space-y-2">
  <div class="flex flex-wrap items-center gap-2"><u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon><span>you are starting a new project without runtime constraints;</span></div>
  <div class="flex flex-wrap items-center gap-2"><u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon><span>you want a mature, extensive ecosystem;</span></div>
  <div class="flex flex-wrap items-center gap-2"><u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon><span>you prefer integrated deployment presets;</span></div>
  <div class="flex flex-wrap items-center gap-2"><u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon><span>your team already knows Nuxt conventions.</span></div>
</div>

## Choose Syora

Choose Syora when the backend is a foundational decision that must not be replaced.

Syora is generally a better fit when:

<div class="py-3 space-y-2">
  <div class="flex flex-wrap items-center gap-2"><u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon><span>Express, Fastify, NestJS, AdonisJS, Koa, or Hono already hosts your application logic;</span></div>
  <div class="flex flex-wrap items-center gap-2"><u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon><span>you must keep an IoC container, middleware stack, or specific server lifecycle;</span></div>
  <div class="flex flex-wrap items-center gap-2"><u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon><span>you want to serve the API and interface from the same application;</span></div>
  <div class="flex flex-wrap items-center gap-2"><u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon><span>your infrastructure directly depends on the selected runtime.</span></div>
</div>

## What changes in server code

With Syora, you own the HTTP entry point:

```ts
// server.ts
import { express } from "@syora/core/adapters/express";

server.get("/api/users", usersController);
server.use(express());
```

You decide middleware order, API routes, observability, and server startup. The adapter initializes Syora and handles requests that reach it.

## What remains familiar

A Nuxt developer will recognize several conventions:

| Nuxt | Syora |
| --- | --- |
| `pages/` | `app/pages/` |
| `layouts/` | `app/layouts/` |
| `components/` | `app/components/` |
| `composables/` | `app/composables/` |
| `plugins/` | `app/plugins/` |
| `middleware/` | `app/middlewares/` |
| `definePageMeta()` | `definePageMeta()` |
| `useAsyncData()` | `useAsyncData()` |
| `defineNuxtPlugin()` | `defineVuePlugin()` |
| `defineNuxtModule()` | `defineModule()` |

::u-tip
---
variant: warning
title: Not a drop-in replacement
---

Syora adopts useful conventions, not all of Nuxt. Nuxt modules, Nitro APIs, and Nitro deployment presets are not directly compatible.

::

## Decide quickly

| Question | If the answer is yes |
| --- | --- |
| Does Nitro meet your server needs? | Evaluate Nuxt first |
| Must an existing backend remain in control of the server? | Evaluate Syora |
| Do you only need a lightweight SPA? | Vue and Vite may be enough |
| Is production stability more important than runtime freedom? | Account for Syora's alpha status |

::u-tip
---
variant: info
title: Next step
---

Customize directories, SSR, and Vite in <a href="./configuration.md">Configuration</a>.

::
