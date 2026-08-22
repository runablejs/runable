---
title: Configuration
description: Configurez les dossiers, le SSR, les métadonnées, les alias, les modules et les options Vite de votre application.
---

Le fichier `runable.config.ts` définit la structure de l'application, son rendu et les extensions chargées au démarrage.

## Configuration minimale

Placez ce fichier à la racine du projet :

```ts
// runable.config.ts
import { defineConfig } from "runable";

export default defineConfig({});
```

`defineConfig()` conserve l'objet tel quel tout en fournissant le typage et l'autocomplétion TypeScript.

## Valeurs par défaut

Sans option supplémentaire, Runable utilise cette structure :

| Option | Valeur par défaut | Rôle |
| --- | --- | --- |
| `appDir` | `app` | Racine des sources Vue |
| `output` | `.app` | Fichiers générés pour le développement et le typage |
| `distdir` | `.output` | Build de production |
| `publicDir` | `public` | Assets servis tels quels |
| `ssr` | `true` | Active le rendu serveur |
| `pages` | `app/pages` | Fichiers de pages |
| `layouts` | `app/layouts` | Layouts disponibles |
| `components` | `app/components` | Composants auto-enregistrés |
| `composables` | `app/composables` | Composables auto-importés |
| `globals` | `app/globals` | Fonctions globales auto-importées |
| `middlewares` | `app/middlewares` | Middlewares de navigation |
| `plugins` | `app/plugins` | Plugins applicatifs |
| `css` | `[]` | Feuilles de style globales |
| `modules` | `[]` | Modules Runable chargés |

Les chemins relatifs sont résolus depuis le dossier qui contient la configuration.

## Définir les dossiers principaux

```ts
// runable.config.ts
import { defineConfig } from "runable";

export default defineConfig({
  appDir: "frontend",
  output: ".runable",
  distdir: "dist",
  publicDir: "static",
});
```

Utilisez `publicDir: false` si votre backend ou un CDN gère tous les assets statiques.

## Activer ou désactiver le SSR

```ts
// runable.config.ts
export default defineConfig({
  ssr: false,
});
```

Avec `ssr: false`, Runable renvoie le document HTML sans rendre l'arbre Vue sur le serveur. Le client crée ensuite l'application dans le navigateur.

| Mode | Choisissez-le pour |
| --- | --- |
| `ssr: true` | SEO, premier affichage rendu et données préchargées |
| `ssr: false` | SPA interne ou interface qui dépend entièrement du navigateur |

## Configurer les métadonnées HTML

```ts
// runable.config.ts
export default defineConfig({
  siteUrl: "https://example.com",
  head: {
    title: "Mon application",
    meta: [
      {
        name: "description",
        content: "Une application Vue rendue avec Runable.",
      },
    ],
    link: [{ rel: "icon", href: "/favicon.svg" }],
  },
});
```

`siteUrl` fournit l'origine utilisée pour produire certaines URLs absolues. `head` est transmis à Unhead lors de la création de l'application.

## Ajouter des styles globaux

```ts
// runable.config.ts
export default defineConfig({
  css: ["./app/css/reset.css", "./app/css/main.css"],
});
```

Le tableau `css` accepte les fichiers que Vite sait traiter. Installez le préprocesseur correspondant si vous utilisez Sass, Less ou Stylus.

## Définir des alias

```ts
// runable.config.ts
import { join } from "node:path";

export default defineConfig({
  alias: {
    "@": join(import.meta.dirname, "app"),
    "@shared": join(import.meta.dirname, "shared"),
  },
});
```

Runable ajoute aussi l'alias interne `#build`, qui pointe vers le dossier généré défini par `output`.

## Étendre les dossiers analysés

Vous pouvez remplacer les emplacements conventionnels par vos propres chemins :

```ts
// runable.config.ts
export default defineConfig({
  pages: ["./frontend/views"],
  layouts: ["./frontend/shells"],
  composables: ["./frontend/composables", "./shared/composables"],
  globals: ["./frontend/globals"],
  middlewares: ["./frontend/middlewares"],
  plugins: ["./frontend/plugins"],
});
```

::u-tip
---
variant: info
title: Remplacement des valeurs par défaut
---

Lorsque vous fournissez une option de dossier, considérez-la comme la nouvelle source à analyser. Ajoutez explicitement le dossier conventionnel si vous voulez le conserver dans la liste.

::

## Configurer les composants

Une entrée objet permet de contrôler le nom généré :

```ts
// runable.config.ts
export default defineConfig({
  components: [
    "./app/components",
    {
      dirs: "./app/components/ui",
      prefix: "Ui",
      pathPrefix: false,
    },
  ],
});
```

Un composant `app/components/ui/Button.vue` peut ainsi être exposé sous un nom préfixé, selon les options du dossier.

## Charger des modules

```ts
// runable.config.ts
export default defineConfig({
  modules: ["@acme/runable-auth", "./modules/content"],

  auth: {
    redirectTo: "/login",
  },
});
```

Un module peut ajouter ses propres pages, composants, layouts, plugins ou options Vite. Les options spécifiques sont placées sous la clé déclarée par le module.

## Étendre Vite

```ts
// runable.config.ts
import inspect from "vite-plugin-inspect";

export default defineConfig({
  vite: {
    plugins: [inspect()],
    define: {
      __BUILD_TARGET__: JSON.stringify("web"),
    },
  },
});
```

Runable fusionne cette configuration avec sa configuration Vite interne. Certains champs qui définissent son fonctionnement, comme `root`, `appType`, `ssr` et `server.middlewareMode`, restent sous le contrôle du framework.

## Exemple complet

```ts
// runable.config.ts
import { join } from "node:path";
import { defineConfig } from "runable";

export default defineConfig({
  appDir: "app",
  output: ".app",
  distdir: ".output",
  publicDir: "public",

  ssr: true,
  siteUrl: "https://example.com",

  head: {
    title: "Mon application",
    meta: [{ name: "description", content: "Mon application Runable" }],
  },

  css: ["./app/css/main.css"],
  modules: [],

  alias: {
    "@": join(import.meta.dirname, "app"),
  },
});
```

::u-tip
---
variant: info
title: Prochaine étape
---

Comprenez comment ces options deviennent une application dans <a href="/docs/getting-started/concepts.md">Concepts</a>.

::
