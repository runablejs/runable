---
title: SyoraPage
description: Display the component associated with the current Vue Router route.
---

`SyoraPage` is Syora's facade for `RouterView`. It forwards its props, attributes, and slots to the Vue Router component.

```vue
<template>
  <SyoraPage />
</template>
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `name` | `string` | Name of the view to display for a named route |
| `route` | `RouteLocationNormalized` | Route to render instead of the current route |

The default slot receives `Component` and `route`:

```vue
<SyoraPage v-slot="{ Component, route }">
  <Transition :name="String(route.meta.transition ?? 'fade')">
    <component :is="Component" />
  </Transition>
</SyoraPage>
```
