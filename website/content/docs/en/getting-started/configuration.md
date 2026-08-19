---
title: Configuration
description: Configure directories, SSR, metadata, aliases, modules, and Vite options for your application.
---

`syora.config.ts` defines the application structure, rendering mode, and extensions loaded at startup.

## Minimal configuration

Place this file at the project root:

```ts
// syora.config.ts
import { defineConfig } from "@syora/core";

export default defineConfig({});
```

`defineConfig()` preserves the object while providing TypeScript types and autocomplete.

## Default values

Without additional options, Syora uses this structure:

| Option | Default | Purpose |
| --- | --- | --- |
| `appDir` | `app` | Root of Vue sources |
| `output` | `.app` | Files generated for development and typing |
| `distdir` | `.output` | Production build |
| `publicDir` | `public` | Assets served as-is |
| `ssr` | `true` | Enables server rendering |
| `pages` | `app/pages` | Page files |
| `layouts` | `app/layouts` | Available layouts |
| `components` | `app/components` | Auto-registered components |
| `composables` | `app/composables` | Auto-imported composables |
| `globals` | `app/globals` | Auto-imported global functions |
| `middlewares` | `app/middlewares` | Navigation middleware |
| `plugins` | `app/plugins` | Application plugins |
| `css` | `[]` | Global stylesheets |
| `modules` | `[]` | Loaded Syora modules |

Relative paths are resolved from the directory containing the configuration.

## Define main directories

```ts
// syora.config.ts
import { defineConfig } from "@syora/core";

export default defineConfig({
  appDir: "frontend",
  output: ".syora",
  distdir: "dist",
  publicDir: "static",
});
```

Use `publicDir: false` when your backend or a CDN handles all static assets.

## Enable or disable SSR

```ts
export default defineConfig({
  ssr: false,
});
```

With `ssr: false`, Syora returns the HTML document without rendering the Vue tree on the server. The client then creates the application in the browser.

| Mode | Choose it for |
| --- | --- |
| `ssr: true` | SEO, a rendered first display, and preloaded data |
| `ssr: false` | Internal SPAs or interfaces that depend entirely on the browser |

## Configure HTML metadata

```ts
export default defineConfig({
  siteUrl: "https://example.com",
  head: {
    title: "My application",
    meta: [
      {
        name: "description",
        content: "A Vue application rendered with Syora.",
      },
    ],
    link: [{ rel: "icon", href: "/favicon.svg" }],
  },
});
```

`siteUrl` supplies the origin used to produce some absolute URLs. `head` is passed to Unhead when the application is created.

## Add global styles

```ts
export default defineConfig({
  css: ["./app/css/reset.css", "./app/css/main.css"],
});
```

The `css` array accepts files Vite can process. Install the matching preprocessor when using Sass, Less, or Stylus.

## Define aliases

```ts
import { join } from "node:path";

export default defineConfig({
  alias: {
    "@": join(import.meta.dirname, "app"),
    "@shared": join(import.meta.dirname, "shared"),
  },
});
```

Syora also adds the internal `#build` alias, which points to the generated directory defined by `output`.

## Extend scanned directories

Replace conventional locations with your own paths:

```ts
export default defineConfig({
  pages: ["./frontend/views"],
  layouts: ["./frontend/shells"],
  composables: ["./frontend/composables", "./shared/composables"],
  globals: ["./frontend/globals"],
  middlewares: ["./frontend/middlewares"],
  plugins: ["./frontend/plugins"],
});
```

::u-tip
---
variant: info
title: Replacing defaults
---

When you provide a directory option, treat it as the new source to scan. Explicitly include the conventional directory if you want to keep it in the list.

::

## Configure components

An object entry controls the generated name:

```ts
export default defineConfig({
  components: [
    "./app/components",
    {
      dirs: "./app/components/ui",
      prefix: "Ui",
      pathPrefix: false,
    },
  ],
});
```

`app/components/ui/Button.vue` can therefore be exposed under a prefixed name according to the directory options.

## Load modules

```ts
export default defineConfig({
  modules: ["@acme/syora-auth", "./modules/content"],

  auth: {
    redirectTo: "/login",
  },
});
```

A module can add its own pages, components, layouts, plugins, or Vite options. Module-specific options live under the key declared by that module.

## Extend Vite

```ts
import inspect from "vite-plugin-inspect";

export default defineConfig({
  vite: {
    plugins: [inspect()],
    define: {
      __BUILD_TARGET__: JSON.stringify("web"),
    },
  },
});
```

Syora merges this with its internal Vite configuration. Fields that define framework behavior, including `root`, `appType`, `ssr`, and `server.middlewareMode`, remain under Syora's control.

## Complete example

```ts
import { join } from "node:path";
import { defineConfig } from "@syora/core";

export default defineConfig({
  appDir: "app",
  output: ".app",
  distdir: ".output",
  publicDir: "public",

  ssr: true,
  siteUrl: "https://example.com",

  head: {
    title: "My application",
    meta: [{ name: "description", content: "My Syora application" }],
  },

  css: ["./app/css/main.css"],
  modules: [],

  alias: {
    "@": join(import.meta.dirname, "app"),
  },
});
```

::u-tip
---
variant: info
title: Next step
---

Learn how these options become an application in <a href="/docs/getting-started/concepts.md">Concepts</a>.

::
