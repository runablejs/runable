---
title: Project structure
description: Quickly locate application code, configuration, generated files, and the production build in a Syora project.
---

Syora separates the code you write from the files it generates. Most of your work happens in `app/`, `server.ts`, and `syora.config.ts`.

```text
my-app/
├── app/                 # Vue application
├── modules/             # Optional local Syora modules
├── public/              # Static files
├── .app/                # Generated types and registries
├── .output/             # Production build
├── server.ts            # HTTP entry point
├── syora.config.ts      # Syora configuration
├── package.json
└── tsconfig.json
```

## Where should code go?

| Need | Location |
| --- | --- |
| Create a screen | `app/pages/` |
| Share a visual structure | `app/layouts/` |
| Reuse an interface | `app/components/` |
| Reuse Vue logic | `app/composables/` |
| Expose an auto-imported function | `app/globals/` |
| Install a Vue integration | `app/plugins/` |
| Control navigation | `app/middlewares/` |
| Add an API route | Your backend, often from `server.ts` |
| Extend Syora | `modules/` or a dedicated package |

::u-tip
---
variant: warning
title: Do not edit generated directories
---

Syora may rewrite `.app/` during preparation and `.output/` during builds. Always fix the source file or configuration that produced the generated content.

::

## Optional directories

Conventional directories are scanned even when they do not exist yet. Create only those your application needs. You can also relocate each convention from `syora.config.ts`.
