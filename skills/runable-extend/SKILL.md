---
name: runable-extend
description: Create Runable plugins and modules, and understand auto-imported components, composables, and globals. Use when working with defineVuePlugin, defineModule, app/plugins, app/components, app/composables, app/globals, or a project's modules directory.
---

# Runable Extend

Use this skill when creating a Vue plugin, a reusable Runable module, or when working with auto-imported code (`app/components/`, `app/composables/`, `app/globals/`).

Scope: application startup extension (plugins), reusable configuration packaging (modules), and the auto-import mechanism that backs both. It does not cover routing/pages (see `runable-pages`) or backend server integration (see `runable-integrations`).

## Plugin or module?

A **plugin** initializes the Vue application at runtime — one instance, once per app creation. A **module** configures Runable itself (adds directories, plugins, components, layouts, styles, or other modules) and can bundle several plugins together. Reach for a plugin to run code when the app starts; reach for a module to package and distribute a configurable feature.

## Auto-imports

Three directories are scanned and their exports made available without an explicit `import`:

```text
app/components/base/Button.vue → <BaseButton /> in templates
app/composables/useCurrency.ts → useCurrency() in any Vue script
app/globals/formatDate.ts      → formatDate() in any Vue script
```

`app/components/` registers Vue components globally, named from their path unless the component declares its own name (`defineOptions({ name: "..." })`, which takes precedence). `app/composables/` and `app/globals/` both auto-import every export — put Vue-lifecycle-dependent code (composables using `ref`/`onMounted`/etc.) in `composables/`, and plain functions with no Vue dependency in `globals/`.

Extra source directories can be added in `runable.config.ts`:

```ts
export default defineConfig({
  components: ["app/components", { dirs: "app/components/ui", prefix: "Ui" }],
  composables: ["app/composables", "shared/composables"],
  globals: ["app/globals", "shared/utils"],
});
```

An auto-imported file should primarily export values — put code that must run during startup in a plugin instead.

## Plugins

```ts
// app/plugins/api.ts
export default defineVuePlugin((vueApp) => {
  vueApp.directive("focus", {
    mounted(element) {
      element.focus();
    },
  });

  return { provide: { apiBase: "/api" } };
});
```

`provide` values are registered with `app.provide()` and exposed as `$`-prefixed global properties. `defineVuePlugin()` also accepts an object form for ordering:

```ts
// app/plugins/tracking.ts
export default defineVuePlugin({
  name: "tracking",
  enforce: "post",
  dependsOn: ["api"],
  setup() {
    // Initialization
  },
});
```

| Option | Purpose |
| --- | --- |
| `name` | Identifies the plugin so others can `dependsOn` it |
| `enforce: "pre"` | Runs before plugins without a priority |
| `enforce: "post"` | Runs after plugins without a priority |
| `dependsOn` | Waits for the named plugins in the same group |
| `setup` | Runs the initialization logic, receives the Vue app instance |
| `hooks` | Registers Runable runtime hooks |

Runable resolves `pre`, normal, then `post` groups separately, then `dependsOn` within each. A circular dependency throws; a missing dependency warns.

During SSR, Runable creates one Vue application per render. Create mutable state inside `setup()` (e.g. with `reactive()`), never in a module-level variable — requests would share it.

## Modules

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

```ts
// runable.config.ts
export default defineConfig({
  modules: ["./modules/analytics"],
  analytics: { endpoint: "https://events.example.com" },
});
```

`configKey` names where the consuming project's options live; Runable merges `defaults` with them before calling `setup()`. A module can also just extend the config without a `setup()`:

```ts
export default defineModule({
  meta: { name: "design-system" },
  components: ["./components"],
  css: ["./styles/index.css"],
});
```

Paths are resolved from the module's own directory. Ordering uses the same `pre`/normal/`post` groups plus a dependency list (`dependOn`) as plugins; unknown dependencies, cycles, and dependencies on a later group are rejected.

A local module is only loaded when it's listed by relative path in `modules` — the `modules/` directory itself is not scanned automatically. To publish a module, build it first; Runable resolves an installed package's `runable.config` from its `dist` directory.

## Common mistakes

- Assuming `modules/` is scanned automatically — a module only loads once referenced in `runable.config.ts`'s `modules` array.
- Storing per-request mutable state in a plugin's module scope instead of inside `setup()`.
- Putting startup side effects in `app/composables/` or `app/globals/` instead of a plugin.
- Forgetting `dependsOn`/`dependOn` when one plugin or module genuinely requires another to run first.

## When another skill is needed

- The extension being built is actually about routes, layouts, or navigation: `runable-pages`.
- The extension wires up a backend server: `runable-integrations`.

Consult the current Runable API reference when exact behavior matters.
