---
"runable": minor
---

Add `runable/inspector`, a public, read-only API for programmatically inspecting how Runable resolves a project: `createRunableInspector({ rootDir })` returns an object with `getProject()`, `getConfig()`, `getRoutes()`, `getLayouts()`, `getMiddlewares()`, `getPlugins()`, `getModules()`, `getAutoImports()`, and `refresh()`. Every result is a plain, JSON-serializable value, and runtime environment variables follow Runable's existing public/private split — a private value's name is exposed, never its value. Built as the underlying primitive for future tooling (CLI diagnostics, IDE integrations, DevTools) to build on; it does not itself implement any of those.
