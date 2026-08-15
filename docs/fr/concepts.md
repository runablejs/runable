---
title: Core Concepts
description: Les 5 concepts fondamentaux de Syora, expliqués en 5 minutes.
---

# Core Concepts

Syora repose sur **5 idées simples**. Si vous les comprenez, vous maîtrisez 80 % du framework.

## 1. Backend-Agnostic : Votre serveur, votre choix

**Le concept :** Syora est un framework **Vue**, pas un framework **serveur**. Il ne fournit pas de runtime HTTP — il s'attend à ce que **vous** le fournissiez.

### L'analogie

Imaginez un restaurant :

- **Nuxt** est un restaurant tout-inclus : la cuisine (Vue), le service (Nitro), et la salle sont liés. Impossible de remplacer le serveur.
- **Syora** est le chef et la cuisine. Vous amenez votre propre salle (Express, Fastify, NestJS...) et Syora s'installe dedans.

### En pratique

```ts
// Vous choisissez votre backend
import express from "express";
import { createServer, requestNode } from "@syora/core";

const app = express();
const vueApp = await createServer(); // Syora prépare l'app Vue

// Votre backend gère les routes API
app.get("/api/users", (req, res) => {
	res.json([{ id: 1, name: "Alice" }]);
});

// Syora gère les pages Vue
app.use("*all", (req, res) => requestNode({ app: vueApp, req, res }));

app.listen(3000);
```

**Ce que Syora fait :** routing des pages, SSR, hydratation, layouts, auto-imports, bundling.

**Ce que VOTRE backend fait :** API routes, authentification, base de données, middleware serveur, WebSocket, queue jobs...

::: tip Pourquoi c'est puissant
Vous pouvez changer de backend demain sans toucher une ligne de votre application Vue. Syora s'en fiche — tant que c'est un serveur HTTP, il s'y intègre.
:::

---

## 2. Filesystem Routing : Le fichier est la route

**Le concept :** Un fichier dans `app/pages/` = une URL. Zéro configuration de router, zéro tableau de routes.

### La convention

```
app/pages/
├── index.vue              →  /
├── about.vue              →  /about
├── blog/
│   ├── index.vue          →  /blog
│   └── [slug].vue         →  /blog/:slug
├── admin/
│   ├── index.vue          →  /admin
│   └── settings.vue       →  /admin/settings
└── [...catchall].vue      →  /* (catch-all)
```

| Fichier           | Route générée | Paramètres            |
| ----------------- | ------------- | --------------------- |
| `index.vue`       | `/`           | —                     |
| `about.vue`       | `/about`      | —                     |
| `[id].vue`        | `/:id`        | `route.params.id`     |
| `[...slug].vue`   | `/:slug(.*)`  | `route.params.slug[]` |
| `admin/index.vue` | `/admin`      | —                     |

### En pratique

```vue
<!-- app/pages/blog/[slug].vue -->
<script setup>
const route = useRoute();
// route.params.slug contient l'identifiant de l'article
</script>

<template>
	<h1>Article : {{ route.params.slug }}</h1>
</template>
```

Syora scanne `app/pages/` au démarrage et génère automatiquement les routes `vue-router`. Vous n'écrivez jamais de `router.ts`.

::: tip Métadonnées de page
Définissez les métadonnées directement dans le SFC :

```vue
<script setup>
definePageMeta({
	layout: "blog",
	middleware: "auth",
});
</script>
```

:::

---

## 3. Auto-imports : Écrire moins, faire plus

**Le concept :** Les fonctions, composables, composants et variables globales sont **automatiquement disponibles** sans `import` explicite.

### Sans auto-imports (Vue pur)

```vue
<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import MyButton from "@/components/MyButton.vue";

const route = useRoute();
const count = ref(0);
</script>
```

### Avec Syora

```vue
<script setup>
// Rien à importer — tout est déjà là
const route = useRoute();
const count = ref(0);
const { user } = useUserStore(); // Composable auto-importé
</script>

<template>
	<MyButton>Cliquez-moi</MyButton>
	<!-- Composant auto-importé -->
</template>
```

### Ce qui est auto-importé

| Catégorie       | Dossier par défaut | Exemples                                          |
| --------------- | ------------------ | ------------------------------------------------- |
| **Composables** | `app/composables/` | `useUser()`, `useAuth()`, `useFetch()`            |
| **Composants**  | `app/components/`  | `<MyButton />`, `<AppHeader />`                   |
| **Globals**     | `app/globals/`     | Fonctions utilitaires partagées                   |
| **Plugins**     | `app/plugins/`     | `defineVuePlugin()` exécutés au boot              |
| **API Vue**     | —                  | `ref`, `computed`, `watch`, `onMounted`...        |
| **API Syora**   | —                  | `useRoute`, `useRouter`, `useAsyncData`, `useApp` |

### Composants globaux

Par défaut, **tout ce qui se trouve dans `app/components/` est enregistré comme composant global** — disponible dans toute l'application sans `import`.

Vous pouvez personnaliser ce comportement via `syora.config.ts` :

```ts
export default defineConfig({
	components: [
		"app/components", // Global par défaut
		{ dirs: "app/ui", prefix: "Ui" }, // Préfixé : <UiButton />
	],
});
```

| Option       | Description                                               |
| ------------ | --------------------------------------------------------- |
| `prefix`     | Préfixe tous les noms de composants du dossier (ex: `Ui`) |
| `pathPrefix` | Utilise le chemin comme préfixe (désactivable)            |
| `extensions` | Extensions scannées (défaut: `['vue']`)                   |

---

## 4. Async Data & SSR : La donnée voyage avec la page

**Le concept :** `useAsyncData` récupère des données **côté serveur** lors du premier rendu, les **sérialise** dans le HTML, et les **réhydrate** côté client. Zéro flash de contenu, zéro double requête.

### Le problème sans SSR

1. Le navigateur reçoit une page vide
2. Le JS s'exécute
3. Le composable fait un `fetch`
4. L'utilisateur voit un spinner
5. Les données arrivent enfin

### La solution Syora

```vue
<script setup>
const {
	data: posts,
	pending,
	error,
	refresh,
} = await useAsyncData(
	"posts", // Clé unique (cache + déduplication)
	() => $fetch("/api/posts"), // Le fetcher
);
</script>

<template>
	<div v-if="pending">Chargement...</div>
	<div v-else-if="error">Erreur : {{ error.message }}</div>
	<ul v-else>
		<li v-for="post in posts" :key="post.id">{{ post.title }}</li>
	</ul>
	<button @click="refresh">Rafraîchir</button>
</template>
```

### Le cycle de vie d'une requête

| Étape | Serveur                                                    | Client                                                           |
| ----- | ---------------------------------------------------------- | ---------------------------------------------------------------- |
| 1     | `useAsyncData` exécute le fetcher                          | —                                                                |
| 2     | Les données sont rendues dans le HTML                      | —                                                                |
| 3     | Les données sont **sérialisées** dans un script `<script>` | —                                                                |
| 4     | —                                                          | Le HTML arrive avec les données **déjà dedans**                  |
| 5     | —                                                          | Vue **réhydrate** les données depuis le script — pas de re-fetch |

**Résultat** : l'utilisateur voit le contenu immédiatement, sans attente. Le client ne refait pas la requête.

::: tip Cache intelligente
`useAsyncData` déduplique les requêtes : si deux composants appellent `useAsyncData('posts', ...)`, une seule requête HTTP part. La seconde récupère la promesse en cours.
:::

::: tip `useFetch` est aussi disponible
Syora expose `useFetch` avec la même API que Nuxt (basé sur `ofetch`). La seule différence : l'absence de typage automatique des routes backend, car Syora ne connaît pas votre serveur.
:::

---

## 5. Modules & Plugins : L'extensibilité typée

**Le concept :** Syora se décompose en **plugins** (extensions de runtime Vue) et **modules** (packages réutilisables qui étendent la configuration). Les deux sont typés et déclaratifs.

### Plugins Vue (`defineVuePlugin`)

Un plugin enrichit l'application Vue à l'exécution. Il s'exécute au montage de l'app.

```ts
// app/plugins/auth.ts
export default defineVuePlugin({
	name: "auth",
	setup(app) {
		const auth = createAuthService();
		app.provide("auth", auth);
	},
	hooks: {
		"app:mounted": (app) => {
			console.log("App montée, auth prêt");
		},
	},
});
```

### Modules (`defineModule`)

Un module est un **package réutilisable** qui étend la configuration Syora au build-time.

```ts
// modules/content/syora.config.ts
export default defineModule({
	meta: { name: "content" },
	configKey: "content",

	defaults: {
		sources: ["content/docs"],
	},

	setup(options, config) {
		config.components.push(resolve("./components"));
	},
});
```

### Différence clé

|                 | Plugin                       | Module                                   |
| --------------- | ---------------------------- | ---------------------------------------- |
| **Quand**       | Runtime (app Vue montée)     | Build-time (config résolue)              |
| **Quoi**        | Logique Vue (provide, hooks) | Structure (composants, routes, imports)  |
| **Scope**       | Une app                      | Réutilisable entre projets (npm package) |
| **Défini par**  | `defineVuePlugin()`          | `defineModule()`                         |
| **Dépendances** | `dependsOn` (autres plugins) | `dependOn` + `enforce` (autres modules)  |

---

## Récapitulatif

| #   | Concept                | En une phrase                                                                    |
| --- | ---------------------- | -------------------------------------------------------------------------------- |
| 1   | **Backend-Agnostic**   | Syora s'intègre dans VOTRE serveur, il ne vous en impose pas un.                 |
| 2   | **Filesystem Routing** | Un fichier dans `pages/` = une URL. Zéro config.                                 |
| 3   | **Auto-imports**       | Composables, composants et globals disponibles sans `import`.                    |
| 4   | **Async Data & SSR**   | Les données sont fetchées côté serveur, sérialisées, et réhydratées côté client. |
| 5   | **Modules & Plugins**  | Étendez Syora avec des modules typés (build-time) et des plugins Vue (runtime).  |

**Maîtrisez ces 5 concepts, et vous maîtrisez Syora.**

---

::: tip Prochaine étape
Passez à l'action : [installez Syora et créez votre première page](./getting-started/quickstart.md).
:::
