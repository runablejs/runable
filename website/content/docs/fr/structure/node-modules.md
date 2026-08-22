---
title: node_modules
description: Gérez les dépendances installées par le gestionnaire de paquets.
---

Le gestionnaire de paquets crée `node_modules/` à partir de `package.json` et du fichier de verrouillage. Runable, Vue, Vite et le backend utilisé y sont installés.

Ne modifiez jamais un fichier dans ce dossier. Ajoutez ou mettez à jour la dépendance concernée, puis réinstallez :

```bash
pnpm install
```

Les frameworks pris en charge par les adaptateurs Runable sont des dépendances du projet consommateur. Par exemple, une application qui appelle `express()` installe `express`, tandis qu'une application Hono installe `hono`.

Ajoutez toujours `node_modules/` à `.gitignore`. Versionnez plutôt `package.json` et le lockfile afin d'obtenir des installations reproductibles.

