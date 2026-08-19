---
title: app/globals
description: Make functions and variables automatically available in application code.
---

Exports from `app/globals/` can be used without manual imports in the Vue application.

```ts
// app/globals/formatPrice.ts
export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}
```

```vue
<template>
  <span>{{ formatPrice(29.9) }}</span>
</template>
```

Unlike a composable, a global does not need reactive state or the Vue lifecycle. Prefer pure, easily tested functions.

Syora scans JavaScript and TypeScript files, generates `.app/globals.d.ts`, then transforms free references into imports. Avoid overly generic names that could conflict with local variables or browser APIs.
