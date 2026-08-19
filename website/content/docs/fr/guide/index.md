---
title: Guide
description: Construisez, rendez, étendez et livrez une application Syora.
---

Ce guide explique comment utiliser les fonctionnalités de Syora dans une application réelle. Chaque page part d'un besoin concret et montre le code à écrire.

## Construire l'interface

Commencez ici pour organiser la navigation et l'affichage de vos pages.

| Besoin | Page |
| --- | --- |
| Transformer des fichiers Vue en routes | <a href="./routing.md">Routing</a> |
| Partager une structure entre plusieurs pages | <a href="./layouts.md">Layouts</a> |
| Contrôler une navigation | <a href="./middlewares.md">Middlewares</a> |
| Afficher et réinitialiser une erreur | <a href="./error-handling.md">Gestion des erreurs</a> |

## Charger et rendre

Ces pages couvrent les données, le SSR et les métadonnées HTML.

| Besoin | Page |
| --- | --- |
| Charger des données avec cache et hydratation | <a href="./data-fetching.md">Data Fetching</a> |
| Choisir entre SSR et CSR | <a href="./rendering-modes.md">SSR et CSR</a> |
| Définir le titre, le SEO et les données structurées | <a href="./head-and-seo.md">Head et SEO</a> |

## Étendre Syora

Utilisez les auto-imports pour le code applicatif, les plugins pour initialiser Vue et les modules pour distribuer un ensemble complet de conventions.

| Portée | Solution |
| --- | --- |
| Une fonction ou un composant réutilisable | <a href="./auto-imports.md">Auto-imports</a> |
| Une initialisation liée à l'application Vue | <a href="./plugins.md">Plugins</a> |
| Une fonctionnalité configurable et distribuable | <a href="./modules.md">Modules</a> |

## Configurer et livrer

Terminez par la <a href="./runtime-config.md">configuration runtime</a>, les <a href="./css-and-assets.md">styles et assets</a>, puis le <a href="./production-build.md">build de production</a>.

::u-tip
---
variant: info
title: Guide ou référence API ?
---

Utilisez le Guide pour apprendre un workflow complet. Consultez le bloc API lorsque vous cherchez la signature exacte d'un composable, d'un composant ou d'une globale.

::
