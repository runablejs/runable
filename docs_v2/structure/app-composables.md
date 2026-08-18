---
title: app/composables
description: Partagez une logique Vue auto-importée entre vos composants et vos pages.
---

Placez ici les fonctions qui composent des états et API Vue. Les exports nommés sont auto-importés dans l'application.

```ts
// app/composables/useCounter.ts
export function useCounter() {
  const count = ref(0);

  return {
    count,
    increment: () => count.value++,
  };
}
```

```vue
<script setup lang="ts">
const { count, increment } = useCounter();
</script>
```

Utilisez `app/composables/` pour les fonctions liées à Vue : état réactif, cycle de vie, injections ou contexte applicatif. Placez les utilitaires TypeScript indépendants de Vue dans un dossier métier explicite.

Pour analyser plusieurs dossiers :

```ts
export default defineConfig({
  composables: ["./app/composables", "./shared/composables"],
});
```

