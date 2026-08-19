export function useAppConfig() {
  return {
    github: {
      repo: "syorajs/syora",
    },

    nav: [
      {
        name: "Getting Started",
        code: "getting-started",
        href: "/docs/getting-started/why-syora",
        icon: "tabler:rocket",
        children: [
          {
            name: "Why Syora",
            code: "why-syora",
            href: "/docs/getting-started/why-syora",
            icon: "tabler:sparkles",
          },
          {
            name: "Installation",
            code: "installation",
            href: "/docs/getting-started/installation",
            icon: "tabler:download",
          },
          {
            name: "Quick Start",
            code: "quickstart",
            href: "/docs/getting-started/quickstart",
            icon: "tabler:bolt",
          },
          {
            name: "Syora vs Nuxt",
            code: "vs-nuxt",
            href: "/docs/getting-started/vs-nuxt",
            icon: "tabler:git-compare",
          },
          {
            name: "Configuration",
            code: "configuration",
            href: "/docs/getting-started/configuration",
            icon: "tabler:settings",
          },
          {
            name: "Concepts",
            code: "concepts",
            href: "/docs/getting-started/concepts",
            icon: "tabler:bulb",
          },
        ],
      },

      {
        name: "Structure",
        code: "structure",
        href: "/docs/structure",
        icon: "tabler:folder-open",
        children: [
          {
            code: "output",
            name: ".output",
            href: "/docs/structure/output",
            icon: "vscode-icons:folder-type-dist",
            iconOpen: "vscode-icons:folder-type-dist-opened",
          },
          {
            code: "dot-app",
            name: ".app",
            href: "/docs/structure/dot-app",

            icon: "vscode-icons:folder-type-dist",
            iconOpen: "vscode-icons:folder-type-dist-opened",
            children: [
              {
                code: "tsconfig-app",
                name: "tsconfig.app.json",
                href: "/docs/structure/tsconfig-app",
                icon: "vscode-icons:file-type-tsconfig",
              },
            ],
          },
          {
            // iconify i-vscode-icons:folder-type-app shrink-0 size-5 text-dimmed group-hover:text-default group-data-[state=open]:text-default transition-colors
            code: "app",
            name: "app",
            href: "/docs/structure/app",

            icon: "vscode-icons:folder-type-app",
            iconOpen: "vscode-icons:folder-type-app-opened",
            children: [
              {
                code: "app-pages",
                name: "pages",
                href: "/docs/structure/app-pages",

                icon: "vscode-icons:folder-type-view",
                iconOpen: "vscode-icons:folder-type-view-opened",
              },
              {
                code: "app-layouts",
                name: "layouts",
                href: "/docs/structure/app-layouts",

                icon: "vscode-icons:folder-type-view",
                iconOpen: "vscode-icons:folder-type-view-opened",
              },
              {
                code: "app-components",
                name: "components",
                href: "/docs/structure/app-components",

                icon: "vscode-icons:folder-type-component",
                iconOpen: "vscode-icons:folder-type-component-opened",
              },
              {
                code: "app-composables",
                name: "composables",
                href: "/docs/structure/app-composables",

                icon: "vscode-icons:folder-type-hook",
                iconOpen: "vscode-icons:folder-type-hook-opened",
              },
              {
                code: "app-globals",
                name: "globals",
                href: "/docs/structure/app-globals",
                icon: "vscode-icons:folder-type-tools",
                iconOpen: "vscode-icons:folder-type-tools-opened",
              },
              {
                code: "app-plugins",
                name: "plugins",
                href: "/docs/structure/app-plugins",

                icon: "vscode-icons:folder-type-plugin",
                iconOpen: "vscode-icons:folder-type-plugin-opened",
              },
              {
                code: "app-middlewares",
                name: "middlewares",
                href: "/docs/structure/app-middlewares",

                icon: "vscode-icons:folder-type-middleware",
                iconOpen: "vscode-icons:folder-type-middleware-opened",
              },
              {
                code: "app-css",
                name: "css",
                href: "/docs/structure/app-css",
                icon: "vscode-icons:folder-type-css",
                iconOpen: "vscode-icons:folder-type-css-opened",
              },
              {
                code: "app-dot-vue",
                name: "app.vue",
                href: "/docs/structure/app-dot-vue",
                icon: "vscode-icons:file-type-vue",
              },
              {
                code: "error-dot-vue",
                name: "error.vue",
                href: "/docs/structure/error-dot-vue",
                icon: "vscode-icons:file-type-vue",
              },
            ],
          },
          {
            code: "modules",
            name: "modules",
            href: "/docs/structure/modules",
            icon: "vscode-icons:folder-type-module",
            iconOpen: "vscode-icons:folder-type-module-opened",
          },
          {
            code: "node-modules",
            name: "node_modules",
            href: "/docs/structure/node-modules",
            icon: "vscode-icons:folder-type-node",
            iconOpen: "vscode-icons:folder-type-node-opened",
          },
          {
            code: "public",
            name: "public",
            href: "/docs/structure/public",

            icon: "vscode-icons:folder-type-public",
            iconOpen: "vscode-icons:folder-type-public-opened",
          },
          {
            code: "env",
            name: ".env",
            href: "/docs/structure/env",
            icon: "vscode-icons:file-type-dotenv",
          },
          {
            code: "gitignore",
            name: ".gitignore",
            href: "/docs/structure/gitignore",

            icon: "vscode-icons:file-type-git",
          },
          {
            code: "syora-config",
            name: "syora.config.ts",
            href: "/docs/structure/syora-config",
            icon: "vscode-icons:file-type-light-config",
          },
          {
            code: "server",
            name: "server.ts",
            href: "/docs/structure/server",

            icon: "vscode-icons:file-type-typescript",
          },
          {
            code: "package-json",
            name: "package.json",
            href: "/docs/structure/package-json",

            icon: "vscode-icons:file-type-npm",
          },
          {
            code: "tsconfig",
            name: "tsconfig.json",
            href: "/docs/structure/tsconfig",

            icon: "vscode-icons:file-type-tsconfig",
          },
          {
            code: "tsconfig-node",
            name: "tsconfig.node.json",
            href: "/docs/structure/tsconfig-node",

            icon: "vscode-icons:file-type-tsconfig",
          },
        ],
      },

      {
        name: "Integrations",
        code: "integrations",
        href: "/docs/integrations",
        icon: "tabler:tabs",
        children: [
          {
            name: "Express",
            code: "express",
            href: "/docs/integrations/express",
            icon: "simple-icons:express",
          },
          {
            name: "Fastify",
            code: "fastify",
            href: "/docs/integrations/fastify",
            icon: "simple-icons:fastify",
          },
          {
            name: "Hono",
            code: "hono",
            href: "/docs/integrations/hono",
            icon: "logos:hono",
          },
          {
            name: "Koa",
            code: "koa",
            href: "/docs/integrations/koa",
            icon: "simple-icons:koa",
          },
          {
            name: "NestJS",
            code: "nestjs",
            href: "/docs/integrations/nestjs",
            icon: "logos:nestjs",
          },
          {
            name: "AdonisJS",
            code: "adonisjs",
            href: "/docs/integrations/adonisjs",
            icon: "logos:adonisjs-icon",
          },
          {
            name: "h3",
            code: "h3",
            href: "/docs/integrations/h3",
            icon: "logos:unjs",
          },
          {
            name: "Bun",
            code: "bun",
            href: "/docs/integrations/bun",
            icon: "logos:bun",
          },
          {
            name: "Deno",
            code: "deno",
            href: "/docs/integrations/deno",
            icon: "logos:deno",
          },
          {
            name: "Custom",
            code: "custom",
            href: "/docs/integrations/custom",
            icon: "logos:typescript-icon",
          },
        ],
      },

      {
        name: "Guide",
        code: "guide",
        href: "/docs/guide",
        icon: "tabler:notebook",
        children: [
          {
            name: "Build the Interface",
            code: "application",
            href: "/docs/guide/routing",
            icon: "tabler:layout-dashboard",
            children: [
              {
                name: "Routing",
                code: "routing",
                href: "/docs/guide/routing",
                icon: "tabler:route",
              },
              {
                name: "Layouts",
                code: "layouts",
                href: "/docs/guide/layouts",
                icon: "tabler:layout",
              },
              {
                name: "Middlewares",
                code: "middlewares",
                href: "/docs/guide/middlewares",
                icon: "tabler:shield-half",
              },
              {
                name: "Error Handling",
                code: "error-handling",
                href: "/docs/guide/error-handling",
                icon: "tabler:alert-triangle",
              },
            ],
          },
          {
            name: "Load and Render",
            code: "rendering",
            href: "/docs/guide/data-fetching",
            icon: "tabler:server-bolt",
            children: [
              {
                name: "Data Fetching",
                code: "data-fetching",
                href: "/docs/guide/data-fetching",
                icon: "tabler:cloud-download",
              },
              {
                name: "SSR and CSR",
                code: "rendering-modes",
                href: "/docs/guide/rendering-modes",
                icon: "tabler:server-2",
              },
              {
                name: "Head and SEO",
                code: "head-and-seo",
                href: "/docs/guide/head-and-seo",
                icon: "tabler:seo",
              },
            ],
          },
          {
            name: "Extend Syora",
            code: "extending",
            href: "/docs/guide/auto-imports",
            icon: "tabler:blocks",
            children: [
              {
                name: "Auto-imports",
                code: "auto-imports",
                href: "/docs/guide/auto-imports",
                icon: "tabler:arrows-shuffle",
              },
              {
                name: "Plugins",
                code: "plugins",
                href: "/docs/guide/plugins",
                icon: "tabler:plug",
              },
              {
                name: "Modules",
                code: "modules",
                href: "/docs/guide/modules",
                icon: "tabler:box",
              },
            ],
          },
          {
            name: "Configure and Ship",
            code: "delivery",
            href: "/docs/guide/runtime-config",
            icon: "tabler:package-export",
            children: [
              {
                name: "Runtime Configuration",
                code: "runtime-config",
                href: "/docs/guide/runtime-config",
                icon: "tabler:variable",
              },
              {
                name: "CSS and Assets",
                code: "css-and-assets",
                href: "/docs/guide/css-and-assets",
                icon: "tabler:palette",
              },
              {
                name: "Production Build",
                code: "production-build",
                href: "/docs/guide/production-build",
                icon: "tabler:rocket",
              },
            ],
          },
        ],
      },

      {
        name: "API",
        code: "api",
        href: "/docs/api",
        icon: "tabler:code",
        children: [
          {
            name: "Components",
            code: "components",
            href: "/docs/api/components",
            icon: "tabler:components",
            children: [
              {
                name: "SyoraPage",
                code: "syora-page",
                href: "/docs/api/components/syora-page",
                icon: "tabler:file",
              },
              {
                name: "SyoraLink",
                code: "syora-link",
                href: "/docs/api/components/syora-link",
                icon: "tabler:link",
              },
              {
                name: "SyoraLayout",
                code: "syora-layout",
                href: "/docs/api/components/syora-layout",
                icon: "tabler:layout",
              },
              {
                name: "ClientOnly",
                code: "client-only",
                href: "/docs/api/components/client-only",
                icon: "tabler:browser",
              },
            ],
          },
          {
            name: "Composables",
            code: "composables",
            href: "/docs/api/composables",
            icon: "tabler:function",
            children: [
              {
                name: "useAsyncData",
                code: "use-async-data",
                href: "/docs/api/composables/use-async-data",
                icon: "tabler:database",
              },
              {
                name: "useFetch",
                code: "use-fetch",
                href: "/docs/api/composables/use-fetch",
                icon: "tabler:world-down",
              },
              {
                name: "useConfig",
                code: "use-config",
                href: "/docs/api/composables/use-config",
                icon: "tabler:settings",
              },
              {
                name: "useRuntime",
                code: "use-runtime",
                href: "/docs/api/composables/use-runtime",
                icon: "tabler:variable",
              },
              {
                name: "useApp",
                code: "use-app",
                href: "/docs/api/composables/use-app",
                icon: "tabler:app-window",
              },
              {
                name: "useAppError",
                code: "use-app-error",
                href: "/docs/api/composables/use-app-error",
                icon: "tabler:alert-triangle",
              },
              {
                name: "useRouter",
                code: "use-router",
                href: "/docs/api/composables/use-router",
                icon: "tabler:route",
              },
              {
                name: "useRoute",
                code: "use-route",
                href: "/docs/api/composables/use-route",
                icon: "tabler:map-pin",
              },
              {
                name: "navigateTo",
                code: "navigate-to",
                href: "/docs/api/composables/navigate-to",
                icon: "tabler:arrow-right",
              },
              {
                name: "onBeforeRouteUpdate",
                code: "on-before-route-update",
                href: "/docs/api/composables/on-before-route-update",
                icon: "tabler:route-alt-left",
              },
              {
                name: "injectHead",
                code: "inject-head",
                href: "/docs/api/composables/inject-head",
                icon: "tabler:brackets-contain",
              },
              {
                name: "useHead",
                code: "use-head",
                href: "/docs/api/composables/use-head",
                icon: "tabler:code-dots",
              },
              {
                name: "useSeoMeta",
                code: "use-seo-meta",
                href: "/docs/api/composables/use-seo-meta",
                icon: "tabler:search",
              },
              {
                name: "useHeadSafe",
                code: "use-head-safe",
                href: "/docs/api/composables/use-head-safe",
                icon: "tabler:shield-check",
              },
              {
                name: "useSchemaOrg",
                code: "use-schema-org",
                href: "/docs/api/composables/use-schema-org",
                icon: "tabler:code-circle",
              },
            ],
          },
          {
            name: "Globals",
            code: "globals",
            href: "/docs/api/globals",
            icon: "tabler:world",
            children: [
              {
                name: "$fetch",
                code: "dollar-fetch",
                href: "/docs/api/globals/dollar-fetch",
                icon: "tabler:http-get",
              },
              {
                name: "definePageMeta",
                code: "define-page-meta",
                href: "/docs/api/globals/define-page-meta",
                icon: "tabler:file-settings",
              },
              {
                name: "defineVueMiddleware",
                code: "define-vue-middleware",
                href: "/docs/api/globals/define-vue-middleware",
                icon: "tabler:shield",
              },
              {
                name: "defineVuePlugin",
                code: "define-vue-plugin",
                href: "/docs/api/globals/define-vue-plugin",
                icon: "tabler:plug",
              },
              {
                name: "Vue APIs",
                code: "vue-apis",
                href: "/docs/api/globals/vue-apis",
                icon: "simple-icons:vuedotjs",
              },
            ],
          },
        ],
      },
    ],
  };
}
