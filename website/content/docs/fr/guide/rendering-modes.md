---
title: SSR et CSR
description: Choisissez le mode de rendu de l'application et isolez le code réservé au navigateur.
---

Runable active le rendu côté serveur par défaut. Chaque requête crée une application Vue, résout la route, charge les données attendues et injecte le HTML généré dans la page.

## Choisir le mode

```ts
// runable.config.ts
import { defineConfig } from "runable";

export default defineConfig({
  ssr: true,
});
```

Avec `ssr: false`, Runable sert le template client et Vue construit l'interface dans le navigateur.

| Mode | Choisissez-le pour |
| --- | --- |
| SSR | Contenu indexable, premier affichage prérempli, données chargées avant la réponse |
| CSR | Interface privée, dépendance forte aux API du navigateur, serveur de rendu inutile |

## Écrire du code compatible SSR

Les objets `window`, `document`, `localStorage` et `navigator` n'existent pas sur le serveur. Exécutez leur accès après le montage :

```vue
<script setup lang="ts">
const width = ref<number>();

onMounted(() => {
  width.value = window.innerWidth;
});
</script>
```

## Isoler un composant client

```vue
<ClientOnly fallback="Chargement de la carte…" fallback-tag="p">
  <InteractiveMap />
</ClientOnly>
```

Vous pouvez aussi fournir un slot :

```vue
<ClientOnly>
  <Chart />

  <template #fallback>
    <ChartSkeleton />
  </template>
</ClientOnly>
```

Le fallback est rendu sur le serveur. Le contenu principal apparaît après le montage côté client.

## Comprendre l'hydratation

En SSR, Vue reprend le HTML existant au lieu de le recréer. Le premier rendu client doit donc produire la même structure que le serveur. Utilisez `ClientOnly` lorsqu'une bibliothèque ne peut pas respecter cette contrainte.

::u-tip
---
variant: warning
title: Évitez les valeurs instables au premier rendu
---

Une date locale, un nombre aléatoire ou une mesure du viewport peut différer entre serveur et navigateur. Calculez cette valeur après `onMounted()` ou fournissez une valeur initiale stable.

::
