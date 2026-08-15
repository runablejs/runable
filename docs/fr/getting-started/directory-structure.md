---
title: Structure des dossiers
description: Comprendre l'arborescence d'un projet Syora.
---

# Structure des dossiers

Un projet Syora se compose de **trois couches** : votre code source, la configuration, et les fichiers générés au build.

```
my-project/
├── app/                    ← Votre application Vue (source)
│   ├── pages/
│   ├── layouts/
│   ├── components/
│   ├── composables/
│   ├── plugins/
│   └── css/
├── public/                 ← Assets statiques (servis tels quels)
├── syora.config.ts         ← Configuration Syora
├── server.ts               ← Point d'entrée de votre serveur
├── package.json
├── tsconfig.json
├── .app/                   ← Généré : fichiers préparés par Syora
├── .output/                ← Généré : build de production
└── node_modules/
```

---

## Dossier `app/` — Votre application Vue

C'est le cœur de votre projet. Syora scanne ce dossier au démarrage pour découvrir automatiquement pages, composants, composables, layouts et plugins.

Le chemin par défaut est `app/`, mais vous pouvez le changer via `appDir` dans `syora.config.ts`.

```ts
// syora.config.ts
export default defineConfig({
  appDir: "src/app"  // Par défaut : "app"
});
```

### `app/pages/` — Le routing filesystem

Chaque fichier `.vue` = une route. Pas de `router.ts` à écrire.

```
app/pages/
├── index.vue              →  /
├── about.vue              →  /about
├── blog/
│   ├── index.vue          →  /blog
│   └── [slug].vue         →  /blog/:slug
└── admin/
    ├── index.vue          →  /admin
    └── settings.vue       →  /admin/settings
```

| Convention | Route générée | Exemple d'URL |
|---|---|---|
| `index.vue` | `/` | `/` |
| `about.vue` | `/about` | `/about` |
| `[id].vue` | `/:id` | `/42` |
| `[...slug].vue` | `/:slug(.*)` | `/a/b/c` |
| `admin/index.vue` | `/admin` | `/admin` |

### `app/layouts/` — Les layouts

Les layouts enveloppent vos pages. Le layout `default.vue` est utilisé automatiquement si aucun autre n'est spécifié.

```
app/layouts/
├── default.vue            ← Layout par défaut
└── admin.vue              ← Layout personnalisé
```

Pour utiliser un layout spécifique dans une page :

```vue
<script setup>
definePageMeta({ layout: "admin" });
</script>
```

### `app/components/` — Composants globaux

**Tous les composants** placés ici sont automatiquement enregistrés comme composants globaux — disponibles dans toute l'application sans `import`.

```
app/components/
├── Button.vue             ← <Button /> disponible partout
├── AppHeader.vue          ← <AppHeader /> disponible partout
└── Card/
    ├── Card.vue           ← <Card /> disponible partout
    └── CardBody.vue       ← <CardBody /> disponible partout
```

Vous pouvez personnaliser les répertoires scannés dans `syora.config.ts` :

```ts
export default defineConfig({
  components: [
    "app/components",                    // Global par défaut
    { dirs: "app/ui", prefix: "Ui" },   // Préfixé : <UiButton />
  ]
});
```

### `app/composables/` — Fonctions réactives auto-importées

Les fonctions exportées ici sont automatiquement disponibles dans toute l'application.

```
app/composables/
├── useAuth.ts             ← useAuth() disponible partout
├── useCounter.ts          ← useCounter() disponible partout
└── formatDate.ts          ← formatDate() disponible partout
```

```ts
// app/composables/useCounter.ts
export function useCounter(initial = 0) {
  const count = ref(initial);
  const increment = () => count.value++;
  return { count, increment };
}
```

Utilisation dans n'importe quelle page — **sans import** :

```vue
<script setup>
const { count, increment } = useCounter(10);
</script>
```

### `app/plugins/` — Plugins Vue

Les fichiers exportant `defineVuePlugin()` sont exécutés au montage de l'application Vue.

```
app/plugins/
├── auth.ts                ← Injection du service d'auth
├── analytics.ts           ← Initialisation des analytics
└── i18n.ts                ← Configuration i18n
```

```ts
// app/plugins/auth.ts
export default defineVuePlugin({
  name: "auth",
  setup(app) {
    app.provide("auth", createAuthService());
  }
});
```

### `app/css/` — Styles globaux

Les fichiers CSS/SCSS/SASS/etc. placés ici sont injectés globalement dans l'application.

```
app/css/
├── main.css               ← Styles globaux
└── variables.scss         ← Variables SCSS
```

---

## Dossier `public/` — Assets statiques

Les fichiers placés ici sont servis tels quels à la racine de votre site. Idéal pour les images, favicons, fonts, robots.txt...

```
public/
├── favicon.ico
├── logo.svg
├── robots.txt
└── images/
    └── hero.png
```

| Fichier dans `public/` | URL accessible |
|---|---|
| `public/logo.svg` | `/logo.svg` |
| `public/images/hero.png` | `/images/hero.png` |

Le chemin par défaut est `public/`, configurable via `publicDir` :

```ts
export default defineConfig({
  publicDir: "static"  // Par défaut : "public"
});
```

---

## Fichiers de configuration

### `syora.config.ts`

Le fichier de configuration principal. Exporte `defineConfig({ ... })`.

```ts
// syora.config.ts
export default defineConfig({
  appDir: "app",
  ssr: true,
  components: ["app/components"],
  composables: ["app/composables"],
  globals: ["app/globals"],
  plugins: ["app/plugins"],
  css: ["app/css/main.css"],
  modules: [],
  baseUrl: "/",
  siteUrl: "https://example.com",
  head: {
    title: "Mon App",
    meta: [{ name: "description", content: "..." }]
  }
});
```

### `server.ts`

Le point d'entrée de votre serveur backend. C'est ici que vous connectez Syora à Express, Fastify, NestJS, etc.

```ts
// server.ts (Express)
import express from "express";
import { createServer, requestNode } from "@syora/core";

const app = express();
const vite = await createServer();

if (vite) app.use(vite.middlewares);
app.use("*all", async (req, res) => {
  await requestNode({ vite, req, res });
});

app.listen(3000);
```

---

## Dossiers générés

Ces dossiers sont créés automatiquement par Syora. **Ne les versionnez pas** (ajoutez-les à `.gitignore`).

### `.app/` — Fichiers préparés

Syora prépare et transforme votre code source dans ce dossier avant de le servir à Vite. Contient les routes générées, les imports auto-résolus, les types générés...

Configurable via `output` :

```ts
export default defineConfig({
  output: ".app"  // Par défaut
});
```

### `.output/` — Build de production

Le résultat du build (`syora build`) : fichiers statiques client + bundle serveur.

```
.output/
├── client/                ← Assets statiques (JS, CSS, images...)
│   ├── _nuxt/
│   └── index.html
└── server/                ← Bundle serveur (si SSR activé)
```

Configurable via `distdir` :

```ts
export default defineConfig({
  distdir: ".output"  // Par défaut
});
```

---

## Récapitulatif

| Chemin | Rôle | Modifiable | Versionner |
|---|---|---|---|
| `app/pages/` | Routes de l'application | ✅ Votre code | ✅ Oui |
| `app/layouts/` | Layouts réutilisables | ✅ Votre code | ✅ Oui |
| `app/components/` | Composants globaux | ✅ Votre code | ✅ Oui |
| `app/composables/` | Fonctions auto-importées | ✅ Votre code | ✅ Oui |
| `app/plugins/` | Plugins Vue | ✅ Votre code | ✅ Oui |
| `app/css/` | Styles globaux | ✅ Votre code | ✅ Oui |
| `public/` | Assets statiques | ✅ Votre code | ✅ Oui |
| `syora.config.ts` | Configuration | ✅ Votre code | ✅ Oui |
| `server.ts` | Serveur backend | ✅ Votre code | ✅ Oui |
| `.app/` | Fichiers préparés par Syora | ❌ Généré | ❌ Non |
| `.output/` | Build de production | ❌ Généré | ❌ Non |

---

::: tip Prochaine étape
Maintenant que vous connaissez la structure, configurons votre projet : [Configuration](./configuration.md).
:::
