---
title: error.vue
description: Affichez une interface cohérente lorsqu'une erreur atteint l'application Vue.
---

Créez `app/error.vue` pour personnaliser l'écran d'erreur de l'application.

```vue
<!-- app/error.vue -->
<script setup lang="ts">
const { error, clearError } = useAppError();
</script>

<template>
  <main>
    <h1>Une erreur est survenue</h1>
    <p>{{ error?.message }}</p>
    <button type="button" @click="clearError()">Réessayer</button>
  </main>
</template>
```

Syora capture les erreurs Vue transmises au gestionnaire applicatif et expose leur état avec `useAppError()`. Le composant d'erreur doit rester robuste : évitez d'y réutiliser la logique susceptible d'avoir causé l'échec.

::u-tip
---
variant: info
title: Les erreurs HTTP restent côté backend
---

`error.vue` concerne l'interface Vue. Une erreur produite par une route API doit toujours être transformée en réponse HTTP par Express, Fastify, Hono ou votre autre backend.

::

