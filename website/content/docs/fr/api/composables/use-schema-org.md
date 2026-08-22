---
title: useSchemaOrg
description: Ajoutez des données structurées Schema.org au document avec Unhead.
---

`useSchemaOrg()` enregistre des nœuds Schema.org et produit leur représentation JSON-LD dans le head.

```ts
useSchemaOrg([
  defineWebSite({
    name: "Runable",
    url: "https://example.com",
  }),
  defineWebPage({
    name: "Documentation",
  }),
]);
```

Runable installe l'intégration Schema.org avec le `siteUrl` de la configuration comme hôte :

```ts
export default defineConfig({
  siteUrl: "https://example.com",
});
```

Les helpers `defineWebSite`, `defineWebPage`, `defineArticle`, `defineProduct` et les autres constructeurs du package sont également auto-importés, mais `useSchemaOrg()` reste le point d'entrée pour enregistrer les nœuds.

