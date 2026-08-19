---
title: app/css
description: Organisez les feuilles de style globales chargées par Syora.
---

Le dossier `app/css/` est une convention d'organisation, mais ses fichiers ne sont pas chargés automatiquement. Déclarez chaque entrée globale dans `syora.config.ts`.

```css
/* app/css/main.css */
:root {
  font-family: system-ui, sans-serif;
}
```

```ts
export default defineConfig({
  css: ["./app/css/main.css"],
});
```

Importez les styles propres à un composant directement depuis son bloc `<style>`. Réservez l'option `css` aux resets, tokens, thèmes et styles réellement globaux.

Vite traite les fichiers déclarés. Pour utiliser Sass, Less ou Stylus, installez le préprocesseur correspondant dans le projet consommateur.

