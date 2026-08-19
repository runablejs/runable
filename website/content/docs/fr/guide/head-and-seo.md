---
title: Head et SEO
description: Définissez les métadonnées HTML globales et propres à chaque page avec Unhead.
---

Syora installe Unhead et son intégration Schema.org. Les métadonnées produites pendant le SSR sont injectées dans le document avant son envoi.

## Définir les valeurs globales

```ts
// syora.config.ts
export default defineConfig({
  siteUrl: "https://example.com",
  head: {
    titleTemplate: "%s · Acme",
    meta: [{ name: "description", content: "Gérez vos projets avec Acme." }],
    link: [{ rel: "icon", href: "/favicon.svg" }],
  },
});
```

`siteUrl` fournit l'origine utilisée par Schema.org pour construire les URLs absolues.

## Configurer une page

```vue
<script setup lang="ts">
const project = ref({ name: "Syora", summary: "Application Vue avec votre backend." });

useSeoMeta({
  title: () => project.value.name,
  description: () => project.value.summary,
  ogTitle: () => project.value.name,
  ogDescription: () => project.value.summary,
});
</script>
```

Les getters conservent les métadonnées synchronisées avec les valeurs réactives.

## Ajouter des éléments libres

```ts
useHead({
  htmlAttrs: { lang: "fr" },
  link: [{ rel: "canonical", href: "https://example.com/projects" }],
});
```

Utilisez `useHeadSafe()` lorsque les valeurs viennent d'une source non maîtrisée. `injectHead()` donne accès directement à l'instance Unhead pour les intégrations avancées.

## Déclarer des données structurées

```ts
import { defineWebPage } from "@unhead/schema-org";

useSchemaOrg([
  defineWebPage({
    name: "Projets",
    description: "Liste des projets publics",
  }),
]);
```

`useSchemaOrg()` est auto-importé. Importez explicitement les helpers de nœuds Schema.org dont votre page a besoin si votre configuration ne les expose pas.

::u-tip
---
variant: info
title: Une source globale, des surcharges locales
---

Placez les valeurs communes dans `head` et ne déclarez dans les pages que les données qui changent avec la route ou son contenu.

::
