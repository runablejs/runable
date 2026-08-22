---
title: Routing
description: Create application routes from files in app/pages.
---

Runable turns components in `app/pages/` into Vue Router routes. Add, move, or delete a file and the route table follows automatically.

## Create routes

```text
app/pages/
├── index.vue                 → /
├── about.vue                 → /about
├── projects/
│   ├── index.vue             → /projects
│   └── [id].vue              → /projects/:id
├── blog/[[page]].vue         → /blog/:page?
└── docs/[...path].vue        → /docs/:path*
```

Read parameters from a dynamic route with `useRoute()`:

```vue
<script setup lang="ts">
const route = useRoute();
const projectId = computed(() => String(route.params.id));
</script>

<template>
  <h1>Project {{ projectId }}</h1>
</template>
```

## Define page metadata

`definePageMeta()` is auto-imported into pages.

```vue
<script setup lang="ts">
definePageMeta({
  name: "project-details",
  layout: "dashboard",
  middleware: ["auth"],
});
</script>
```

Use these fields to control the route:

| Field | Effect |
| --- | --- |
| `name` | Replaces the generated name |
| `path` | Replaces the generated path |
| `alias` | Adds one or more alternate paths |
| `layout` | Selects the layout |
| `middleware` | Runs named middleware |

Parent route metadata is passed to children. A value defined by the child takes precedence.

## Navigate

Use `RunableLink` in templates or `navigateTo()` in scripts:

```vue
<template>
  <RunableLink to="/projects">View projects</RunableLink>
</template>
```

```ts
await navigateTo({ name: "project-details", params: { id: "42" } });
```

For direct Vue Router access, use `useRoute()` and `useRouter()`.

## Display nested pages

Place `RunablePage` in a parent page to display its child route:

```vue
<!-- app/pages/projects.vue -->
<template>
  <section>
    <h1>Projects</h1>
    <RunablePage />
  </section>
</template>
```

::u-tip
---
variant: info
title: Hot reload
---

Vue Router handles changes in `app/pages/`. You do not need to restart the server after adding a page.

::
