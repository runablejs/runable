import { express } from "runable/adapters/express";
import Express from "express";
import type { NextFunction, Request, Response } from "express";
import {
  buildPublicMarkdown,
  collectDocPages,
  type DocPage,
} from "./scripts/llms/generate.js";

const app = Express();
let documentationPages: Map<string, DocPage> | undefined;

app.get(
  "/raw/docs/{*slugs}",
  async (req: Request, res: Response, next: NextFunction) => {
    // Production builds expose pre-generated files at this path. Let Runable's
    // static handler serve them instead of reading source files at runtime.
    if (process.env.RUNABLE_MODE === "production") {
      res.setHeader("Content-Type", "text/markdown; charset=utf-8");
      return next();
    }

    let slug: string;
    try {
      slug = decodeURIComponent(req.path.slice("/raw/docs/".length))
        .replace(/^\/+|\/+$/g, "")
        .replace(/\.md$/, "");
    } catch {
      return res.status(404).send();
    }

    if (!slug || slug.split("/").includes("..")) return res.status(404).send();

    documentationPages ??= collectDocPages();
    const page =
      documentationPages.get(slug) ?? documentationPages.get(`${slug}/index`);

    if (!page) return res.status(404).send();

    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.send(buildPublicMarkdown(page));
  },
);

app.get("/api/health", (_req: Request, res: Response) => {
  return res.json({ status: "ok" });
});

app.use(express());

export default app;
