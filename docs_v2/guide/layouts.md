---
title: Layouts
description: Partagez une structure d'interface entre plusieurs pages sans dupliquer le template.
---

Un layout enveloppe le contenu d'une page. Utilisez-le pour la navigation principale, une barre latérale ou une structure propre à un espace de l'application.

## Créer le layout par défaut

```vue
<!-- app/layouts/default.vue -->
<template>
  <div class="shell">
    <header>Mon application</header>
    <main><slot /></main>
  </div>
</template>
```

Toutes les pages utilisent `default` lorsqu'elles ne déclarent aucun autre layout.

## Sélectionner un layout

```vue
<!-- app/pages/admin/index.vue -->
<script setup lang="ts">
definePageMeta({ layout: "admin" });
</script>

<template>
  <h1>Administration</h1>
</template>
```

Syora cherche alors `app/layouts/admin.vue`.

## Passer des propriétés

Déclarez un objet pour transmettre des props au layout :

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

## Désactiver le layout

```ts
definePageMeta({ layout: false });
```

Le contenu de la page est alors rendu directement.

::u-tip
---
variant: warning
title: Layout introuvable
---

Si le nom ne correspond à aucun layout chargé, Syora affiche la page sans enveloppe. Vérifiez le nom du fichier et la valeur de `layout`.

::
