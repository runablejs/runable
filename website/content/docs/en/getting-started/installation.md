---
title: Installation
description: Install Syora in an existing backend project and prepare a minimal Vue application with Express.
---

Add Syora to your backend, create the Vue directory, then connect HTTP requests to the rendering engine.

## Prerequisites

Use a Node.js version supported by `@syora/core`:

| Tool | Version |
| --- | --- |
| Node.js | `22.18.0` or newer, or `24.12.0` and later |
| Vue | `3.5` or newer |

This page uses Express and TypeScript. The same principle applies to other backends.

## Install dependencies

::u-code-group

```bash [pnpm]
pnpm add @syora/core vue vue-router express
pnpm add -D @syora/cli tsx typescript @types/node @types/express
```

```bash [npm]
npm install @syora/core vue vue-router express
npm install --save-dev @syora/cli tsx typescript @types/node @types/express
```

```bash [yarn]
yarn add @syora/core vue vue-router express
yarn add --dev @syora/cli tsx typescript @types/node @types/express
```

```bash [Bun]
bun add @syora/core vue vue-router express
bun add --dev @syora/cli tsx typescript @types/node @types/express
```

::

## Add scripts

Configure development, type preparation, and the production build:

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch server.ts",
    "app:prepare": "syora prepare",
    "app:build": "syora build"
  }
}
```

`syora prepare` generates files required during development. `syora build` produces the application build.

## Create the configuration

Add `syora.config.ts` at the project root:

```ts
// syora.config.ts
import { defineConfig } from "@syora/core";

export default defineConfig({
  ssr: true,
});
```

With this minimal configuration, Syora uses these conventions:

| Item | Default location |
| --- | --- |
| Vue sources | `app/` |
| Pages | `app/pages/` |
| Static assets | `public/` |
| Generated files | `.app/` |
| Production build | `.output/` |

## Create the first page

```vue
<!-- app/pages/index.vue -->
<template>
  <main>
    <h1>Hello Syora</h1>
    <p>This page is generated from app/pages/index.vue.</p>
  </main>
</template>
```

You do not need to declare the `/` route. Syora creates it from `index.vue`.

## Connect Express to Syora

```ts
// server.ts
import Express from "express";
import { express } from "@syora/core/adapters/express";

const server = Express();

server.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// The adapter initializes Syora once and serves the frontend.
server.use(express());

server.listen(3000, () => {
  console.log("http://localhost:3000");
});
```

Place the Syora adapter after your API routes. `/api/health` remains handled by Express, while `/` is rendered by Vue.

The adapter calls `createSyoraApp()` once. In development, it lets Vite respond to modules and assets before rendering the page.

## Install only your backend

Supported frameworks are not runtime dependencies of `@syora/core`. Install the one used by your application:

| Adapter | Consuming project dependency |
| --- | --- |
| `express()` | `express` |
| `fastify()` | `fastify` |
| `hono()` | `hono` |
| `koa()` | `koa` |
| `nestjs()` | `@nestjs/common`, `@nestjs/core`, and the Express platform |
| `adonis()` | `@adonisjs/core` |
| `bun()` | No additional npm dependency |
| `deno()` | No additional npm dependency |

## Start the project

```bash
pnpm app:prepare
pnpm dev
```

Open `http://localhost:3000`. The page should display “Hello Syora”.

::u-tip
---
variant: warning
title: Alpha CLI
---

The interactive `create-syora` command exists, but its starters are still evolving. The manual installation above shows every file added to your backend.

::

::u-tip
---
variant: success
title: Installation complete
---

Now build a small application with <a href="/docs/getting-started/quickstart.md">Quick Start</a>.

::
