---
title: app/globals
description: Rendez des fonctions et variables disponibles automatiquement dans le code applicatif.
---

Les exports de `app/globals/` peuvent être utilisés sans import manuel dans l'application Vue.

```ts
// app/globals/formatPrice.ts
export function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}
```

```vue
<template>
  <span>{{ formatPrice(29.9) }}</span>
</template>
```

Contrairement à un composable, une globale n'a pas besoin de s'appuyer sur l'état réactif ou le cycle de vie Vue. Préférez des fonctions pures et faciles à tester.

Syora analyse les fichiers JavaScript et TypeScript, génère `.app/globals.d.ts`, puis transforme les références libres en imports. Évitez les noms trop génériques qui pourraient entrer en conflit avec une variable locale ou une API du navigateur.

