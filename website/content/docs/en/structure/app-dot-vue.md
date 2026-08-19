---
title: app.vue
description: Customize the root component of the Vue application.
---

`app.vue` is the root component shared by every page. Use it for structures that must live above layouts, such as a theme provider, notifications, or accessibility elements.

```vue
<!-- app/app.vue -->
<template>
  <SyoraLayout>
    <SyoraPage />
  </SyoraLayout>
</template>
```

In most applications, visual structures specific to an area belong in `app/layouts/`. Keep `app.vue` lightweight so all routes share the same behavior.

`SyoraPage` displays the current route. `SyoraLayout` applies the layout selected with `definePageMeta()` around its content.

This file is optional. When absent, Syora uses this structure in its internal root component.
