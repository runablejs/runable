---
title: Auto-imports
description: Utilisez automatiquement les composants, composables et fonctions globales de l'application.
---

Runable génère les imports nécessaires à partir de trois collections. Vous gardez des fichiers modulaires sans répéter les imports dans chaque composant.

## Composants

Les fichiers de `app/components/` sont disponibles dans les templates :

```text
app/components/base/Button.vue → <BaseButton />
app/components/UserCard.vue    → <UserCard />
```

Le chemin participe au nom par défaut. Un composant peut déclarer son propre nom :

```vue
<script setup lang="ts">
defineOptions({ name: "PrimaryButton" });
</script>
```

Avec l'API Options :

```ts
export default defineComponent({
  name: "PrimaryButton",
});
```

Le nom explicite prend le dessus sur celui du fichier.

## Composables

Chaque export de `app/composables/` peut être utilisé dans les scripts Vue :

```ts
// app/composables/useCurrency.ts
export function useCurrency() {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}
```

```vue
<script setup lang="ts">
const currency = useCurrency();
</script>
```

## Globales

Placez dans `app/globals/` les fonctions qui ne dépendent pas du cycle de vie Vue :

```ts
// app/globals/formatDate.ts
export function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR").format(new Date(value));
}
```

## Ajouter d'autres sources

```ts
export default defineConfig({
  components: ["app/components", { path: "ui", prefix: "Ui" }],
  composables: ["app/composables", "shared/composables"],
  globals: ["app/globals", "shared/utils"],
});
```

Runable génère les déclarations TypeScript dans `.app`. Faites étendre `.app/tsconfig.app.json` par votre configuration TypeScript afin que l'éditeur connaisse ces symboles.

::u-tip
---
variant: warning
title: Gardez les effets de bord dans les plugins
---

Un fichier auto-importé doit surtout exporter des valeurs. Utilisez un plugin lorsqu'un code doit s'exécuter au démarrage de l'application.

::
