---
title: package.json
description: Déclarez les scripts, dépendances et contraintes runtime d'un projet Runable.
---

`package.json` décrit le projet et les commandes utilisées en développement ou en production.

```json
{
  "name": "my-runable-app",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch server.ts",
    "app:prepare": "runable prepare",
    "app:build": "runable build",
    "typecheck": "vue-tsc --noEmit"
  },
  "dependencies": {
    "runable": "latest",
    "express": "latest",
    "vue": "latest",
    "vue-router": "latest"
  },
  "devDependencies": {
    "@runable/cli": "latest",
    "@types/express": "latest",
    "tsx": "latest",
    "typescript": "latest",
    "vue-tsc": "latest"
  }
}
```

Gardez `runable`, Vue et le backend dans `dependencies` : ils sont nécessaires à l'exécution. Les types, le CLI et les outils de contrôle appartiennent généralement à `devDependencies`.

Le champ `"type": "module"` permet d'utiliser les modules ES dans `server.ts` et `runable.config.ts`.

