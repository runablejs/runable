---
title: modules
description: Développez des modules Runable locaux avant de les extraire dans un package.
---

Le dossier `modules/` est un emplacement conseillé pour les extensions Runable propres à votre projet. Il n'est pas analysé automatiquement : déclarez chaque module dans la configuration.

```text
modules/
└── analytics/
    └── runable.config.ts
```

```ts
// runable.config.ts
export default defineConfig({
  modules: ["./modules/analytics"],
});
```

Un module peut fournir des composants, composables, globals, layouts et plugins, puis exposer ses propres options typées. Utilisez un module local pour regrouper une fonctionnalité transversale. Extrayez-le dans un package npm lorsqu'il doit être partagé entre plusieurs projets.

Le dossier peut porter un autre nom : seule la valeur du tableau `modules` fait foi.

