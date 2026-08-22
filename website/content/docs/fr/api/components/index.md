---
title: Components
description: Référence des composants globaux intégrés au runtime Runable.
---

Runable enregistre ses composants internes globalement. Utilisez-les directement dans un template.

| Composant | Rôle |
| --- | --- |
| `RunablePage` | Afficher la route courante |
| `RunableLink` | Naviguer avec Vue Router |
| `RunableLayout` | Appliquer le layout de la page |
| `ClientOnly` | Différer un rendu jusqu'au montage client |

```vue
<template>
  <RunableLayout>
    <RunablePage />
  </RunableLayout>
</template>
```

