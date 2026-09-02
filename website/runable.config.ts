import { join, resolve } from "node:path";

import { defineConfig } from "runable";
import tailwindcss from "@tailwindcss/vite";
import vContent from "v-content/vite";

import {
  defineCollection,
  rehypeList,
  rehypeTable,
  type Plugin,
} from "v-content";

import { SITE_URL } from "./app/lib/site-config.js";

import type { Element } from "hast";
import { visit } from "unist-util-visit";

const rehypeUCode: Plugin = function () {
  return (tree) => {
    visit(tree, "element", (node: Element, index: number, parent: Element) => {
      if (node.tagName !== "pre" || !parent || index == null) return;
      if (parent.tagName === "u-code") return;
      if (parent.tagName === "u-code-group") return;

      parent.children[index] = {
        type: "element",
        tagName: "u-code",
        properties: {},
        children: [node],
      };
    });
  };
};

const rehypeLink: Plugin = function () {
  return (tree) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "a") return;

      node.tagName = "u-prose-link";
    });
  };
};

const rehypeCode: Plugin = function () {
  return (tree) => {
    visit(tree, "element", (node: Element, index, parent?: Element) => {
      if (node.tagName !== "code") return;

      const isBlock = parent?.type === "element" && parent.tagName === "pre";
      if (isBlock) return;
      node.tagName = "u-prose-code";
    });
  };
};

function defineDocsCollection(locale: string, directory: string) {
  return defineCollection({
    type: "page",
    source: {
      include: `${directory}/**/*.md`,
      exclude: "**/*.draft.md",
      cwd: `docs/${locale}`,
    },
  });
}

function defineBlogCollection(locale: string) {
  return defineCollection({
    type: "page",
    source: {
      include: `**/*.md`,
      exclude: "**/*.draft.md",
      cwd: `blog/${locale}`,
    },
  });
}

function defineAuthorsCollection() {
  return defineCollection({
    type: "data",
    source: {
      include: "**/*.{json,yaml,yml}",
      exclude: "**/*.draft.{json,yaml,yml}",
      cwd: "authors",
    },
  });
}

function defineModulesCollection() {
  return defineCollection({
    type: "page",
    source: {
      include: "**/*.md",
      exclude: "**/*.draft.md",
      cwd: "modules",
    },
  });
}

export default defineConfig({
  // distdir: process.env.VERCEL ? "vercel-output" : ".output",

  head: {
    titleTemplate: "%s %separator %siteName",
    templateParams: {
      separator: "·",
      siteName: "Runable",
    },
    meta: [
      {
        name: "description",
        content: "All the Vue conventions. Your server runtime.",
      },
      {
        name: "algolia-site-verification",
        content: "F2949F185B8C208C",
      },
    ],
    link: [
      { rel: "icon", href: "/favicon.svg" },
      { rel: "describedby", href: `${SITE_URL}/llms.txt` },
    ],

    script: [
      {
        src: "https://analytics.runablejs.com/script.js",
        "data-website-id": "e4a19f03-efc1-4c28-8dfe-b4487114153a",
      },
      {
        src: "https://analytics.runablejs.com/recorder.js",
        "data-website-id": "e4a19f03-efc1-4c28-8dfe-b4487114153a",
      },
    ],
  },

  components: [
    { dirs: "./app/components/ui", prefix: "U", pathPrefix: false },
    { dirs: "./app/components/globals", prefix: "U", pathPrefix: false },
  ],

  css: ["./app/assets/css/main.css"],

  alias: {
    "~": join(import.meta.dirname, "./app"),
  },

  ssr: true,

  vite: {
    ...(process.env.RUNABLE_MODE === "production"
      ? { ssr: { noExternal: true, external: ["better-sqlite3"] } }
      : {}),

    plugins: [
      tailwindcss(),

      vContent({
        root: resolve(import.meta.dirname, "./content"),
        output: resolve(import.meta.dirname, ".app/content"),

        plugins: [
          [rehypeUCode],
          [rehypeLink],
          [rehypeCode],
          [rehypeTable, { extractData: true, componentName: "u-prose-table" }],
          [rehypeList, { extractData: true, componentName: "u-prose-list" }],
        ],

        collections: {
          gettingStarted: defineDocsCollection("en", "getting-started"),
          structure: defineDocsCollection("en", "structure"),
          guide: defineDocsCollection("en", "guide"),
          mcp: defineDocsCollection("en", "mcp"),
          integrations: defineDocsCollection("en", "integrations"),
          api: defineDocsCollection("en", "api"),

          blog: defineBlogCollection("en"),
          authors: defineAuthorsCollection(),
          modules: defineModulesCollection(),
        },
      }),
    ],

    server: {
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
      },
    },

    preview: {
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
      },
    },

    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },

    worker: { format: "es" },

    optimizeDeps: {
      include: ["extend"],
      exclude: ["@sqlite.org/sqlite-wasm"],
    },
  },
});
