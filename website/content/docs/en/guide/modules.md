---
title: Modules
description: Group and distribute a configurable Runable feature.
---

A module is reusable Runable configuration. It can add components, composables, layouts, plugins, middleware, styles, and even other modules.

## Create a local module

```text
modules/analytics/
├── runable.config.ts
└── runtime/
    └── plugin.ts
```

```ts
// modules/analytics/runable.config.ts
import { defineModule } from "runable";

export default defineModule<{ endpoint: string }>({
  meta: { name: "analytics", version: "1.0.0" },
  configKey: "analytics",
  defaults: { endpoint: "/api/events" },
  plugins: ["./runtime/plugin.ts"],

  setup(options) {
    process.env.RUN_ANALYTICS_ENDPOINT ??= options.endpoint;
  },
});
```

Declare it in the project:

```ts
// runable.config.ts
export default defineConfig({
  modules: ["./modules/analytics"],
  analytics: {
    endpoint: "https://events.example.com",
  },
});
```

`configKey` identifies where to read consumer options. Runable merges `defaults` with these options before calling `setup()`.

## Add collections without setup

A module can extend Runable configuration directly:

```ts
export default defineModule({
  meta: { name: "design-system" },
  components: ["./components"],
  css: ["./styles/index.css"],
});
```

Paths are resolved from the module directory.

## Order several modules

```ts
export default defineModule({
  meta: { name: "analytics-ui" },
  dependOn: ["analytics"],
  enforce: "post",
  async setup() {},
});
```

Groups run in `pre`, normal, then `post` order. `dependOn` imposes order within a group or toward an earlier group. Runable rejects unknown dependencies, cycles, and dependencies on a later group.

## Publish a module

Build the module before publishing it. For an installed package, Runable resolves its `runable.config` from the package's `dist` directory. Then add its name to the consuming project's `modules` array.

::u-tip
---
variant: warning
title: The modules directory is not scanned automatically
---

A local module is loaded only when it appears in `modules` with a relative path.

::
