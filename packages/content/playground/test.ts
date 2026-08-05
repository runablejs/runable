import { createServer, useConfig, requestNode } from "@syora/core";
import express from "express";
import { join } from "node:path";
import { ContentNotFoundError, defineCollection, initContent } from "../core";
import { resolveContentConfig } from "../core/collection/resolve";

const app = express();

const vite = await createServer();
const config = useConfig();

if (vite) app.use(vite.middlewares);
else {
  //   app.use(express.static(join(config.distDir, "client"), { extensions: [] }));
}

await initContent({
  collections: {
    docs: defineCollection({
      type: "page",
      source: {
        include: "docs/**/*.md",
        exclude: "docs/**/*.draft.md",
        // prefix: "/docs",
      },
      // schema: docSchema,
    }),

    authors: defineCollection({
      type: "data",
      source: "authors/**/*.yml",
      // pas de schema => data typée `unknown`
    }),
  },
  root: join(import.meta.dirname, "./content"),
  output: import.meta.dirname,
});

app.use("/", async (req, res) => {
  await requestNode({ vite, req, res });
});

app.listen(5173);
