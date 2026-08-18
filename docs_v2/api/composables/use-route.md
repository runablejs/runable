---
title: useRoute
description: Consultez la route Vue Router actuellement résolue.
---

`useRoute()` retourne la route réactive courante avec la signature de Vue Router.

```ts
const route = useRoute();

const projectId = computed(() => String(route.params.id));
```

Le résultat expose notamment `path`, `name`, `params`, `query`, `hash`, `meta` et `matched`. Ne déstructurez pas une propriété si vous devez conserver sa réactivité ; utilisez une propriété calculée ou `toRefs()`.

