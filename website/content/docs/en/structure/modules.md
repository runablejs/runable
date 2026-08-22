---
title: modules
description: Develop local Runable modules before extracting them into a package.
---

The `modules/` directory is a recommended location for project-specific Runable extensions. It is not scanned automatically: declare each module in the configuration.

```text
modules/
└── analytics/
    └── runable.config.ts
```

```ts
// runable.config.ts
export default defineConfig({
  modules: ["./modules/analytics"],
});
```

A module can provide components, composables, globals, layouts, and plugins, then expose its own typed options. Use a local module to group cross-cutting functionality. Extract it into an npm package when several projects need to share it.

The directory may use another name; only the `modules` array value matters.
