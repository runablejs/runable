---
title: Plugins
description: Initialize libraries, provide dependencies, and order Vue application startup.
---

A plugin runs while the Vue application is created, before rendering. Put it in `app/plugins/` when a feature must be installed once per instance.

## Create a plugin

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

Values in `provide` are registered with `app.provide()` and as `$`-prefixed global properties.

## Declare order

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
| `name` | Identifies the plugin in dependencies |
| `enforce: "pre"` | Runs before plugins without priority |
| `enforce: "post"` | Runs after plugins without priority |
| `dependsOn` | Waits for named plugins in the same group |
| `setup` | Configures the Vue application |
| `hooks` | Registers Syora runtime hooks |

Syora sorts `pre`, normal, and `post` groups separately, then resolves `dependsOn`. A circular dependency throws an explicit error. A missing dependency produces a warning.

## Keep SSR isolated

During SSR, Syora creates one Vue application per render. Create mutable state inside `setup()`:

```ts
export default defineVuePlugin(() => {
  const state = reactive({ user: null });
  return { provide: { session: state } };
});
```

Do not store user state in a mutable module-level variable because requests could share it.

::u-tip
---
variant: info
title: Plugin or module?
---

A plugin initializes Vue at runtime. A module configures Syora and can provide several plugins, components, layouts, or other collections.

::
