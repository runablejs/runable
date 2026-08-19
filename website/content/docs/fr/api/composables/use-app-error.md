---
title: useAppError
description: Consultez, affichez et effacez l'erreur capturée par l'application Vue.
---

```ts
const { error, showError, clearError } = useAppError();
```

| Propriété | Type | Rôle |
| --- | --- | --- |
| `error` | `ShallowRef<AppError \| null>` | Erreur active |
| `showError()` | `(error, options?) => AppError` | Normalise et affiche une erreur |
| `clearError()` | `() => void` | Efface l'erreur active |

```ts
showError(new Error("Projet introuvable"), {
  code: "PROJECT_NOT_FOUND",
  statusCode: 404,
  source: "manual",
});
```

Les sources possibles sont `vue`, `router`, `window`, `unhandled-rejection` et `manual`.

