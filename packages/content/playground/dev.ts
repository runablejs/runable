import { createServer, useConfig, serve } from "@syora/core";
import express from "express";
import { join } from "node:path";
import { ContentNotFoundError, defineCollection, initContent } from "../core";

const app = express();

const vite = await createServer();
const config = useConfig();

if (vite) app.use(vite.middlewares);
else {
  app.use(express.static(join(config.distDir, "client"), { extensions: [] }));
}

const { resolveContent } = await initContent({
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
  root: join(import.meta.dirname, "./content"),
  output: import.meta.dirname,
});

app.get("/api/content/:collection/*slugs", (req, res) => {
  try {
    res.json(resolveContent(req.params));
  } catch (err) {
    if (err instanceof ContentNotFoundError) {
      return res.status(404).json({ error: err.message });
    }
    throw err;
  }
});

app.use("*all", async (req, res) => {
  const html = await serve({ vite, url: req.originalUrl });
  res.status(200).set({ "Content-Type": "text/html" }).end(html);
});

app.listen(5173);
