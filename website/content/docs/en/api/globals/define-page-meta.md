---
title: definePageMeta
description: Associate a layout, middleware, and Vue Router metadata with a page.
---

```ts
function definePageMeta(meta: RouteMeta): RouteMeta
```

Use this macro in a page's `<script setup>`:

```vue
<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
  transition: "fade",
});
</script>
```

Runable extracts this call statically when generating routes. Pass a serializable object directly; do not build metadata from a runtime-computed value.

Modules can extend `RouteMeta` to type their own properties.
