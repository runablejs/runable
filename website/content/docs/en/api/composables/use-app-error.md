---
title: useAppError
description: Read, display, and clear errors captured by the Vue application.
---

```ts
const { error, showError, clearError } = useAppError();
```

| Property | Type | Purpose |
| --- | --- | --- |
| `error` | `ShallowRef<AppError \| null>` | Active error |
| `showError()` | `(error, options?) => AppError` | Normalizes and displays an error |
| `clearError()` | `() => void` | Clears the active error |

```ts
showError(new Error("Project not found"), {
  code: "PROJECT_NOT_FOUND",
  statusCode: 404,
  source: "manual",
});
```

Possible sources are `vue`, `router`, `window`, `unhandled-rejection`, and `manual`.
