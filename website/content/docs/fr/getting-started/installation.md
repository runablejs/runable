---
title: Installation
description: Installez Runable dans un projet backend existant et préparez une application Vue minimale avec Express.
---

Ajoutez Runable à votre backend, créez le dossier Vue puis reliez les requêtes HTTP au moteur de rendu.

## Prérequis

Utilisez une version de Node.js compatible avec `runable` :

| Outil | Version |
| --- | --- |
| Node.js | `22.18.0` ou plus récent, ou `24.12.0` et versions suivantes |
| Vue | `3.5` ou plus récent |

L'exemple de cette page utilise Express et TypeScript. Le même principe s'applique aux autres backends.

## Installer les dépendances

::u-code-group

```bash [pnpm]
pnpm add runable vue vue-router express
pnpm add -D @runable/cli tsx typescript @types/node @types/express
```

```bash [npm]
npm install runable vue vue-router express
npm install --save-dev @runable/cli tsx typescript @types/node @types/express
```

```bash [yarn]
yarn add runable vue vue-router express
yarn add --dev @runable/cli tsx typescript @types/node @types/express
```

```bash [Bun]
bun add runable vue vue-router express
bun add --dev @runable/cli tsx typescript @types/node @types/express
```

::

## Ajouter les scripts

Configurez le développement, la préparation des types et le build de production :

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch server.ts",
    "app:prepare": "runable prepare",
    "app:build": "runable build"
  }
}
```

`runable prepare` génère les fichiers nécessaires au développement. `runable build` produit le build de l'application.

## Créer la configuration

Ajoutez `runable.config.ts` à la racine du projet :

```ts
// runable.config.ts
import { defineConfig } from "runable";

export default defineConfig({
  ssr: true,
});
```

Avec cette configuration minimale, Runable utilise les conventions suivantes :

| Élément | Emplacement par défaut |
| --- | --- |
| Sources Vue | `app/` |
| Pages | `app/pages/` |
| Assets statiques | `public/` |
| Fichiers générés | `.app/` |
| Build de production | `.output/` |

## Créer la première page

```vue
<!-- app/pages/index.vue -->
<template>
  <main>
    <h1>Bonjour Runable</h1>
    <p>Cette page est générée depuis app/pages/index.vue.</p>
  </main>
</template>
```

Vous n'avez pas besoin de déclarer la route `/`. Runable la crée à partir de `index.vue`.

## Relier Express à Runable

```ts
// server.ts
import Express from "express";
import { express } from "runable/adapters/express";

const server = Express();

server.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// L'adaptateur initialise Runable une fois et sert le frontend.
server.use(express());

server.listen(3000, () => {
  console.log("http://localhost:3000");
});
```

Placez l'adaptateur Runable après vos routes API. Une requête `/api/health` reste ainsi traitée par Express, tandis que `/` est rendue par Vue.

L'adaptateur appelle `createRunableApp()` une seule fois. En développement, il laisse Vite répondre aux modules et aux assets avant de lancer le rendu de la page.

## Installer uniquement votre backend

Les frameworks supportés ne sont pas des dépendances runtime de `runable`. Installez celui utilisé par votre application :

| Adaptateur | Dépendance du projet consommateur |
| --- | --- |
| `express()` | `express` |
| `fastify()` | `fastify` |
| `hono()` | `hono` |
| `koa()` | `koa` |
| `nestjs()` | `@nestjs/common`, `@nestjs/core` et la plateforme Express |
| `adonis()` | `@adonisjs/core` |
| `bun()` | Aucune dépendance npm supplémentaire |
| `deno()` | Aucune dépendance npm supplémentaire |

## Démarrer le projet

```bash
pnpm app:prepare
pnpm dev
```

Ouvrez `http://localhost:3000`. La page doit afficher « Bonjour Runable ».

::u-tip
---
variant: warning
title: CLI en phase alpha
---

La commande interactive `create-runable` existe, mais ses starters évoluent encore. L'installation manuelle ci-dessus permet de voir chaque fichier ajouté à votre backend.

::

::u-tip
---
variant: success
title: Installation terminée
---

Construisez maintenant une petite application avec <a href="/docs/getting-started/quickstart.md">Quick Start</a>.

::
