---
title: CSS and assets
description: Load global styles and serve the application's static files.
---

Syora distinguishes files transformed by Vite from files served as-is.

## Load global styles

Declare them in `syora.config.ts`:

```ts
export default defineConfig({
  css: [
    "app/css/reset.css",
    "app/css/main.css",
  ],
});
```

Syora combines project and module styles, removes duplicates, and imports them into the client entry. Vite processes imports, URLs, and installed preprocessors.

You can also scan a directory:

```ts
export default defineConfig({
  css: [{ path: "app/css", recursive: true }],
});
```

## Keep styles local

Component-specific styles remain in the Vue file:

```vue
<style scoped>
.card {
  border: 1px solid #ddd;
}
</style>
```

Add only globally loaded stylesheets to `css`.

## Serve a public file

Put untransformed files in `public/`:

```text
public/
├── favicon.svg
└── images/logo.png
```

Reference them from the root:

```vue
<img src="/images/logo.png" alt="Acme" />
```

To import an asset and let Vite version it, keep it in source code:

```vue
<script setup lang="ts">
import logoUrl from "../assets/logo.svg";
</script>

<template><img :src="logoUrl" alt="Acme" /></template>
```

## Change the public directory

```ts
export default defineConfig({
  publicDir: "static",
});
```

Use `publicDir: false` to disable it.

::u-tip
---
variant: info
title: Public file or import?
---

Use `public/` to keep a stable name such as `robots.txt`. Use an import to let Vite create a versioned name and optimize the reference.

::
