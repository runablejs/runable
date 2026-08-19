---
title: SyoraLink
description: Créez des liens typés qui naviguent avec Vue Router.
---

`SyoraLink` enveloppe `RouterLink` et conserve ses props, attributs HTML et slots.

```vue
<SyoraLink to="/projects">Projets</SyoraLink>
```

## Props principales

| Prop | Type | Description |
| --- | --- | --- |
| `to` | `RouteLocationRaw` | Destination du lien |
| `replace` | `boolean` | Remplace l'entrée courante dans l'historique |
| `custom` | `boolean` | Désactive la balise `<a>` automatique |
| `activeClass` | `string` | Classe appliquée lorsque le lien est actif |
| `exactActiveClass` | `string` | Classe appliquée pour une correspondance exacte |
| `viewTransition` | `boolean` | Utilise View Transitions lorsqu'elle est disponible |

Le slot personnalisé expose `href`, `route`, `navigate`, `isActive` et `isExactActive`.

