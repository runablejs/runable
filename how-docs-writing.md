---
title: Guide de rédaction de la documentation
description: Comment écrire et structurer la documentation Runable — conventions, outils et bonnes pratiques.
---

# Guide de rédaction de la documentation

Ce document est le **point d'entrée obligatoire** pour toute personne (développeur humain ou IA) souhaitant écrire ou modifier une page de la documentation Runable.

Il décrit l'architecture, la stack technique, les composants disponibles et les conventions de style.

---

## Architecture globale : les 5 blocs

La documentation est structurée en **5 blocs thématiques** :

```text
docs/
├── getting-started/       ← Embarquement, vision & concepts
│   ├── why-runable.md
│   ├── installation.md
│   ├── quickstart.md
│   ├── vs-nuxt.md
│   ├── configuration.md
│   └── concepts.md
│
├── structure/               ← Architecture d'un projet Runable
|  ├── app/                    ← Votre application Vue (source)
|  │   ├── pages/              ← Routes automatiques (filesystem routing)
|  │   ├── layouts/            ← Dispositions d'interface réutilisables
|  │   ├── components/         ← Composants Vue auto-importés
|  │   ├── composables/        ← Composables Vue auto-importés
|  │   ├── plugins/            ← Plugins Vue / Runable
|  │   ├── middlewares/        ← Middlewares de navigation
|  │   └── css/                ← Styles globaux et configurations CSS
|  ├── public/                 ← Assets statiques (servis directement à la racine)
|  ├── .env                    ← Variables d'environnement
|  ├── .gitignore              ← Fichiers et dossiers ignorés par Git
|  ├── runable.config.ts         ← Configuration principale de Runable
|  ├── server.ts               ← Point d'entrée de votre serveur (Express, Fastify, Hono...)
|  ├── package.json            ← Dépendances, scripts et métadonnées du projet
|  ├── tsconfig.json           ← Configuration TypeScript principale
|  ├── tsconfig.app.json       ← Facultatif : extensions TypeScript propres au frontend
|  ├── tsconfig.node.json      ← Configuration TypeScript pour le serveur Node.js
|  ├── .app/                   ← Généré : fichiers virtuels et d'aides préparés par Runable
|  ├── .output/                ← Généré : build final de production
|  └── node_modules/
│
├── guide/                   ← Utilisation quotidienne, par parcours
│   ├── index.md
│   ├── routing.md
│   ├── layouts.md
│   ├── middlewares.md
│   ├── error-handling.md
│   ├── data-fetching.md
│   ├── rendering-modes.md
│   ├── head-and-seo.md
│   ├── auto-imports.md
│   ├── plugins.md
│   ├── modules.md
│   ├── runtime-config.md
│   ├── css-and-assets.md
│   └── production-build.md
│
├── integrations/            ← Connexion aux backends
│   ├── index.md
│   ├── express.md
│   ├── fastify.md
│   ├── hono.md
│   ├── koa.md
│   ├── nestjs.md
│   ├── adonisjs.md
│   ├── h3.md
│   ├── bun.md
│   ├── deno.md
│   └── custom.md
│
└── api/                     ← Référence technique
    ├── composables.md
    ├── config.md
    ├── server.md
    ├── modules.md
    ├── plugins.md
    └── cli.md

```

| Bloc | Public cible | Objectif |
| --- | --- | --- |
| **Getting Started** | Nouvel arrivant | Comprendre la philosophie, installer, configurer et lancer le projet |
| **Structure** | Développeur projet | Maîtriser l'organisation des dossiers et fichiers d'un projet Runable |
| **Guide** | Utilisateur quotidien | Maîtriser chaque feature fondamentale de Runable |
| **Integrations** | Développeur backend | Connecter Runable à SON serveur existant ou favori |
| **API** | Développeur avancé | Référence rapide des signatures, typages et configurations |

---

## Stack technique

La documentation utilise **v-content** (moteur de contenu Vue) avec les composants de **shadcn-vue**.

### Composants disponibles

| Composant | Usage | Syntaxe |
| --- | --- | --- |
| `u-tip` | Encadrés info / warning / success | `::u-tip` avec YAML frontmatter |
| `u-code-group` | Groupes de code avec onglets | `::u-code-group` + blocks labellisés |
| `u-icon` | Icônes Tabler | `<u-icon name="tabler:..." class="...">` |
| `div` + classes Tailwind | Listes stylisées, alignements | `<div class="flex flex-wrap items-center gap-2">` |

**Note :** Les composants shadcn-vue standards (boutons, tableaux, cards, etc.) sont également disponibles mais rarement utilisés dans la doc — on privilégie le markdown natif pour la portabilité et la simplicité.

---

## Syntaxe des composants

### 1. `u-tip` — Encadrés contextuels

Utilisé pour les infos, warnings, astuces. **Toujours** avec un YAML frontmatter.

```markdown
::u-tip
---
variant: info        # info | warning | success | destructive
title: Titre optionnel
---

Contenu markdown ici. **Gras**, `code`, <a href="./lien">liens</a> supportés.

::

```

**Règles :**

* `variant` est **obligatoire**.
* `title` est optionnel — si omis, pas de titre d'encadré.
* Le contenu supporte le markdown complet.
* Les liens internes utilisent des chemins relatifs : `<a href="./quickstart.md">`.
* **Ne jamais** imbriquer un `u-tip` dans un autre.

**Exemples par variant :**

```markdown
::u-tip
---
variant: info
title: Pourquoi c'est puissant
---

Vous pouvez changer de backend demain sans toucher une ligne de votre application Vue.

::

```

```markdown
::u-tip
---
variant: warning
title: Vos routes API ne bougent pas
---

L'intégration Runable est **additive**. Vous ne migrez rien.

::

```

```markdown
::u-tip
---
variant: success
title: Installation terminée
---

Votre projet est prêt. Passez à <a href="./quickstart.md">Quick Start</a>.

::

```

### 2. `u-code-group` — Groupes de code avec onglets

Utilisé pour montrer le même exemple dans plusieurs langages ou frameworks backends.

```markdown
::u-code-group

` ` `ts [Express]
import Express from "express";
import { express } from "runable";

const app = Express();
app.use(express());
app.listen(3000);
` ` `

` ` `ts [Fastify]
import Fastify from "fastify";
import { fastify } from "runable";

const app = Fastify();
await app.register(fastify());
await app.listen({ port: 3000 });
` ` `

::

```

*(Note : supprimez les espaces dans les backticks lors de la rédaction)*

**Règles :**

* Le label d'onglet est entre crochets après la langue : ````ts [Express]`
* **Toujours** laisser une ligne vide entre `::u-code-group` et le premier block.
* **Toujours** laisser une ligne vide entre le dernier block et `::`.
* Les labels doivent être respectés strictement : `Express`, `Fastify`, `NestJS`, `Koa`, `AdonisJS`, `Hono`, `Bun`, `Deno`.

### 3. `u-icon` — Icônes inline

Utilisé dans les tableaux et les listes stylisées pour remplacer les emojis ou les caractères bruts (✅/❌).

```html
<u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon>
<u-icon name="tabler:circle-x" class="size-5 text-destructive"></u-icon>
<u-icon name="tabler:circle-1-filled" class="size-5 text-muted-foreground"></u-icon>
<u-icon name="tabler:info-circle" class="size-5 text-info"></u-icon>

```

**Classes de taille disponibles :** `size-4`, `size-5`, `size-6`

**Classes de couleur disponibles :**

* `text-success` — vert (validation, disponible)
* `text-destructive` — rouge (erreur, indisponible)
* `text-muted-foreground` — gris (numérotation, étapes)
* `text-info` — bleu (information)
* `text-warning` — orange (attention)

### 4. Listes stylisées avec Tailwind

Pour les listes avec icônes (checklist, étapes numérotées), utiliser des `div` avec les classes utilitaires plutôt que des listes markdown standard.

**Checklist avec icônes :**

```html
<div class="py-3 space-y-2">
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon>
    <span>Vous avez déjà un <strong>backend en production</strong></span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-check-filled" class="size-5 text-success"></u-icon>
    <span>Vous voulez <strong>un seul projet</strong></span>
  </div>
</div>

```

**Étapes numérotées :**

```html
<div class="py-3 space-y-2">
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-1-filled" class="size-5 text-muted-foreground"></u-icon>
    <span><strong>Copiez</strong> le template <code>app/</code></span>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <u-icon name="tabler:circle-2-filled" class="size-5 text-muted-foreground"></u-icon>
    <span><strong>Générez</strong> <code>runable.config.ts</code></span>
  </div>
</div>

```

**Règles :**

* `py-3` pour l'espacement vertical du conteneur.
* `space-y-2` pour l'espacement entre les items.
* `flex flex-wrap items-center gap-2` pour aligner parfaitement l'icône et le texte.
* `flex-wrap` est **obligatoire** pour prévenir les débordements sur mobile.

---

## Conventions de style

### Langue

* **La documentation est rédigée en français.**
* Les termes techniques restent en anglais : `defineConfig`, `useAsyncData`, `ssr`, `middleware`, `composable`...
* Les noms de fichiers, de fonctions, et de dossiers restent en anglais : `app/pages/index.vue`, `runable.config.ts`.

### Ton

* **Direct et technique :** jamais de langue de bois ou de jargon superflu.
* **Honnête sur les limites :** si une feature n'est pas encore disponible (ex: SSG statique), le dire clairement.
* **Pédagogique par couches :** concept → analogie → code → résultat.
* **Comparaisons objectives :** quand une autre technologie est plus adaptée pour un cas d'usage précis, l'assumer.

### Structure d'une page

Chaque page suit ce squelette logique :

```markdown
---
title: Titre de la page
description: Une phrase de description pour le SEO.
---

# Titre de la page

## Introduction (1-2 phrases)

## Concept (l'idée en une phrase)

### Analogie ou contexte

### Code d'exemple

::u-tip
---
variant: info
title: Astuce ou précision
---

Contenu.

::

## Récapitulatif (tableau ou liste)

::u-tip
---
variant: info
title: Prochaine étape
---

Lien vers la page suivante.

::

```

### Tableaux

Utilisez des tableaux markdown standard pour les comparaisons et récapitulatifs.

```markdown
| Colonne A | Colonne B | Colonne C |
|---|---|---|
| Valeur 1  | Valeur 2  | <u-icon name="tabler:circle-check-filled" class="size-4 text-success"></u-icon> |

```

**Règles :**

* Alignez les pipes `|` pour la lisibilité du fichier brut.
* Utilisez `text-success` / `text-destructive` pour les indicateurs binaires.
* Gardez le contenu des cellules concis (pas de paragraphes longs).

### Liens

* **Liens internes :** utilisez des chemins relatifs avec balises HTML `<a href="./quickstart.md">Quick Start</a>`.
* **Liens externes :** utilisez des URLs absolues `<a href="[https://vuejs.org](https://vuejs.org)" target="_blank">Vue</a>`.
* **Jamais** de liens markdown `[texte](url)` pour les liens internes, afin de garantir la cohérence avec le routing de v-content.

### Code

* **Langage du block :** `ts` pour TypeScript, `vue` pour les SFC, `bash` pour les commandes terminal.
* **Commentaires :** utilisez `// ←` pour indiquer visuellement ce qui est nouveau ou important.
* **Chemins :** indiquez toujours le fichier en commentaire à la première ligne `// server.ts`.

```ts
// server.ts
import express from "express";

// ← Vos routes API existantes restent inchangées
app.get("/api/users", (req, res) => {
  res.json([{ id: 1, name: "Alice" }]);
});

```

---

## Frontmatter obligatoire

Chaque fichier markdown doit s'ouvrir avec ce frontmatter :

```yaml
---
title: Titre de la page
description: Description concise pour le SEO (150 caractères max).
---

```

**Règles :**

* `title` : court, descriptif, sans mentionner "Runable" à moins que ce ne soit indispensable au contexte.
* `description` : une phrase complète, sans syntaxe markdown, 150 caractères max.

---

## Exemple de page complète

Voici une page type qui respecte scrupuleusement toutes les conventions :

```markdown
---
title: Routing
description: Comprendre le filesystem routing de Runable — conventions, paramètres dynamiques et routes catch-all.
---

# Routing

Runable génère automatiquement les routes de votre application à partir des fichiers placés dans `app/pages/`.

## La convention

Un fichier = une route. Zéro configuration.

` ` `text
app/pages/
├── index.vue              →  /
├── about.vue              →  /about
└── blog/
    ├── index.vue          →  /blog
    └── [slug].vue         →  /blog/:slug
` ` `

| Fichier | Route | Paramètres disponibles |
|---|---|---|
| `index.vue` | `/` | — |
| `[id].vue` | `/:id` | `route.params.id` |
| `[...slug].vue` | `/:slug(.*)` | `route.params.slug[]` |

## Paramètres dynamiques

` ` `vue
<!-- app/pages/blog/[slug].vue -->
<script setup>
const route = useRoute();
// route.params.slug contient l'identifiant dynamique
</script>

<template>
  <h1>Article : {{ route.params.slug }}</h1>
</template>
` ` `

::u-tip
---
variant: info
title: Métadonnées de page
---

Définissez les métadonnées de structure directement dans le SFC :

` ` `vue
<script setup>
definePageMeta({
  layout: "blog",
  middleware: "auth"
});
</script>
` ` `

::

## Récapitulatif

| Convention | Route finale | Cas d'usage |
|---|---|---|
| `index.vue` | `/` | Page d'accueil ou racine d'un dossier |
| `[id].vue` | `/:id` | Paramètre unique ciblé |
| `[...slug].vue` | `/:slug(.*)` | Route catch-all (ex: 404 custom) |

::u-tip
---
variant: info
title: Prochaine étape
---

Apprenez à structurer l'interface de vos pages avec : <a href="../structure/layouts.md">Les Layouts</a>.

::

```

---

## Checklist avant validation

Avant de soumettre un commit pour une nouvelle page ou une modification majeure, vérifiez ces points :

---

## Ressources

| Ressource | Lien |
| --- | --- |
| Icônes Tabler | [https://tabler-icons.io](https://tabler-icons.io) |
| shadcn-vue | [https://www.shadcn-vue.com](https://www.shadcn-vue.com) |
| v-content | Documentation interne du moteur de contenu |
| Dépôt Runable | [https://github.com/runablejs/runable](https://github.com/runablejs/runable) |
