---
title: API
description: Référence des composants, composables et fonctions globales fournis par Runable.
---

Cette section décrit les API disponibles automatiquement dans l'application Vue.

| Famille | Contenu |
| --- | --- |
| Components | Rendu des pages, layouts, liens et contenu client |
| Composables | Données, routeur, configuration, head et Schema.org |
| Globals | Fetch, métadonnées de page, middlewares, plugins et API Vue |

Les composants et fonctions documentés ici sont auto-importés dans le code applicatif analysé par Runable (`app/`) — c'est leur seul mécanisme d'accès. La plupart n'ont aucun chemin d'import explicite `import ... from "runable"` ; `useRuntime()` fait exception, réexporté depuis la racine du package pour un usage côté backend (voir <a href="/docs/api/composables/use-runtime.md">useRuntime</a>).

::u-tip
---
variant: warning
title: API en version alpha
---

Certaines signatures peuvent encore évoluer. Les pages signalent les fonctions dont l'implémentation est incomplète.

::

