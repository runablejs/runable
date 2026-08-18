import { join, resolve } from "node:path";

import tailwindcss from "@tailwindcss/vite";
import vContent from "v-content/vite";

import { defineConfig } from "../packages/core/src/index.js";
import {
  defineCollection,
  rehypeList,
  rehypeTable,
  type Plugin,
} from "v-content";

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

export default defineConfig({
  modules: ["./modules/i18n"],

  head: {
    title: "Syora",

    link: [{ rel: "icon", href: "/favicon.svg" }],
  },

  components: [
    { dirs: "./app/components/ui", prefix: "U", pathPrefix: false },
    { dirs: "./app/components/globals", prefix: "U", pathPrefix: false },
  ],

  css: ["./app/assets/css/main.css"],

  alias: {
    "@": join(import.meta.dirname, "../packages/core/src"),
    "~": join(import.meta.dirname, "./app"),
  },

  ssr: false,

  vite: {
    plugins: [
      tailwindcss(),

      vContent({
        root: resolve(import.meta.dirname, "../docs_v2"),
        output: resolve(import.meta.dirname, ".app/content"),

        plugins: [
          [rehypeUCode],
          [rehypeLink],
          [rehypeCode],
          [rehypeTable, { extractData: true, componentName: "u-prose-table" }],
          [rehypeList, { extractData: true, componentName: "u-prose-list" }],
        ],

        collections: {
          gettingStarted: defineCollection({
            type: "page",
            source: {
              include: "getting-started/**/*.md",
              exclude: "**/*.draft.md",
            },
          }),

          structure: defineCollection({
            type: "page",
            source: {
              include: "structure/**/*.md",
              exclude: "**/*.draft.md",
            },
          }),

          guide: defineCollection({
            type: "page",
            source: {
              include: "guide/**/*.md",
              exclude: "**/*.draft.md",
            },
          }),

          integrations: defineCollection({
            type: "page",
            source: {
              include: "integrations/**/*.md",
              exclude: "**/*.draft.md",
            },
          }),

          api: defineCollection({
            type: "page",
            source: {
              include: "api/**/*.md",
              exclude: "**/*.draft.md",
            },
          }),
        },
      }),
    ],
  },

  i18n: {
    locales: [
      { code: "fr", name: "Français", file: "fr.json" },
      { code: "en", name: "English", file: "en.json" },
    ],
    defaultLocale: "fr",
    strategy: "prefix_and_default",
    persistence: "cookie",
  },
});
