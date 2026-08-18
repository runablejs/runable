---
title: ClientOnly
description: Rendez un contenu dépendant du navigateur uniquement après le montage Vue.
---

`ClientOnly` empêche le rendu serveur de son slot par défaut. Utilisez-le pour une bibliothèque qui accède à `window`, au DOM ou à une API exclusivement disponible dans le navigateur.

```vue
<ClientOnly fallback="Chargement…" fallback-tag="span">
  <BrowserChart />
</ClientOnly>
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `fallback` | `string` | Texte affiché avant le montage |
| `fallbackTag` | `string` | Balise du fallback, `span` par défaut |
| `placeholder` | `string` | Alias de `fallback` |
| `placeholderTag` | `string` | Alias de `fallbackTag` |

Le slot `fallback` ou `placeholder` remplace le texte :

```vue
<ClientOnly>
  <Map />

  <template #fallback>
    <p>Préparation de la carte…</p>
  </template>
</ClientOnly>
```

