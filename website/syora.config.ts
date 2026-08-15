import { join, resolve } from "node:path";

import tailwindcss from "@tailwindcss/vite";
import vContent from "v-content/vite";

import { defineConfig } from "../packages/core/src/index.js";
import { defineCollection, type Plugin } from "v-content";

import { Element } from "hast";
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

export default defineConfig({
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

  ssr: true,

  vite: {
    plugins: [
      tailwindcss(),

      // vContent({
      //   root: resolve(import.meta.dirname, "../docs/fr"),
      //   output: resolve(import.meta.dirname, ".app/content"),

      //   plugins: [rehypeUCode],
      //   collections: {
      //     docs: defineCollection({
      //       type: "page",
      //       source: {
      //         include: "**/*.md",
      //         exclude: "**/*.draft.md",
      //         // prefix: "/docs",
      //       },
      //       // schema: docSchema,
      //     }),
      //   },
      // }),
    ],
  },
});
