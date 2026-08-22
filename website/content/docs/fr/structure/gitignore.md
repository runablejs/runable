---
title: .gitignore
description: Ignorez les dépendances, builds, fichiers générés et secrets locaux.
---

Un projet Runable doit au minimum ignorer ses dépendances, ses sorties générées et ses variables locales.

```gitignore
node_modules/
.app/
.output/

.env
.env.*
!.env.example

*.log
.DS_Store
```

Adaptez `.output/` et `.app/` si vous avez changé `distdir` ou `output` dans `runable.config.ts`.

Versionnez les sources, la configuration, `package.json`, le lockfile et `.env.example`. Les dossiers générés doivent pouvoir être recréés avec `pnpm install`, `runable prepare` et `runable build`.

