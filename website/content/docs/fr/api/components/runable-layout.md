---
title: RunableLayout
description: Chargez et appliquez le layout sélectionné dans les métadonnées de la route.
---

`RunableLayout` lit `route.meta.layout`, charge le layout correspondant puis y place son slot par défaut.

```vue
<template>
  <RunableLayout>
    <RunablePage />
  </RunableLayout>
</template>
```

Définissez le layout depuis une page :

```ts
definePageMeta({ layout: "dashboard" });
```

La valeur accepte trois formes :

| Valeur | Effet |
| --- | --- |
| absente | Charge `default.vue` |
| `"dashboard"` | Charge `app/layouts/dashboard.vue` |
| `{ name, props }` | Charge le layout et lui transmet des props |
| `false` | Rend directement le contenu sans layout |

