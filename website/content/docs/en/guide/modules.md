---
title: Modules
description: Group and distribute a configurable Syora feature.
---

A module is reusable Syora configuration. It can add components, composables, layouts, plugins, middleware, styles, and even other modules.

## Create a local module

```text
modules/analytics/
├── syora.config.ts
└── runtime/
    └── plugin.ts
```

```ts
// modules/analytics/syora.config.ts
import { defineModule } from "@syora/core";

export default defineModule<{ endpoint: string }>({
  meta: { name: "analytics", version: "1.0.0" },
  configKey: "analytics",
  defaults: { endpoint: "/api/events" },
  plugins: ["./runtime/plugin.ts"],

  setup(options) {
    process.env.SYO_ANALYTICS_ENDPOINT ??= options.endpoint;
  },
});
```

Declare it in the project:

```ts
// syora.config.ts
export default defineConfig({
  modules: ["./modules/analytics"],
  analytics: {
    endpoint: "https://events.example.com",
  },
});
```

`configKey` identifies where to read consumer options. Syora merges `defaults` with these options before calling `setup()`.

## Add collections without setup

A module can extend Syora configuration directly:

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

Groups run in `pre`, normal, then `post` order. `dependOn` imposes order within a group or toward an earlier group. Syora rejects unknown dependencies, cycles, and dependencies on a later group.

## Publish a module

Build the module before publishing it. For an installed package, Syora resolves its `syora.config` from the package's `dist` directory. Then add its name to the consuming project's `modules` array.

::u-tip
---
variant: warning
title: The modules directory is not scanned automatically
---

A local module is loaded only when it appears in `modules` with a relative path.

::
