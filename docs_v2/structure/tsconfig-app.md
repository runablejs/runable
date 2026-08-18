---
title: .app/tsconfig.app.json
description: Utilisez la configuration TypeScript générée par Syora et étendez-la seulement si le projet en a besoin.
---

Syora génère cette configuration avec `syora prepare`. Elle couvre les composants Vue, les sources de `app/` et les déclarations produites dans `.app/`.

Elle configure notamment le mode strict, la résolution `Bundler`, les bibliothèques du navigateur, Vue JSX, `noEmit`, les alias du projet et `#build/*`.

Exécutez `syora prepare` avant le premier contrôle de types. Cette commande génère les déclarations des routes, composants, layouts, plugins et imports automatiques.

::u-tip
---
variant: warning
title: Ne modifiez pas le fichier généré
---

Syora peut réécrire `.app/tsconfig.app.json`. Toute personnalisation directe sera perdue à la prochaine préparation.

::

## Configuration minimale recommandée

Si les réglages générés vous conviennent, référencez directement le fichier depuis `tsconfig.json` :

```json
{
  "files": [],
  "references": [
    { "path": "./.app/tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

Dans ce cas, ne créez pas de `tsconfig.app.json` à la racine.

## Ajouter des options au projet

Créez un fichier racine seulement si l'application a besoin d'options supplémentaires :

```json
{
  "extends": "./.app/tsconfig.app.json",
  "compilerOptions": {
    "exactOptionalPropertyTypes": true
  }
}
```

Modifiez alors la référence racine :

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

Cette couche reste courte et ne duplique ni les alias ni les fichiers inclus par Syora.
