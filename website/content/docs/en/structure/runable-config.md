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

Use `extendConfig` to modify an application's or module's own resolved
configuration. Every hook runs after the complete configuration graph has been
resolved but before module setup hooks. It receives the current resolved
configuration as the first argument and that configuration's resolved options
as the second argument. The hook may mutate its configuration or return a
replacement:

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

For the main application configuration, the options argument is an empty
object. A module receives its defaults merged with the consumer's overrides.
Changes made by a module's `extendConfig` hook apply only to that module's
resolved configuration, not to the main application configuration.

See <a href="/docs/getting-started/configuration.md">Configuration</a> for all options.
