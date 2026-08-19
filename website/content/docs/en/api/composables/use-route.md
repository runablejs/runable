---
title: useRoute
description: Read the currently resolved Vue Router route.
---

`useRoute()` returns the current reactive route with the Vue Router signature.

```ts
const route = useRoute();

const projectId = computed(() => String(route.params.id));
```

The result includes `path`, `name`, `params`, `query`, `hash`, `meta`, and `matched`. Do not destructure a property if it must remain reactive; use a computed property or `toRefs()`.
