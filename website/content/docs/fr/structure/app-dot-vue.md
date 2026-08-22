---
title: app.vue
description: Personnalisez le composant racine de l'application Vue.
---

`app.vue` est le composant racine commun à toutes les pages. Utilisez-le pour placer une structure qui doit vivre au-dessus des layouts : fournisseur de thème, notifications ou éléments d'accessibilité.

```vue
<!-- app/app.vue -->
<template>
  <RunableLayout>
    <RunablePage />
  </RunableLayout>
</template>
```

Dans la plupart des applications, les structures visuelles propres à une zone appartiennent plutôt à `app/layouts/`. Gardez `app.vue` léger afin que toutes les routes partagent le même comportement.

`RunablePage` affiche la route courante. `RunableLayout` applique le layout défini par `definePageMeta()` autour de son contenu.

Ce fichier est facultatif. Lorsqu'il est absent, Runable utilise cette structure dans son composant racine interne.
