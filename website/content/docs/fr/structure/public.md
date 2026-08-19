---
title: public
description: Servez des fichiers statiques sans les importer dans le code Vue.
---

Placez dans `public/` les fichiers qui doivent conserver leur nom et être servis directement depuis la racine du site.

```text
public/
├── favicon.svg       → /favicon.svg
└── robots.txt        → /robots.txt
```

Référencez-les avec une URL absolue depuis la racine :

```vue
<img src="/logo.svg" alt="Acme" />
```

Pour les images importées par un composant et optimisées par Vite, préférez un dossier source comme `app/assets/` et un import JavaScript.

Vous pouvez déplacer ou désactiver ce dossier :

```ts
export default defineConfig({
  publicDir: "static",
  // publicDir: false,
});
```

Utilisez `false` lorsque votre backend, un proxy ou un CDN sert déjà tous les fichiers statiques.

