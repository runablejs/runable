---
title: Configuration
description: Toutes les options de syora.config.ts, expliquées une par une.
---

# Configuration

La configuration de Syora vit dans un fichier `syora.config.ts` (ou `.js`) à la racine de votre projet. Elle exporte un objet créé avec `defineConfig()`.

```ts
// syora.config.ts
import { defineConfig } from "@syora/core";

export default defineConfig({
  // Vos options ici
});
```

---

## Configuration minimale

Syora fonctionne **sans aucune configuration**. Un fichier vide suffit :

```ts
export default defineConfig({});
```

Les valeurs par défaut couvrent la majorité des cas :
- `appDir: "app"`
- `ssr: true`
- Tous les dossiers de scan pointent vers `app/`

---

## Référence complète

### Structure de l'application

#### `appDir`

Répertoire contenant le code source de votre application Vue.

- **Type** : `string`
- **Défaut** : `"app"`
- **Résolu** : chemin absolu depuis la racine du projet

```ts
export default defineConfig({
  appDir: "src/app"  // Par défaut : "app"
});
```

#### `pages`

Répertoire(s) scanné(s) pour le routing filesystem.

- **Type** : `ScanDir`
- **Défaut** : `["app/pages"]`
- **Extensions par défaut** : `vue, js, ts, mjs, mts, cjs`

```ts
export default defineConfig({
  pages: [
    "app/pages",                                    // Shorthand
    { dirs: "src/extra-pages", extensions: ["vue"] }  // Objet complet
  ]
});
```

#### `layouts`

Répertoire(s) scanné(s) pour les layouts.

- **Type** : `ScanDir`
- **Défaut** : `["app/layouts"]`
- **Extensions par défaut** : `vue, js, ts, mjs, mts, cjs`

```ts
export default defineConfig({
  layouts: ["app/layouts"]
});
```

#### `components`

Répertoire(s) scanné(s) pour les composants globaux.

- **Type** : `ScanDir` (avec options spécifiques aux composants)
- **Défaut** : `["app/components"]`
- **Extensions par défaut** : `vue`
- **Options spécifiques** :
  - `prefix` : préfixe tous les noms (`"Ui"` → `<UiButton />`)
  - `pathPrefix` : utilise le chemin comme préfixe (`true` par défaut)
  - `componentName` : fonction personnalisée de nommage

```ts
export default defineConfig({
  components: [
    "app/components",                              // Global : <Button />
    { dirs: "app/ui", prefix: "Ui" },             // Préfixé : <UiButton />
    { dirs: "app/icons", prefix: "Icon" }         // Préfixé : <IconHome />
  ]
});
```

#### `composables`

Répertoire(s) scanné(s) pour les composables auto-importés.

- **Type** : `ScanDir`
- **Défaut** : `["app/composables"]`
- **Extensions par défaut** : `js, ts, mjs, mts, cjs`

```ts
export default defineConfig({
  composables: ["app/composables"]
});
```

#### `globals`

Répertoire(s) scanné(s) pour les fonctions et variables globales auto-importées.

- **Type** : `ScanDir`
- **Défaut** : `["app/globals"]`
- **Extensions par défaut** : `js, ts, mjs, mts, cjs`

```ts
export default defineConfig({
  globals: ["app/globals"]
});
```

#### `plugins`

Répertoire(s) scanné(s) pour les plugins Vue.

- **Type** : `ScanDir`
- **Défaut** : `["app/plugins"]`
- **Extensions par défaut** : `js, ts, mjs, mts`

```ts
export default defineConfig({
  plugins: ["app/plugins"]
});
```

#### `css`

Fichiers CSS globaux à inclure dans l'application. **Pas de dossier par défaut** — vous devez déclarer explicitement les fichiers.

- **Type** : `ScanDir`
- **Défaut** : `[]`
- **Extensions par défaut** : `css, scss, sass, less, styl, pcss, sss, wxss, acss`

```ts
export default defineConfig({
  css: [
    "app/css/main.css",
    "app/css/variables.scss"
  ]
});
```

---

### Format `ScanDir`

Tous les champs de scan (`pages`, `layouts`, `components`, `composables`, `globals`, `plugins`, `css`) acceptent le même format :

| Forme | Description |
|---|---|
| `"app/pages"` | Shorthand — scanne le dossier avec les extensions par défaut |
| `{ dirs: "app/pages" }` | Objet minimal |
| `{ dirs: ["app/pages", "src/pages"] }` | Plusieurs dossiers |
| `{ dirs: "app/pages", extensions: ["vue"] }` | Extensions personnalisées |
| `{ dirs: "app/pages", exclude: ["**/*.test.vue"] }` | Exclusions personnalisées |

Les exclusions par défaut sont toujours appliquées :
- `**/node_modules/**`
- `**/.git/**`
- `**/*.d.*`
- `**/-*.*`

---

### Build & output

#### `output`

Répertoire où Syora prépare les fichiers transformés (routes générées, types, etc.).

- **Type** : `string`
- **Défaut** : `".app"`
- **Alias auto** : `#app` pointe vers ce dossier

```ts
export default defineConfig({
  output: ".app"  // Par défaut
});
```

#### `distDir`

Répertoire de sortie du build de production.

- **Type** : `string`
- **Défaut** : `".output"`

```ts
export default defineConfig({
  distDir: ".output"  // Par défaut
});
```

#### `publicDir`

Répertoire des assets statiques servis tels quels. `false` pour désactiver.

- **Type** : `string \| false`
- **Défaut** : `"public"`

```ts
export default defineConfig({
  publicDir: "public"     // Par défaut
  // publicDir: "static"  // Personnalisé
  // publicDir: false      // Désactivé
});
```

#### `baseUrl`

URL de base de l'application (préfixe des routes et assets).

- **Type** : `string`
- **Défaut** : `undefined`

```ts
export default defineConfig({
  baseUrl: "/app"  // L'app est servie sous /app/
});
```

---

### Alias & Vite

#### `alias`

Alias de résolution de modules, fusionnés avec ceux de Vite.

- **Type** : `Record<string, string>`
- **Défaut** : `{ "#app": <output> }` (injection automatique)

```ts
export default defineConfig({
  alias: {
    "@": "./src",
    "~/": "./app"
  }
});
```

#### `vite`

Options Vite supplémentaires, fusionnées avec la configuration interne de Syora.

- **Type** : `UserConfig` (partiel)
- **Restrictions** : ne peut pas surcharger `ssr`, `appType`, `server`, `root`, `base`, `publicDir`, `syoraConfig`
- **Le champ `server` est partiel** : `middlewareMode` est réservé

```ts
export default defineConfig({
  vite: {
    plugins: [myVitePlugin()],
    resolve: {
      conditions: ["custom"]
    },
    server: {
      port: 4000  // OK — middlewareMode est interdit
    }
  }
});
```

---

### Métadonnées du site

#### `siteUrl`

URL publique du site, utilisée pour générer les liens absolus (SEO, sitemap, etc.).

- **Type** : `string`
- **Défaut** : `undefined`

```ts
export default defineConfig({
  siteUrl: "https://example.com"
});
```

#### `head`

Métadonnées HTML par défaut pour la balise `<head>`. Utilise le système `@unhead/vue`.

- **Type** : `ResolvableHead`
- **Défaut** : `undefined`

```ts
export default defineConfig({
  head: {
    title: "Mon Application",
    titleTemplate: "%s | Mon Site",
    meta: [
      { name: "description", content: "Une app Syora géniale" },
      { name: "viewport", content: "width=device-width, initial-scale=1" }
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" }
    ]
  }
});
```

---

### Comportement runtime

#### `ssr`

Active le Server-Side Rendering.

- **Type** : `boolean`
- **Défaut** : `true`

```ts
export default defineConfig({
  ssr: true   // Par défaut — rendu côté serveur + hydratation
  // ssr: false  // CSR uniquement (Single Page Application)
});
```

#### `devtools`

Active les outils de développement intégrés de Syora.

- **Type** : `boolean`
- **Défaut** : `undefined` (désactivé)

```ts
export default defineConfig({
  devtools: true
});
```

---

### Modules

#### `modules`

Modules Syora à charger. Peut être un nom de package npm ou un chemin relatif.

- **Type** : `string[]`
- **Défaut** : `[]`

```ts
export default defineConfig({
  modules: [
    "@syora/content",           // Package npm
    "./modules/custom-module"   // Chemin local
  ]
});
```

---

## Exemples de configurations

### Minimaliste

```ts
export default defineConfig({});
```

### Application classique

```ts
export default defineConfig({
  appDir: "app",
  ssr: true,
  siteUrl: "https://example.com",
  head: {
    title: "Mon App",
    meta: [{ name: "description", content: "..." }]
  }
});
```

### Monorepo avec plusieurs sources

```ts
export default defineConfig({
  appDir: "packages/web/app",
  pages: [
    "packages/web/app/pages",
    "packages/shared/pages"
  ],
  components: [
    "packages/web/app/components",
    { dirs: "packages/ui/src", prefix: "Ui" }
  ],
  composables: [
    "packages/web/app/composables",
    "packages/shared/composables"
  ],
  alias: {
    "@shared": "./packages/shared"
  }
});
```

### SPA sans SSR

```ts
export default defineConfig({
  ssr: false,
  output: ".app",
  distDir: "dist"
});
```

---

::: tip Types générés
Après avoir modifié `syora.config.ts`, exécutez `syora prepare` pour régénérer les types auto-importés et les options de modules.
:::
