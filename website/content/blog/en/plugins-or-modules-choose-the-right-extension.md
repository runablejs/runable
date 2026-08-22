---
title: Plugins or Modules? Choose the Right Extension Point
description: Use plugins for Vue startup and modules for reusable Runable configuration that spans several conventions.
date: 2026-08-19
authors:
  - domutala
---

Plugins and modules both extend a Runable application, but they operate at different moments and solve different problems.

A plugin runs while a Vue application instance is being created. A module runs while Runable configuration is assembled. Choosing the right boundary keeps runtime state isolated and reusable features easy to distribute.

## Use a plugin to initialize Vue

Place a plugin in `app/plugins/` when a library or service must be installed for every Vue application instance.

```ts
// app/plugins/api.ts
export default defineVuePlugin((vueApp) => {
  vueApp.directive("focus", {
    mounted(element) {
      element.focus();
    },
  });

  return {
    provide: {
      apiBase: "/api",
    },
  };
});
```

This is the right place to:

- install a Vue library;
- register directives;
- provide a client or service;
- connect runtime hooks;
- create state scoped to one application instance.

The last point is essential during SSR. Runable creates a Vue application for each render, so mutable request state must be created inside the plugin setup function.

```ts
export default defineVuePlugin(() => {
  const session = reactive({ user: null });

  return {
    provide: { session },
  };
});
```

A mutable object declared at module scope could be shared by several server requests. Keeping it inside setup preserves request isolation.

## Order plugins by responsibility

Some plugins depend on services created by others. Declare that relationship instead of relying on filenames:

```ts
export default defineVuePlugin({
  name: "tracking",
  enforce: "post",
  dependsOn: ["api"],
  setup() {
    // The api plugin is ready here.
  },
});
```

`enforce` places the plugin in the `pre`, normal, or `post` group. `dependsOn` defines order inside the allowed groups. Runable reports circular dependencies rather than producing an unpredictable startup sequence.

## Use a module to package conventions

A module can add several kinds of application resources at once:

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
  meta: {
    name: "analytics",
    version: "1.0.0",
  },
  configKey: "analytics",
  defaults: {
    endpoint: "/api/events",
  },
  plugins: ["./runtime/plugin.ts"],

  setup(options) {
    process.env.RUN_ANALYTICS_ENDPOINT ??= options.endpoint;
  },
});
```

The consuming project selects the module and provides options:

```ts
// runable.config.ts
export default defineConfig({
  modules: ["./modules/analytics"],
  analytics: {
    endpoint: "https://events.example.com",
  },
});
```

Modules can contribute components, composables, layouts, middleware, plugins, styles, and other modules. Paths are resolved from the module directory, which makes the feature portable.

## Use the smallest extension point that fits

Choose a plugin when the requirement can be expressed as Vue initialization.

Choose a module when the feature:

- has consumer configuration;
- contributes several files or conventions;
- needs to be reused by multiple applications;
- should control its own paths and defaults;
- depends on another Runable module.

Do not create a module for a single local directive. Do not force a multi-part design system into one large runtime plugin. The implementation becomes easier to test and explain when its extension point matches its real scope.

## Combine both when the feature crosses phases

Plugins and modules are not competing systems. A module can register a plugin.

The module handles build-time discovery and configuration. Its plugin handles per-application initialization. This split is useful for analytics, internationalization, content systems, UI libraries, and any feature that needs both generated configuration and runtime behavior.

Read <a href="/docs/guide/plugins.md">Plugins</a> and <a href="/docs/guide/modules.md">Modules</a> for the complete APIs.
