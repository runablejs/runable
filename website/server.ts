import { hono } from "runable/adapters/hono";
import { Hono } from "hono";
import {
  buildPublicMarkdown,
  collectDocPages,
  type DocPage,
} from "./scripts/llms/generate.js";

const app = new Hono();
let documentationPages: Map<string, DocPage> | undefined;

app.get("/raw/docs/*", async (context, next) => {
  // Production builds expose pre-generated files at this path. Let Runable's
  // static handler serve them instead of reading source files at runtime.
  if (process.env.RUNABLE_MODE === "production") return next();

  let slug: string;
  try {
    slug = decodeURIComponent(context.req.path.slice("/raw/docs/".length))
      .replace(/^\/+|\/+$/g, "")
      .replace(/\.md$/, "");
  } catch {
    return context.notFound();
  }

  if (!slug || slug.split("/").includes("..")) return context.notFound();

  documentationPages ??= collectDocPages();
  const page =
    documentationPages.get(slug) ?? documentationPages.get(`${slug}/index`);

  if (!page) return context.notFound();

  return context.body(buildPublicMarkdown(page), 200, {
    "Content-Type": "text/markdown; charset=utf-8",
  });
});

app.get("/api/health", (context) => {
  return context.json({ status: "ok" });
});

app.use("*", hono());

export default app;
