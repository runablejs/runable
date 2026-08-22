---
title: tsconfig.node.json
description: Typez le serveur, la configuration Runable et les scripts exécutés par Node.js.
---

Cette configuration couvre `server.ts`, `runable.config.ts` et les autres outils exécutés côté serveur.

```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "target": "ESNext",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "types": ["node"]
  },
  "include": [
    "server.ts",
    "runable.config.ts",
    "scripts/**/*.ts"
  ]
}
```

Installez `@types/node` pour typer `process`, les chemins, le système de fichiers et les autres API Node.js.

Si votre serveur utilise Bun ou Deno, remplacez les types et les options de résolution par ceux recommandés par ce runtime. La configuration de l'application Vue reste indépendante dans `.app/tsconfig.app.json` ou dans le fichier racine facultatif qui l'étend.
