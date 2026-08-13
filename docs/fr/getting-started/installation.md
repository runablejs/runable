---
title: Installation
description: Intégrez Syora dans votre projet existant, ou démarrez avec un starter.
---

# Installation

## Prérequis

- **Node.js** `^22.18.0` ou `>=24.12.0`
- **pnpm** `>=11.10.0` (recommandé — Syora utilise les workspaces pnpm)

Vérifiez vos versions :

```bash
node -v   # >= 22.18.0
pnpm -v   # >= 11.10.0
```

::: tip Pas encore pnpm ?
```bash
npm install -g pnpm
```
:::

---

## Option A : Intégrer Syora dans un projet existant

**C'est le cas d'usage principal.** Vous avez déjà un backend (Express, Fastify, NestJS, AdonisJS, Hono, Koa...) et vous voulez y ajouter la couche Vue avec la DX Nuxt.

### Étape 1 : Installer Syora

```bash
pnpm add @syora/core
pnpm add -D @syora/cli
```

### Étape 2 : Créer la structure de l'application Vue

Dans votre projet existant, créez le dossier `app/` :

```
votre-projet-backend/
├── src/                    # Votre backend (déjà là)
│   ├── controllers/
│   ├── services/
│   └── ...
├── app/                    # ← Nouveau : votre application Vue
│   ├── pages/
│   ├── layouts/
│   ├── components/
│   ├── composables/
│   ├── plugins/
│   └── css/
├── public/                 # Assets statiques
├── syora.config.ts         # Configuration Syora
├── server.ts               # Votre serveur (déjà là, à modifier)
└── package.json
```

### Étape 3 : Configurer Syora

Créez `syora.config.ts` à la racine :

```ts
// syora.config.ts
export default defineConfig({
  appDir: "app",
  ssr: true,
});
```

### Étape 4 : Connecter Syora à votre serveur

Modifiez votre point d'entrée serveur pour intégrer Syora.

#### Avec Express

```ts
// server.ts
import express from "express";
import { createServer, requestNode } from "@syora/core";

const app = express();

// Vos routes API existantes restent inchangées
app.get("/api/users", (req, res) => {
  res.json([{ id: 1, name: "Alice" }]);
});

// Syora s'ajoute comme middleware catch-all
const vite = await createServer();
if (vite) app.use(vite.middlewares);

app.use("*all", async (req, res) => {
  await requestNode({ vite, req, res });
});

app.listen(5173);
```

#### Avec Fastify

```ts
// server.ts
import Fastify from "fastify";
import middie from "@fastify/middie";
import { createServer, serve } from "@syora/core";

const app = Fastify();

// Vos routes API existantes
app.get("/api/users", async () => {
  return [{ id: 1, name: "Alice" }];
});

// Syora
const vite = await createServer();
await app.register(middie);
if (vite) app.use(vite.middlewares);

app.all("*", async (req, reply) => {
  const html = await serve({ vite, url: req.raw.url ?? req.url });
  reply.type("text/html").send(html);
});

await app.listen({ port: 5173 });
```

#### Avec NestJS

```ts
// main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { createServer, requestNode } from "@syora/core";

const app = await NestFactory.create(AppModule);
const vite = await createServer();

// Vos controllers NestJS gèrent /api/*
// Syora gère le reste
app.use("*", async (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  await requestNode({ vite, req, res });
});

await app.listen(5173);
```

::: tip Vos routes API ne bougent pas
L'intégration Syora est **additive**. Vous n'avez pas à migrer vos routes existantes. Syora ne capture que les requêtes qui ne correspondent pas à vos API.
:::

### Étape 5 : Créer votre première page

```vue
<!-- app/pages/index.vue -->
<script setup>
const message = "Hello depuis Syora";
</script>

<template>
  <div>
    <h1>{{ message }}</h1>
    <p>Syora est intégré à votre projet existant.</p>
  </div>
</template>
```

### Étape 6 : Lancer le serveur

```bash
pnpm dev
```

Votre application est disponible sur `http://localhost:5173`.

---

## Option B : Démarrer avec un starter

Si vous n'avez pas encore de projet backend, Syora fournit des starters pré-configurés pour les frameworks les plus courants.

### Utiliser le scaffolding

```bash
npm create syora@latest
```

L'assistant vous propose :

```
✔ Project name: … my-syora-app
✔ Choose a starter:
  ● Express
  ○ Fastify
  ○ Hono
  ○ Koa
  ○ NestJS
  ○ AdonisJS
```

Le starter génère un projet complet avec :
- La structure `app/` (pages, layouts, composants, composables...)
- Le serveur backend pré-configuré
- `syora.config.ts`
- `package.json` et `tsconfig.json`

```bash
cd my-syora-app
pnpm install
pnpm dev
```

::: tip Quand utiliser un starter ?
- Vous démarrez un nouveau projet
- Vous voulez explorer Syora sans toucher à votre codebase existante
- Vous voulez voir une architecture de référence
:::

---

## Structure de l'application Vue

Que vous intégriez Syora ou utilisiez un starter, le dossier `app/` suit la même convention :

```
app/
├── pages/           # Pages = routes (filesystem routing)
├── layouts/         # Layouts réutilisables
├── components/      # Composants globaux (auto-importés)
├── composables/     # Composables auto-importés
├── plugins/         # Plugins Vue (defineVuePlugin)
└── css/             # Styles globaux
```

| Dossier | Rôle | Auto-scanné |
|---|---|---|
| `pages/` | Routing filesystem | ✅ |
| `layouts/` | Layouts déclaratifs | ✅ |
| `components/` | Composants globaux | ✅ |
| `composables/` | Fonctions réactives réutilisables | ✅ |
| `plugins/` | Logique d'initialisation Vue | ✅ |
| `css/` | Styles globaux | ✅ |

---

## Prochaine étape

Votre projet est prêt. Créons votre première page : [Quick Start](./quickstart.md).