---
title: injectHead
description: Accédez directement à l'instance Unhead installée dans l'application.
---

`injectHead()` retourne l'instance Unhead injectée par Runable. Utilisez cette API pour une intégration avancée qui doit manipuler directement le gestionnaire de head.

```ts
const head = injectHead();
```

Pour définir les métadonnées d'une page ou d'un composant, préférez `useHead()`, `useSeoMeta()` ou `useHeadSafe()`. Ces composables gèrent automatiquement leur cycle de vie Vue.

