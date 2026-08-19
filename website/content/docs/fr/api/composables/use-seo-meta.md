---
title: useSeoMeta
description: Déclarez les métadonnées SEO avec une API plate et typée.
---

`useSeoMeta()` simplifie la création des balises SEO, Open Graph et Twitter.

```ts
useSeoMeta({
  title: "Syora",
  description: "Framework Vue pour votre backend.",
  ogTitle: "Syora",
  ogDescription: "Framework Vue pour votre backend.",
  ogImage: "https://example.com/og.png",
  twitterCard: "summary_large_image",
});
```

Les clés sont typées et transformées en balises `<meta>` par Unhead. Utilisez `useHead()` lorsque vous devez ajouter d'autres éléments comme `link`, `script`, `style` ou `htmlAttrs`.

