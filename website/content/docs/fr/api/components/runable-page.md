---
title: RunablePage
description: Affichez le composant associé à la route Vue Router courante.
---

`RunablePage` est la façade Runable de `RouterView`. Il transmet ses props, attributs et slots au composant Vue Router.

```vue
<template>
  <RunablePage />
</template>
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `name` | `string` | Nom de la vue à afficher pour une route nommée |
| `route` | `RouteLocationNormalized` | Route à rendre à la place de la route courante |

Le slot par défaut reçoit `Component` et `route` :

```vue
<RunablePage v-slot="{ Component, route }">
  <Transition :name="String(route.meta.transition ?? 'fade')">
    <component :is="Component" />
  </Transition>
</RunablePage>
```

