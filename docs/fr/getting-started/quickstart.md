---
title: Quick Start
description: Votre première page Syora en 60 secondes.
---

# Quick Start

Votre projet est installé. Créons votre première page et comprenons le cycle de vie d'une requête.

## Étape 1 : Votre première page

Créez le fichier `app/pages/index.vue` :

```vue
<!-- app/pages/index.vue -->
<script setup>
const message = "Hello Syora";
</script>

<template>
	<div>
		<h1>{{ message }}</h1>
		<p>Votre première page fonctionne !</p>
	</div>
</template>
```

Rendez-vous sur `http://localhost:5173`. Vous voyez votre page. C'est tout.

::u-tip 
---
title:Pas de routeur à configurer
---

Le fichier `app/pages/index.vue` est automatiquement mappé sur `/`. Syora génère les routes `vue-router` pour vous.

::

## Étape 2 : Une page dynamique

Créez `app/pages/hello/[name].vue` :

```vue
<!-- app/pages/hello/[name].vue -->
<script setup>
const route = useRoute();
</script>

<template>
	<div>
		<h1>Bonjour, {{ route.params.name }} !</h1>
		<NuxtLink to="/">← Retour à l'accueil</NuxtLink>
	</div>
</template>
```

Accédez à `http://localhost:5173/hello/Alice`. Le paramètre `name` est extrait de l'URL automatiquement.

## Étape 3 : Un layout

Créez `app/layouts/default.vue` :

```vue
<!-- app/layouts/default.vue -->
<template>
	<div class="layout">
		<header>
			<nav>
				<NuxtLink to="/">Accueil</NuxtLink>
				<NuxtLink to="/hello/world">Hello</NuxtLink>
			</nav>
		</header>
		<main>
			<slot />
		</main>
		<footer>© 2026 Syora</footer>
	</div>
</template>
```

Toutes les pages utilisent automatiquement le layout `default`. Le `<slot />` est remplacé par le contenu de la page.

::u-tip
---
Changer de layout
---

Dans une page spécifique :

```vue
<script setup>
definePageMeta({ layout: "admin" });
</script>
```
::

## Étape 4 : Récupérer des données

Créons une page qui affiche des données de votre backend.

### Côté backend (votre serveur)

Dans votre `server.ts`, ajoutez une route API :

```ts
// server.ts (Express)
app.get("/api/users", (req, res) => {
	res.json([
		{ id: 1, name: "Alice" },
		{ id: 2, name: "Bob" },
	]);
});
```

### Côté frontend (Syora)

Créez `app/pages/users.vue` :

```vue
<!-- app/pages/users.vue -->
<script setup>
const { data: users, pending } = await useAsyncData("users", () =>
	$fetch("/api/users"),
);
</script>

<template>
	<div>
		<h1>Utilisateurs</h1>
		<div v-if="pending">Chargement...</div>
		<ul v-else>
			<li v-for="user in users" :key="user.id">
				{{ user.name }}
			</li>
		</ul>
	</div>
</template>
```

**Ce qui se passe :**

1. **Serveur** : `useAsyncData` exécute `$fetch("/api/users")` côté serveur
2. **Serveur** : Les données sont rendues dans le HTML
3. **Serveur** : Les données sont sérialisées dans un script `<script>`
4. **Client** : Le navigateur reçoit le HTML complet — pas de spinner
5. **Client** : Vue réhydrate les données depuis le script — aucune requête supplémentaire

## Étape 5 : Un composable auto-importé

Créez `app/composables/useCounter.ts` :

```ts
// app/composables/useCounter.ts
export function useCounter(initial = 0) {
	const count = ref(initial);
	const increment = () => count.value++;
	const decrement = () => count.value--;
	return { count, increment, decrement };
}
```

Utilisez-le dans n'importe quelle page **sans import** :

```vue
<!-- app/pages/counter.vue -->
<script setup>
const { count, increment } = useCounter(10);
</script>

<template>
	<div>
		<p>Compteur : {{ count }}</p>
		<button @click="increment">+1</button>
	</div>
</template>
```

Syora scanne `app/composables/` au démarrage et rend `useCounter` disponible globalement.

## Récapitulatif

En 5 étapes, vous avez :

| Étape | Ce que vous avez appris                        |
| ----- | ---------------------------------------------- |
| 1     | Le routing filesystem — un fichier = une route |
| 2     | Les paramètres dynamiques — `[name].vue`       |
| 3     | Les layouts — `app/layouts/default.vue`        |
| 4     | Le data fetching avec SSR — `useAsyncData`     |
| 5     | Les auto-imports — `app/composables/`          |

## Prochaine étape

Plongez dans les concepts fondamentaux : [Core Concepts](../concepts.md).
