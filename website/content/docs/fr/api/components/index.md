---
title: Components
description: Référence des composants globaux intégrés au runtime Syora.
---

Syora enregistre ses composants internes globalement. Utilisez-les directement dans un template.

| Composant | Rôle |
| --- | --- |
| `SyoraPage` | Afficher la route courante |
| `SyoraLink` | Naviguer avec Vue Router |
| `SyoraLayout` | Appliquer le layout de la page |
| `ClientOnly` | Différer un rendu jusqu'au montage client |

```vue
<template>
  <SyoraLayout>
    <SyoraPage />
  </SyoraLayout>
</template>
```

