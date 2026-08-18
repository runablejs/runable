---
title: SyoraPage
description: Affichez le composant associé à la route Vue Router courante.
---

`SyoraPage` est la façade Syora de `RouterView`. Il transmet ses props, attributs et slots au composant Vue Router.

```vue
<template>
  <SyoraPage />
</template>
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `name` | `string` | Nom de la vue à afficher pour une route nommée |
| `route` | `RouteLocationNormalized` | Route à rendre à la place de la route courante |

Le slot par défaut reçoit `Component` et `route` :

```vue
<SyoraPage v-slot="{ Component, route }">
  <Transition :name="String(route.meta.transition ?? 'fade')">
    <component :is="Component" />
  </Transition>
</SyoraPage>
```

