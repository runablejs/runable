---
title: "@runablejs/Pinia"
package: "@runablejs/pinia"
install: pnpm add @runablejs/pinia pinia
description: Add Pinia 3 state management to Runable with automatic store imports, SSR isolation, and optional persistence powered by Unstorage.
category: State Management
icon: logos:pinia
repository: https://github.com/runablejs/pinia
documentation: https://github.com/runablejs/pinia#readme
npm: https://www.npmjs.com/package/@runablejs/pinia
learnMore: https://pinia.vuejs.org
maintainer: Runable Team
author: domutala
contributors: []
compatibility: Runable 1.x · Pinia 3 · Vue 3.5+
tags:
  - state management
  - pinia
  - stores
  - persistence
  - unstorage
  - ssr
---

`@runablejs/pinia` creates a fresh Pinia instance for every Runable application. Stores, Pinia helpers, and files exported from `app/stores` are available through auto-imports, with no application plugin to configure manually.

## Installation

Install the Runable module and Pinia:

```bash
pnpm add @runablejs/pinia pinia
```

Then register the module in `runable.config.ts`:

```ts
import { defineConfig } from "runable";

export default defineConfig({
  modules: ["@runablejs/pinia"],
});
```

## Create a store

Create `app/stores/counter.ts`. `defineStore` is auto-imported:

```ts
export const useCounterStore = defineStore("counter", {
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++;
    },
  },
});
```

The exported store is auto-imported in components and composables:

```vue
<script setup lang="ts">
const counter = useCounterStore();
const { count } = storeToRefs(counter);
</script>

<template>
  <button type="button" @click="counter.increment()">
    Count: {{ count }}
  </button>
</template>
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `storeDirs` | `string[]` | `['{appDir}/stores']` | Directories containing stores to auto-import. |
| `persist` | `boolean` | `false` | Enable persistence for every store by default. |
| `unstorage` | `UnstorageOptions` | Browser local storage | Configure the persistence storage. |

## Scan additional store directories

Use `storeDirs` when stores live outside `app/stores`. Paths are relative to the Runable project root:

```ts
import { defineConfig } from "runable";

export default defineConfig({
  modules: ["@runablejs/pinia"],
  pinia: {
    storeDirs: ["app/stores", "features/account/stores"],
  },
});
```

Setting `storeDirs` replaces the default list.

## Persist a store

Persistence uses Unstorage. Enable it on an individual store:

```ts
export const usePreferencesStore = defineStore("preferences", {
  state: () => ({ theme: "light" }),
  persist: true,
});
```

Use a custom key when the store identifier should not be used for storage:

```ts
export const usePreferencesStore = defineStore("preferences", {
  state: () => ({ theme: "light" }),
  persist: {
    key: "user-preferences",
  },
});
```

Hydration is asynchronous. Await `$persistReady` before reading restored state in code that must wait for persistence:

```ts
const preferences = usePreferencesStore();

await preferences.$persistReady;
await preferences.$persist();
await preferences.$hydrate();
```

## Configure persistence globally

Enable persistence for every store and choose between local and session storage from `runable.config.ts`:

```ts
export default defineConfig({
  modules: ["@runablejs/pinia"],
  pinia: {
    persist: true,
    unstorage: {
      namespace: "my-app:pinia:",
      windowKey: "sessionStorage",
    },
  },
});
```

Set `persist: false` on a store to opt out when global persistence is enabled. You can also provide a custom Unstorage driver through `pinia.unstorage.driver`.

During SSR, each request receives an isolated Pinia instance and an isolated in-memory persistence store. Browser storage is only used on the client.
