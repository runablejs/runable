---
title: tsconfig.json
description: Reliez les configurations TypeScript du frontend et du serveur.
---

La configuration racine coordonne les environnements frontend et serveur sans mélanger leurs types.

```json
{
  "files": [],
  "references": [
    { "path": "./.app/tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

`.app/tsconfig.app.json` est généré par `syora prepare`. Il contient déjà les sources de `app/`, les déclarations Syora, les alias et les options adaptées à Vue. Vous n'avez donc pas besoin d'un `tsconfig.app.json` à la racine tant que vous ne souhaitez pas ajouter de réglage propre au projet.

Cette séparation évite d'exposer les types Node dans un composant Vue ou de supposer que `window` existe dans le serveur.

Lancez le contrôle avec :

```bash
pnpm vue-tsc --build
```

Exécutez `syora prepare` avant ce contrôle, notamment après une nouvelle installation ou après la suppression de `.app/`.

Si vous créez un `tsconfig.app.json` à la racine pour personnaliser TypeScript, faites pointer la référence vers ce fichier. Celui-ci doit étendre la configuration générée plutôt que la recopier.
