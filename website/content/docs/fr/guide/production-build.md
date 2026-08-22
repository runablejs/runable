---
title: Build de production
description: Générez les bundles client et serveur puis lancez Runable sans serveur Vite.
---

Le build de production génère le client et, lorsque le SSR est actif, un bundle serveur. Runable utilise ensuite ces fichiers sans démarrer le serveur de développement Vite.

## Créer le script de build

```ts
// scripts/build.ts
import { buildProduction, loadConfig } from "runable";

await loadConfig();
await buildProduction();
```

Ajoutez les commandes du projet :

```json
{
  "scripts": {
    "build": "tsx scripts/build.ts",
    "start": "NODE_ENV=production tsx server.ts"
  }
}
```

Installez `tsx` en dépendance de développement si votre serveur et votre script restent en TypeScript.

## Comprendre la sortie

Avec le `distdir` par défaut, Runable écrit dans `.output/` :

```text
.output/
├── client/
│   ├── index.html
│   └── assets/
├── server/          # présent lorsque ssr: true
└── manifest.js
```

`manifest.js` relie le serveur Runable au template client et au point d'entrée SSR compilé.

## Lancer le serveur existant

Votre fichier `server.ts` ne change pas :

```ts
import Express from "express";
import { express } from "runable/adapters/express";

const server = Express();

server.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

server.use(express());
server.listen(Number(process.env.PORT ?? 3000));
```

Avec `NODE_ENV=production`, l'adaptateur charge la configuration mais ne crée pas de serveur Vite. Il rend l'application depuis `.output`.

## Préparer le déploiement

Copiez dans l'environnement de production :

- `.output/` ;
- le serveur et ses dépendances d'exécution ;
- `runable.config.ts` ou sa version compilée ;
- les variables d'environnement nécessaires.

Testez toujours la commande de démarrage avec `NODE_ENV=production` avant le déploiement.

::u-tip
---
variant: warning
title: Le build doit précéder le démarrage
---

Le serveur de production attend `.output/manifest.js`. Si ce fichier manque, lancez le build ou vérifiez la valeur de `distdir`.

::
