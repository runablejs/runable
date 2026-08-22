---
title: .app
description: Découvrez les types, registres et fichiers virtuels préparés par Runable.
---

Runable transforme ses conventions en code et en déclarations TypeScript dans `.app/`. La commande `runable prepare` crée ce dossier ; le serveur de développement le maintient ensuite à jour.

Selon les fonctionnalités utilisées, vous y trouverez notamment :

```text
.app/
├── components.d.ts
├── globals.d.ts
├── layouts.d.ts
├── modules-options.d.ts
├── plugins.d.ts
├── router.d.ts
├── runtime.d.ts
└── tsconfig.app.json
```

Ces fichiers donnent à TypeScript et à l'éditeur la liste des composants, fonctions, routes, layouts et injections disponibles sans import manuel.

## Préparer les types

```bash
pnpm app:prepare
```

Exécutez cette commande après l'installation du projet et dans votre CI avant un contrôle de types si `.app/` n'existe pas encore.

L'alias interne `#build` pointe vers ce dossier. Il permet au runtime et aux extensions de référencer les fichiers générés sans dépendre du nom configuré dans `output`.

::u-tip
---
variant: warning
title: Dossier éphémère
---

Ne placez aucun code métier dans `.app/` et ne corrigez pas ses déclarations à la main. La prochaine génération écraserait vos changements.

::
