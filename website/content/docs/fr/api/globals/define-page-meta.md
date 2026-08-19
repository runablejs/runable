---
title: definePageMeta
description: Associez un layout, des middlewares et des métadonnées Vue Router à une page.
---

```ts
function definePageMeta(meta: RouteMeta): RouteMeta
```

Utilisez cette macro dans le `<script setup>` d'une page :

```vue
<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
  transition: "fade",
});
</script>
```

Syora extrait statiquement cet appel lors de la génération des routes. Passez directement un objet sérialisable ; ne construisez pas les métadonnées à partir d'une valeur calculée au runtime.

Les modules peuvent étendre `RouteMeta` pour typer leurs propres propriétés.

