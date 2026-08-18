---
title: Modules
description: Regroupez et distribuez une fonctionnalité Syora configurable.
---

Un module est une configuration Syora réutilisable. Il peut ajouter des composants, composables, layouts, plugins, middlewares, styles et même d'autres modules.

## Créer un module local

```text
modules/analytics/
├── syora.config.ts
└── runtime/
    └── plugin.ts
```

```ts
// modules/analytics/syora.config.ts
import { defineModule } from "@syora/core";

export default defineModule<{ endpoint: string }>({
  meta: { name: "analytics", version: "1.0.0" },
  configKey: "analytics",
  defaults: { endpoint: "/api/events" },
  plugins: ["./runtime/plugin.ts"],

  setup(options) {
    process.env.SYO_ANALYTICS_ENDPOINT ??= options.endpoint;
  },
});
```

Déclarez-le dans le projet :

```ts
// syora.config.ts
export default defineConfig({
  modules: ["./modules/analytics"],
  analytics: {
    endpoint: "https://events.example.com",
  },
});
```

`configKey` indique où lire les options du consommateur. Syora fusionne `defaults` avec ces options avant d'appeler `setup()`.

## Ajouter des collections sans setup

Un module étend directement la configuration Syora :

```ts
export default defineModule({
  meta: { name: "design-system" },
  components: ["./components"],
  css: ["./styles/index.css"],
});
```

Les chemins sont résolus depuis le dossier du module.

## Ordonner plusieurs modules

```ts
export default defineModule({
  meta: { name: "analytics-ui" },
  dependOn: ["analytics"],
  enforce: "post",
  async setup() {},
});
```

Les groupes s'exécutent dans l'ordre `pre`, normal, puis `post`. `dependOn` impose un ordre à l'intérieur d'un groupe ou vers un groupe antérieur. Syora refuse les dépendances inconnues, les cycles et les dépendances vers un groupe exécuté plus tard.

## Publier un module

Compilez le module avant sa publication. Pour un package installé, Syora résout son `syora.config` depuis le dossier `dist` du package. Ajoutez ensuite son nom au tableau `modules` du projet consommateur.

::u-tip
---
variant: warning
title: Le dossier modules n'est pas scanné automatiquement
---

Un module local n'est chargé que s'il apparaît dans `modules` avec un chemin relatif.

::
