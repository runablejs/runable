---
title: "@runablejs/vueuse"
package: "@runablejs/vueuse"
install: pnpm add @runablejs/vueuse @vueuse/core
description: Use VueUse composables and utilities through Runable auto-imports, with zero configuration and tree-shakeable production builds.
category: Composables
icon: logos:vueuse
repository: https://github.com/runablejs/vueuse
documentation: https://github.com/runablejs/vueuse#readme
npm: https://www.npmjs.com/package/@runablejs/vueuse
learnMore: https://vueuse.org
maintainer: Runable Team
author: domutala
contributors: []
compatibility: Runable 1.x · VueUse 14 · Vue 3.5+
tags:
  - vueuse
  - composables
  - utilities
  - auto-imports
  - ssr
---

`@runablejs/vueuse` exposes the composables and utilities from `@vueuse/core` through Runable's automatic imports. You can use VueUse from components and composables without configuring a Vue plugin or writing repetitive imports.

## Installation

Install the Runable module and VueUse:

```bash
pnpm add @runablejs/vueuse @vueuse/core
```

Register the module in `runable.config.ts`:

```ts
import { defineConfig } from "runable";

export default defineConfig({
  modules: ["@runablejs/vueuse"],
});
```

No additional configuration is required.

## Use VueUse composables

VueUse composables are available without explicit imports:

```vue
<script setup lang="ts">
const { x, y } = useMouse();
const preferredDark = usePreferredDark();
const count = useLocalStorage("count", 0);
</script>

<template>
  <p>Mouse: {{ x }}, {{ y }}</p>
  <p>Dark mode preferred: {{ preferredDark }}</p>

  <button type="button" @click="count++">
    Count: {{ count }}
  </button>
</template>
```

Utilities such as `createSharedComposable` are auto-imported too. Runable keeps the generated imports tree-shakeable, so production bundles only include the VueUse APIs your application uses.

## Import conflicts

The names `useFetch`, `toRef`, and `toRefs` retain the behavior provided by Runable or Vue. Import the VueUse variants explicitly when you need them:

```ts
import {
  toRef as toVueUseRef,
  toRefs as toVueUseRefs,
  useFetch as useVueUseFetch,
} from "@vueuse/core";
```

All other explicit imports from `@vueuse/core` remain supported.

## Optional VueUse packages

The module only registers APIs from `@vueuse/core`. VueUse integrations, RxJS, Firebase, Motion, and components remain separate packages. Install and import those packages explicitly when your application needs them.

Use SSR-compatible composables according to their VueUse documentation. The module exposes the APIs through auto-imports but does not change their runtime behavior.
