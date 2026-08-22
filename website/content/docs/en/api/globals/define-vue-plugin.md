---
title: defineVuePlugin
description: Declare a Runable plugin with injections, dependencies, and application hooks.
---

The short form receives a setup function directly:

```ts
// app/plugins/api.ts
export default defineVuePlugin(() => {
  return {
    provide: {
      apiBase: "/api",
    },
  };
});
```

The object form controls order and dependencies:

```ts
export default defineVuePlugin({
  name: "analytics",
  enforce: "post",
  dependsOn: ["auth"],
  setup(app) {
    app.provide("analytics", createAnalytics());
  },
  hooks: {
    "app:mounted"(app) {
      console.log("Application mounted", app);
    },
  },
});
```

`enforce` accepts `pre` or `post`. Values returned in `provide` are injected into Vue and added to global properties with a `$` prefix.
