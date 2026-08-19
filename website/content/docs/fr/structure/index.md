---
title: Structure d'un projet
description: Repérez rapidement le code applicatif, la configuration, les fichiers générés et le build de production d'un projet Syora.
---

Syora sépare le code que vous écrivez des fichiers qu'il génère. La plupart de votre travail se déroule dans `app/`, `server.ts` et `syora.config.ts`.

```text
my-app/
├── app/                 # Application Vue
├── modules/             # Modules Syora locaux, facultatif
├── public/              # Fichiers statiques
├── .app/                # Types et registres générés
├── .output/             # Build de production
├── server.ts            # Point d'entrée HTTP
├── syora.config.ts      # Configuration Syora
├── package.json
└── tsconfig.json
```

## Où placer votre code ?

| Besoin | Emplacement |
| --- | --- |
| Créer un écran | `app/pages/` |
| Partager une structure visuelle | `app/layouts/` |
| Réutiliser une interface | `app/components/` |
| Réutiliser une logique Vue | `app/composables/` |
| Exposer une fonction auto-importée | `app/globals/` |
| Installer une intégration Vue | `app/plugins/` |
| Contrôler une navigation | `app/middlewares/` |
| Ajouter une route API | Votre backend, souvent depuis `server.ts` |
| Étendre Syora | `modules/` ou un package dédié |

::u-tip
---
variant: warning
title: Ne modifiez pas les dossiers générés
---

Syora peut réécrire `.app/` pendant la préparation et `.output/` pendant le build. Corrigez toujours le fichier source ou la configuration à l'origine du contenu généré.

::

## Dossiers facultatifs

Les dossiers conventionnels sont analysés même s'ils n'existent pas encore. Créez seulement ceux dont votre application a besoin. Vous pouvez aussi déplacer chaque convention depuis `syora.config.ts`.

