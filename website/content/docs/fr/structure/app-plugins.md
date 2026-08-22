---
title: app/plugins
description: Exécutez du code lors de la création de chaque application Vue.
---

Un plugin configure l'application Vue avant le rendu. Utilisez `defineVuePlugin()` pour installer une bibliothèque, fournir une valeur ou enregistrer des hooks.

```ts
// app/plugins/api.ts
export default defineVuePlugin(() => {
  return {
    provide: {
      apiBase: "/api",
    },
  };
});
```

En SSR, une nouvelle application Vue est créée pour chaque rendu. Ne stockez donc pas un état utilisateur dans une variable de module partagée.

Vous pouvez suffixer les fichiers pour limiter leur environnement :

```text
app/plugins/
├── analytics.client.ts
├── database.server.ts
└── api.ts
```

Le serveur de développement surveille ce dossier et régénère le registre lorsqu'un plugin est ajouté, renommé ou supprimé.

