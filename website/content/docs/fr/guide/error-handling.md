---
title: Gestion des erreurs
description: Capturez les erreurs Vue, Router et navigateur dans une interface cohérente.
---

Runable installe un état d'erreur isolé pour chaque application Vue. Il capture les erreurs de rendu Vue, les erreurs Vue Router, les erreurs globales du navigateur et les promesses rejetées sans gestionnaire.

## Afficher une erreur manuellement

```vue
<script setup lang="ts">
const { showError } = useAppError();

async function save() {
  try {
    await saveProject();
  } catch (error) {
    showError(error, {
      code: "PROJECT_SAVE_FAILED",
      statusCode: 500,
      info: "Impossible d'enregistrer le projet",
    });
  }
}
</script>
```

Quand l'état contient une erreur, `RunableApp` remplace l'interface courante par l'écran d'erreur.

## Personnaliser l'écran

Créez `app/error.vue` :

```vue
<script setup lang="ts">
defineProps<{ error: { code: string; message: string } }>();
defineEmits<{ clear: [] }>();
</script>

<template>
  <main>
    <p>{{ error.code }}</p>
    <h1>{{ error.message }}</h1>
    <button type="button" @click="$emit('clear')">Réessayer</button>
  </main>
</template>
```

L'événement `clear` réinitialise l'erreur et restaure l'application.

## Lire et effacer l'état

```ts
const { error, showError, clearError } = useAppError();

console.log(error.value?.source);
clearError();
```

Une erreur contient notamment `code`, `statusCode`, `message`, `stack`, `source`, `info`, `url` et `timestamp`.

## Erreurs pendant le SSR

Si le rendu serveur échoue, Runable enregistre l'erreur puis effectue un second rendu avec `app/error.vue`. L'exception n'entraîne donc pas automatiquement une page HTML vide.

::u-tip
---
variant: info
title: Les erreurs API restent côté backend
---

Une erreur Express, Fastify ou Hono doit être transformée en réponse HTTP par ce framework. Le système décrit ici concerne l'application Vue.

::
