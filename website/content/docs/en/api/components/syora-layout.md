---
title: SyoraLayout
description: Load and apply the layout selected in the route metadata.
---

`SyoraLayout` reads `route.meta.layout`, loads the matching layout, then renders its default slot inside it.

```vue
<template>
  <SyoraLayout>
    <SyoraPage />
  </SyoraLayout>
</template>
```

Select the layout from a page:

```ts
definePageMeta({ layout: "dashboard" });
```

The value accepts four forms:

| Value | Effect |
| --- | --- |
| omitted | Loads `default.vue` |
| `"dashboard"` | Loads `app/layouts/dashboard.vue` |
| `{ name, props }` | Loads the layout and passes props to it |
| `false` | Renders the content directly without a layout |
