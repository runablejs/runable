---
title: File-Based Routing That Still Feels Like Vue
description: Organize routes with files while keeping Vue Router available whenever the application needs direct control.
date: 2026-08-16
authors:
  - domutala
---

Route configuration often starts as a short array. Over time, that array becomes a second representation of the application: every page has a component file, a route entry, a name, metadata, and sometimes a nested parent that must stay synchronized.

Syora removes that duplicate structure. Files inside `app/pages/` become routes, while Vue Router remains the routing engine underneath.

## Read the application from its folders

This directory already describes a useful route tree:

```text
app/pages/
├── index.vue
├── about.vue
├── projects.vue
├── projects/
│   ├── index.vue
│   └── [id].vue
└── docs/
    └── [...path].vue
```

Syora generates these paths:

```text
/
/about
/projects
/projects/:id
/docs/:path*
```

Static files map to static paths. Brackets create dynamic parameters. Three dots create a catch-all parameter. Double brackets can make a segment optional.

The convention reduces configuration, but it does not hide the router. Read parameters with `useRoute()` as you would in any Vue Router application:

```vue
<script setup lang="ts">
const route = useRoute();
const projectId = computed(() => String(route.params.id));
</script>

<template>
  <h1>Project {{ projectId }}</h1>
</template>
```

## Make nesting explicit in the UI

A nested URL does not always need a nested interface. When it does, place `SyoraPage` in the parent page:

```vue
<!-- app/pages/projects.vue -->
<template>
  <section class="projects-shell">
    <ProjectsNavigation />
    <SyoraPage />
  </section>
</template>
```

The child route renders where `SyoraPage` appears. This keeps the filesystem responsible for route hierarchy and the component responsible for visual hierarchy.

Use a layout instead when several unrelated route branches share the same frame. Parent pages are best for route-specific nesting; layouts are best for application-wide shells such as dashboards or account areas.

## Add behavior with page metadata

Routes often need more than a path. `definePageMeta()` attaches that behavior to the page that uses it:

```vue
<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
  alias: "/work/:id",
});
</script>
```

Use metadata to select a layout, run navigation middleware, or define aliases. A child page can override metadata inherited from its parent.

Syora generates alphanumeric PascalCase names for routes. A file such as `projects/[id].vue` receives a name such as `ProjectsId`. If the public name is part of your application API, set it explicitly:

```ts
definePageMeta({
  name: "ProjectDetails",
});
```

## Navigate without coupling templates to the router

Use `SyoraLink` for links rendered in templates:

```vue
<SyoraLink :to="{ name: 'ProjectDetails', params: { id: project.id } }">
  {{ project.name }}
</SyoraLink>
```

Use `navigateTo()` when navigation follows an action:

```ts
async function openProject(id: string) {
  await navigateTo({
    name: "ProjectDetails",
    params: { id },
  });
}
```

For guards, history inspection, or another advanced Vue Router feature, call `useRouter()` directly. Syora adds a productive default; it does not replace the underlying APIs.

## Let the route table follow the code

Adding, moving, or deleting a page updates the generated routes during development. Vue Router handles page changes, so the server does not need to restart for every edit.

This is the practical value of file-based routing: less configuration to maintain, a project tree that explains itself, and an escape hatch whenever direct router control is the clearer solution.

See the complete conventions in <a href="/docs/guide/routing.md">Routing</a>.
