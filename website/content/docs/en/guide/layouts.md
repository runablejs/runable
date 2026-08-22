---
title: Layouts
description: Share an interface structure across pages without duplicating templates.
---

A layout wraps page content. Use it for primary navigation, a sidebar, or a structure specific to one application area.

## Create the default layout

```vue
<!-- app/layouts/default.vue -->
<template>
  <div class="shell">
    <header>My application</header>
    <main><slot /></main>
  </div>
</template>
```

Every page uses `default` unless it declares another layout.

## Select a layout

```vue
<!-- app/pages/admin/index.vue -->
<script setup lang="ts">
definePageMeta({ layout: "admin" });
</script>

<template>
  <h1>Administration</h1>
</template>
```

Runable then looks for `app/layouts/admin.vue`.

## Pass properties

Declare an object to pass props to the layout:

```vue
<script setup lang="ts">
definePageMeta({
  layout: {
    name: "dashboard",
    props: { compact: true },
  },
});
</script>
```

```vue
<!-- app/layouts/dashboard.vue -->
<script setup lang="ts">
defineProps<{ compact?: boolean }>();
</script>

<template>
  <div :class="{ compact }"><slot /></div>
</template>
```

## Disable the layout

```ts
definePageMeta({ layout: false });
```

The page content is then rendered directly.

::u-tip
---
variant: warning
title: Layout not found
---

If the name matches no loaded layout, Runable displays the page without a wrapper. Check the file name and `layout` value.

::
