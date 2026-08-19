---
title: app
description: Organisez les sources de votre application Vue dans le dossier app.
---

Le dossier `app/` contient l'application Vue. Syora analyse ses sous-dossiers conventionnels et génère les registres nécessaires.

```text
app/
├── pages/
├── layouts/
├── components/
├── composables/
├── globals/
├── plugins/
├── middlewares/
├── css/
├── app.vue
└── error.vue
```

Tous ces éléments sont facultatifs. Une application minimale peut contenir uniquement `app/pages/index.vue`.

## Utiliser un autre nom

```ts
// syora.config.ts
export default defineConfig({
  appDir: "frontend",
});
```

Les conventions deviennent alors `frontend/pages`, `frontend/layouts`, etc. Une option plus précise, comme `pages` ou `components`, peut remplacer seulement le dossier concerné.

::u-tip
---
variant: info
title: Rechargement en développement
---

Vite surveille les dossiers de configuration comme les composants, layouts, composables, globals, plugins et middlewares. Vue Router prend directement en charge les changements dans `pages/`.

::

