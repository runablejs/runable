---
title: defineVuePlugin
description: Déclarez un plugin Runable avec des injections, dépendances et hooks applicatifs.
---

La forme courte reçoit directement une fonction de setup :

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

La forme objet contrôle l'ordre et les dépendances :

```ts
export default defineVuePlugin({
  name: "analytics",
  enforce: "post",
  dependsOn: ["auth"],
  setup(app) {
    app.provide("analytics", createAnalytics());
  },
  hooks: {
    "app:mounted"(app) {
      console.log("Application montée", app);
    },
  },
});
```

`enforce` accepte `pre` ou `post`. Les valeurs retournées dans `provide` sont injectées dans Vue et ajoutées aux propriétés globales avec un préfixe `$`.

