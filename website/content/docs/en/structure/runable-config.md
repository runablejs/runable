---
title: runable.config.ts
description: Configure conventions, SSR, modules, and Vite from the project's central file.
---

This file is Runable's source of truth. Place it at the root and export the result of `defineConfig()`.

```ts
// runable.config.ts
import { defineConfig } from "runable";

export default defineConfig({
  ssr: true,
  head: {
    title: "My application",
  },
  css: ["./app/css/main.css"],
  modules: [],
});
```

Relative paths are resolved from the configuration directory. Main conventions use these defaults:

| Option | Value |
| --- | --- |
| `appDir` | `app` |
| `output` | `.app` |
| `distdir` | `.output` |
| `publicDir` | `public` |
| `ssr` | `true` |

The `pages`, `layouts`, `components`, `composables`, `globals`, `plugins`, and `middlewares` options replace their conventional sources when defined.

Use `vite` to add an allowed Vite plugin or option:

```ts
export default defineConfig({
  vite: {
    server: { port: 5173 },
  },
});
```

Use `extendConfig` when an application or module needs access to the resolved
main application configuration. Every hook runs before module setup hooks and
receives its resolved options as the second argument. It may mutate the main
configuration or return a replacement:

```ts
export default defineConfig({
  extendConfig(config, _options) {
    return {
      ...config,
      baseUrl: "/app",
    };
  },
});
```

See <a href="/docs/getting-started/configuration.md">Configuration</a> for all options.
