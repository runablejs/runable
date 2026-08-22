---
title: app
description: Organize your Vue application sources in the app directory.
---

The `app/` directory contains the Vue application. Runable scans its conventional subdirectories and generates the required registries.

```text
app/
├── pages/
├── layouts/
├── components/
├── composables/
├── globals/
├── plugins/
├── middlewares/
├── css/
├── app.vue
└── error.vue
```

Every item is optional. A minimal application can contain only `app/pages/index.vue`.

## Use another name

```ts
// runable.config.ts
export default defineConfig({
  appDir: "frontend",
});
```

Conventions then become `frontend/pages`, `frontend/layouts`, and so on. A more specific option such as `pages` or `components` can override only the corresponding directory.

::u-tip
---
variant: info
title: Development reloading
---

Vite watches configuration directories such as components, layouts, composables, globals, plugins, and middleware. Vue Router handles changes in `pages/` directly.

::
