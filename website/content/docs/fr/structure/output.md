---
title: .output
description: Comprenez le contenu du build de production généré par Syora.
---

La commande `syora build` écrit le build de production dans `.output/` par défaut.

```text
.output/
├── client/
│   ├── assets/          # JavaScript, CSS et assets avec hash
│   └── index.html
├── server/              # Bundle SSR, si le SSR est actif
└── manifest.js          # Entrées utilisées par le runtime Syora
```

Avec `ssr: false`, Syora ne produit pas le bundle serveur. Le dossier `client/` suffit à démarrer l'application dans le navigateur.

## Changer l'emplacement

```ts
// syora.config.ts
export default defineConfig({
  distdir: "dist",
});
```

Ajoutez le dossier choisi à `.gitignore`. Il doit être reconstruit par votre pipeline de déploiement, pas versionné.

::u-tip
---
variant: info
title: Ne confondez pas .app et .output
---

`.app/` assiste le développement et le typage. `.output/` contient les fichiers exécutés ou servis en production.

::

