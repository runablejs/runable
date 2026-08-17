export function useAppConfig() {
  return {
    nav: [
      {
        name: "Get started",
        code: "getting-started",
        href: "/docs/getting-started",
        icon: "tabler:rocket",
        children: [
          {
            name: "Pourquoi Syora",
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

            icon: "vscode-icons:folder-type-dist",
            iconOpen: "vscode-icons:folder-type-dist-opened",
          },
          {
            code: "dot-app",
            name: ".app",

            icon: "vscode-icons:folder-type-dist",
            iconOpen: "vscode-icons:folder-type-dist-opened",
          },
          {
            // iconify i-vscode-icons:folder-type-app shrink-0 size-5 text-dimmed group-hover:text-default group-data-[state=open]:text-default transition-colors
            code: "app",
            name: "app",

            icon: "vscode-icons:folder-type-app",
            iconOpen: "vscode-icons:folder-type-app-opened",
            children: [
              {
                code: "app-pages",
                name: "pages",

                icon: "vscode-icons:folder-type-view",
                iconOpen: "vscode-icons:folder-type-view-opened",
              },
              {
                code: "app-layouts",
                name: "layouts",

                icon: "vscode-icons:folder-type-view",
                iconOpen: "vscode-icons:folder-type-view-opened",
              },
              {
                code: "app-components",
                name: "components",

                icon: "vscode-icons:folder-type-component",
                iconOpen: "vscode-icons:folder-type-component-opened",
              },
              {
                code: "app-composables",
                name: "composables",

                icon: "vscode-icons:folder-type-hook",
                iconOpen: "vscode-icons:folder-type-hook-opened",
              },
              {
                code: "app-plugins",
                name: "plugins",

                icon: "vscode-icons:folder-type-plugin",
                iconOpen: "vscode-icons:folder-type-plugin-opened",
              },
              {
                code: "app-middlewares",
                name: "middlewares",

                icon: "vscode-icons:folder-type-middleware",
                iconOpen: "vscode-icons:folder-type-middleware-opened",
              },
              {
                code: "app-css",
                name: "css",
                icon: "vscode-icons:folder-type-css",
                iconOpen: "vscode-icons:folder-type-css-opened",
              },
              {
                code: "app-dot-vue",
                name: "app.vue",
                icon: "vscode-icons:file-type-vue",
              },
              {
                code: "error-dot-vue",
                name: "error.vue",
                icon: "vscode-icons:file-type-vue",
              },
            ],
          },
          {
            code: "modules",
            name: "modules",
            icon: "vscode-icons:folder-type-module",
            iconOpen: "vscode-icons:folder-type-module-opened",
          },
          {
            code: "node-modules",
            name: "node_modules",
            icon: "vscode-icons:folder-type-node",
            iconOpen: "vscode-icons:folder-type-node-opened",
          },
          {
            code: "public",
            name: "public",

            icon: "vscode-icons:folder-type-public",
            iconOpen: "vscode-icons:folder-type-public-opened",
          },
          {
            code: "env",
            name: ".env",
            icon: "vscode-icons:file-type-dotenv",
          },
          {
            code: "gitignore",
            name: ".gitignore",

            icon: "vscode-icons:file-type-git",
          },
          {
            code: "syora-config",
            name: "syora.config.ts",
            icon: "vscode-icons:file-type-light-config",
          },
          {
            code: "server",
            name: "server.ts",

            icon: "vscode-icons:file-type-typescript",
          },
          {
            code: "package-json",
            name: "package.json",

            icon: "vscode-icons:file-type-npm",
          },
          {
            code: "tsconfig",
            name: "tsconfig.json",

            icon: "vscode-icons:file-type-tsconfig",
          },
          {
            code: "tsconfig-app",
            name: "tsconfig.app.json",

            icon: "vscode-icons:file-type-tsconfig",
          },
          {
            code: "tsconfig-node",
            name: "tsconfig.node.json",

            icon: "vscode-icons:file-type-tsconfig",
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
            name: "Routing",
            code: "routing",
            href: "/docs/guide/routing",
            icon: "tabler:route",
          },
          {
            name: "Middlewares",
            code: "middlewares",
            href: "/docs/guide/middlewares",
            icon: "tabler:shield-half",
          },
          {
            name: "Auto-imports",
            code: "auto-imports",
            href: "/docs/guide/auto-imports",
            icon: "tabler:arrows-shuffle",
          },
          {
            name: "Data Fetching",
            code: "data-fetching",
            href: "/docs/guide/data-fetching",
            icon: "tabler:cloud-download",
          },
          {
            name: "SSR",
            code: "ssr",
            href: "/docs/guide/ssr",
            icon: "tabler:server-2",
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
        name: "Intégrations",
        code: "integrations",
        href: "/docs/integrations",
        icon: "tabler:app-window",
        children: [
          {
            name: "Vue d'ensemble",
            code: "index",
            href: "/docs/integrations",
            icon: "tabler:list-details",
          },
          {
            name: "Express",
            code: "express",
            href: "/docs/integrations/express",
            icon: "tabler:server",
          },
          {
            name: "Fastify",
            code: "fastify",
            href: "/docs/integrations/fastify",
            icon: "tabler:server",
          },
          {
            name: "Hono",
            code: "hono",
            href: "/docs/integrations/hono",
            icon: "tabler:server",
          },
          {
            name: "Koa",
            code: "koa",
            href: "/docs/integrations/koa",
            icon: "tabler:server",
          },
          {
            name: "NestJS",
            code: "nestjs",
            href: "/docs/integrations/nestjs",
            icon: "tabler:server",
          },
          {
            name: "AdonisJS",
            code: "adonisjs",
            href: "/docs/integrations/adonisjs",
            icon: "tabler:server",
          },
          {
            name: "h3",
            code: "h3",
            href: "/docs/integrations/h3",
            icon: "tabler:server",
          },
          {
            name: "Bun",
            code: "bun",
            href: "/docs/integrations/bun",
            icon: "tabler:server",
          },
          {
            name: "Deno",
            code: "deno",
            href: "/docs/integrations/deno",
            icon: "tabler:server",
          },
          {
            name: "Custom",
            code: "custom",
            href: "/docs/integrations/custom",
            icon: "tabler:adjustments",
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
            name: "Composables",
            code: "composables",
            href: "/docs/api/composables",
            icon: "tabler:function",
          },
          {
            name: "Config",
            code: "config",
            href: "/docs/api/config",
            icon: "tabler:settings",
          },
          {
            name: "Server",
            code: "server",
            href: "/docs/api/server",
            icon: "tabler:server-2",
          },
          {
            name: "Modules",
            code: "modules",
            href: "/docs/api/modules",
            icon: "tabler:box",
          },
          {
            name: "Plugins",
            code: "plugins",
            href: "/docs/api/plugins",
            icon: "tabler:plug",
          },
          {
            name: "CLI",
            code: "cli",
            href: "/docs/api/cli",
            icon: "tabler:terminal-2",
          },
        ],
      },
    ],
  };
}
