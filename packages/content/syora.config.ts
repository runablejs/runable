import { defineModule } from "@syora/core";
import {
  ContentConfig,
  defineCollection,
  defineContentConfig,
  resolveContentConfig,
  saveCollections,
} from "./core";
import { join } from "node:path";
import Database from "better-sqlite3";

export default defineModule<ContentConfig>({
  appDir: "playground/app",

  modules: ["./playground/module"],

  meta: {},

  configKey: "content",

  content: {
    collections: {
      docs: defineCollection({
        type: "page",
        source: {
          include: "docs/**/*.md",
          exclude: "docs/**/*.draft.md",
          prefix: "/docs",
        },
        // schema: docSchema,
      }),

      authors: defineCollection({
        type: "data",
        source: "authors/**/*.yml",
        // pas de schema => data typée `unknown`
      }),
    },
    root: join(import.meta.dirname, "playground"),
    output: join(import.meta.dirname, "playground"),
  },

  async setup(options, config) {
    // const _config = defineContentConfig(options);
    // _config.output ??= process.cwd();
    // _config.root ??= join(process.cwd(), "content");
    // const collections = await resolveContentConfig(_config, {
    //   root: _config.root,
    // });
    // const db = new Database(join(config.output, ".content.sqlite"));
    // saveCollections(db, collections);
  },
});
