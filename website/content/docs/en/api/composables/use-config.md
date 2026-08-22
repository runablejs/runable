---
title: useConfig
description: Read the public part of the Runable configuration in the Vue application.
---

```ts
function useConfig(): ClientConfig
```

The result contains only options that are safe to send to the client:

```ts
const config = useConfig();

console.log(config.ssr);
console.log(config.siteUrl);
console.log(config.baseUrl);
console.log(config.head);
```

`ClientConfig` includes `head`, `ssr`, `siteUrl`, and `baseUrl`. Absolute paths, modules, and Vite settings remain on the server.
