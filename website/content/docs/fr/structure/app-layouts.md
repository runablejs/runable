---
title: app/layouts
description: Partagez une structure d'interface entre plusieurs pages.
---

Un layout enveloppe le contenu d'une page. `default.vue` est utilisé lorsqu'une page ne choisit pas explicitement un autre layout.

```vue
<!-- app/layouts/default.vue -->
<template>
  <div>
    <header>Mon application</header>
    <main><slot /></main>
  </div>
</template>
```

Créez un layout nommé pour une zone spécifique :

```vue
<!-- app/pages/admin.vue -->
<script setup lang="ts">
definePageMeta({ layout: "dashboard" });
</script>

<template>
  <h1>Administration</h1>
</template>
```

Le nom `dashboard` correspond à `app/layouts/dashboard.vue`. Syora génère le registre et les types associés dans `.app/layouts.d.ts`.

Les layouts peuvent utiliser des composables, des composants auto-importés et `RouterLink` comme le reste de l'application.

