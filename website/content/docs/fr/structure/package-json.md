---
title: package.json
description: Déclarez les scripts, dépendances et contraintes runtime d'un projet Syora.
---

`package.json` décrit le projet et les commandes utilisées en développement ou en production.

```json
{
  "name": "my-syora-app",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch server.ts",
    "app:prepare": "syora prepare",
    "app:build": "syora build",
    "typecheck": "vue-tsc --noEmit"
  },
  "dependencies": {
    "@syora/core": "latest",
    "express": "latest",
    "vue": "latest",
    "vue-router": "latest"
  },
  "devDependencies": {
    "@syora/cli": "latest",
    "@types/express": "latest",
    "tsx": "latest",
    "typescript": "latest",
    "vue-tsc": "latest"
  }
}
```

Gardez `@syora/core`, Vue et le backend dans `dependencies` : ils sont nécessaires à l'exécution. Les types, le CLI et les outils de contrôle appartiennent généralement à `devDependencies`.

Le champ `"type": "module"` permet d'utiliser les modules ES dans `server.ts` et `syora.config.ts`.

