---
title: Quick Start
description: Create a Syora application with two pages, a layout, an API route, and server-rendered data.
---

Build a small application that combines automatic routing, a shared layout, and SSR data loading.

This page starts from the Express project created in <a href="/docs/getting-started/installation.md">Installation</a>.

## Add an API route

Replace `server.ts` with this example:

```ts
// server.ts
import Express from "express";
import { express } from "@syora/core/adapters/express";

const server = Express();

server.get("/api/projects", (_req, res) => {
  res.json([
    { id: 1, name: "Documentation" },
    { id: 2, name: "Dashboard" },
  ]);
});

server.use(express());

server.listen(3000, () => {
  console.log("http://localhost:3000");
});
```

Your API remains a regular Express route. Syora does not move it into the frontend.

## Create a layout

```vue
<!-- app/layouts/default.vue -->
<template>
  <div>
    <header>
      <strong>My application</strong>

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/projects">Projects</RouterLink>
      </nav>
    </header>

    <main>
      <slot />
    </main>
  </div>
</template>
```

The `default.vue` layout wraps pages that do not explicitly request another layout.

## Create the home page

```vue
<!-- app/pages/index.vue -->
<template>
  <section>
    <h1>Welcome</h1>
    <p>The Express backend and Vue application live in the same project.</p>
  </section>
</template>
```

`app/pages/index.vue` automatically maps to `/`.

## Load data

Create a second page:

```vue
<!-- app/pages/projects.vue -->
<script setup lang="ts">
type Project = {
  id: number;
  name: string;
};

const { data: projects, pending, error, refresh } = await useAsyncData(
  "projects",
  async (signal) => {
    const response = await fetch("http://localhost:3000/api/projects", {
      signal,
    });

    if (!response.ok) {
      throw new Error("Unable to load projects");
    }

    return response.json() as Promise<Project[]>;
  },
);
</script>

<template>
  <section>
    <h1>Projects</h1>

    <p v-if="pending">Loading…</p>
    <p v-else-if="error">{{ error.message }}</p>

    <ul v-else>
      <li v-for="project in projects" :key="project.id">
        {{ project.name }}
      </li>
    </ul>

    <button type="button" @click="refresh">Refresh</button>
  </section>
</template>
```

`useAsyncData()` runs the fetch during server rendering. Syora embeds the result in the HTML and restores the cache on the client, so the browser does not immediately repeat the request during hydration.

::u-tip
---
variant: info
title: One stable key per resource
---

The `projects` key identifies the cache entry and deduplicates simultaneous calls. Use a different key when request parameters change.

::

## Observe automatic routing

Your directory now contains two routes:

```text
app/pages/
├── index.vue       → /
└── projects.vue    → /projects
```

Add a file to `app/pages/` to create a route. There is no route table to maintain.

## What you just used

| Need | Syora solution |
| --- | --- |
| Display several screens | Routing based on `app/pages/` |
| Share navigation | `default.vue` layout |
| Keep application routes | `/api/projects` route in Express |
| Preload data during SSR | `useAsyncData()` |
| Avoid a second fetch on mount | Cache serialization and hydration |

::u-tip
---
variant: info
title: Next step
---

Compare this model with Nuxt in <a href="/docs/getting-started/vs-nuxt.md">Syora vs Nuxt</a>.

::
