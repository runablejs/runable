---
title: syora.config.ts
description: Configurez les conventions, le SSR, les modules et Vite depuis le fichier central du projet.
---

Ce fichier est la source de vérité de Syora. Placez-le à la racine et exportez le résultat de `defineConfig()`.

```ts
// syora.config.ts
import { defineConfig } from "@syora/core";

export default defineConfig({
  ssr: true,
  head: {
    title: "Mon application",
  },
  css: ["./app/css/main.css"],
  modules: [],
});
```

Les chemins relatifs sont résolus depuis le dossier de la configuration. Les conventions principales utilisent ces valeurs par défaut :

| Option | Valeur |
| --- | --- |
| `appDir` | `app` |
| `output` | `.app` |
| `distdir` | `.output` |
| `publicDir` | `public` |
| `ssr` | `true` |

Les options `pages`, `layouts`, `components`, `composables`, `globals`, `plugins` et `middlewares` remplacent leur source conventionnelle lorsqu'elles sont définies.

Utilisez la propriété `vite` pour ajouter un plugin ou une option Vite autorisée :

```ts
export default defineConfig({
  vite: {
    server: { port: 5173 },
  },
});
```

Consultez la page <a href="../getting-started/configuration.md">Configuration</a> pour le détail des options.

