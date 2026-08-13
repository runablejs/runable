// docs/.vitepress/config.ts
import { defineConfig } from "vitepress";

export default defineConfig({
  srcDir: "docs/fr",

  title: "Syora",
  description:
    "The Vue framework that brings the Nuxt developer experience to any backend.",
  lang: "en-US",
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ["link", { rel: "icon", href: "/favicon.svg" }],
    ["meta", { name: "theme-color", content: "#10b981" }],
  ],

  themeConfig: {
    logo: "/logo.svg",

    nav: [
      {
        text: "Why Syora?",
        link: "/why-syora",
        activeMatch: "^/(why-syora|vs-nuxt|concepts)",
      },
      {
        text: "Getting Started",
        link: "/getting-started/installation",
        activeMatch: "^/getting-started/",
      },
      { text: "Guide", link: "/guide/routing", activeMatch: "^/guide/" },
      {
        text: "Integrations",
        link: "/integrations/",
        activeMatch: "^/integrations/",
      },
      {
        text: "Cookbook",
        link: "/cookbook/authentication",
        activeMatch: "^/cookbook/",
      },
      { text: "API", link: "/api/composables", activeMatch: "^/api/" },
    ],

    sidebar: {
      "/": [
        {
          text: "Understanding Syora",
          items: [
            { text: "Why Syora?", link: "/why-syora" },
            { text: "Syora vs Nuxt", link: "/vs-nuxt" },
            { text: "Core Concepts", link: "/concepts" },
          ],
        },
      ],
      "/getting-started/": [
        {
          text: "Getting Started",
          items: [
            { text: "Installation", link: "/getting-started/installation" },
            { text: "Quick Start", link: "/getting-started/quickstart" },
            {
              text: "Directory Structure",
              link: "/getting-started/directory-structure",
            },
            { text: "Configuration", link: "/getting-started/configuration" },
          ],
        },
      ],
      "/guide/": [
        {
          text: "Fundamentals",
          items: [
            { text: "Routing", link: "/guide/routing" },
            { text: "Layouts", link: "/guide/layouts" },
            { text: "Middlewares", link: "/guide/middlewares" },
            { text: "Auto-imports", link: "/guide/auto-imports" },
            { text: "Data Fetching", link: "/guide/data-fetching" },
            { text: "SSR", link: "/guide/ssr" },
          ],
        },
        {
          text: "Extending",
          items: [
            { text: "Plugins", link: "/guide/plugins" },
            { text: "Modules", link: "/guide/modules" },
          ],
        },
      ],
      "/integrations/": [
        {
          text: "Server Integrations",
          items: [
            { text: "Overview", link: "/integrations/" },
            { text: "Express", link: "/integrations/express" },
            { text: "Fastify", link: "/integrations/fastify" },
            { text: "Hono", link: "/integrations/hono" },
            { text: "Koa", link: "/integrations/koa" },
            { text: "NestJS", link: "/integrations/nestjs" },
            { text: "AdonisJS", link: "/integrations/adonisjs" },
            { text: "H3 / Nitro", link: "/integrations/h3" },
            { text: "Bun", link: "/integrations/bun" },
            { text: "Deno", link: "/integrations/deno" },
            { text: "Custom Adapter", link: "/integrations/custom" },
          ],
        },
      ],
      "/cookbook/": [
        {
          text: "Recipes",
          items: [
            { text: "Authentication", link: "/cookbook/authentication" },
            { text: "Internationalization", link: "/cookbook/i18n" },
            {
              text: "Content Management",
              link: "/cookbook/content-management",
            },
            { text: "Deployment", link: "/cookbook/deployment" },
          ],
        },
      ],
      "/api/": [
        {
          text: "API Reference",
          items: [
            { text: "Composables", link: "/api/composables" },
            { text: "Configuration", link: "/api/config" },
            { text: "Server Utils", link: "/api/server" },
            { text: "Modules", link: "/api/modules" },
            { text: "Plugins", link: "/api/plugins" },
            { text: "CLI", link: "/api/cli" },
          ],
        },
      ],
    },

    search: { provider: "local" },

    socialLinks: [{ icon: "github", link: "https://github.com/syorajs/syora" }],

    editLink: {
      pattern: "https://github.com/syorajs/syora/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2026 Syora Contributors",
    },
  },
});
