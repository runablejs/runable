import { writeFile } from "node:fs/promises";
import { join } from "node:path";

import { useConfig, build } from "runable";

import { generateLlmsArtifacts } from "./scripts/llms/generate.js";
import { SITE_URL } from "./app/lib/site-config.js";

await build();

const config = useConfig();
await writeFile(
  join(config.distdir, "server", "package.json"),
  `${JSON.stringify({ type: "module" }, null, 2)}\n`,
);
const clientDir = join(config.distdir, "client");
const { pages, llmsTxtPath, llmsFullTxtPath, markdownPaths } =
  generateLlmsArtifacts(clientDir);

const sitemapRoutes = [
  "",
  "/about",
  "/blog",
  "/changelog",
  "/docs",
  "/why-runable",
  ...[...pages.keys()].map((slug) => `/docs/${slug}`),
];
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...sitemapRoutes.map(
    (route) => `  <url><loc>${SITE_URL}${route}</loc></url>`,
  ),
  "</urlset>",
  "",
].join("\n");

await Promise.all([
  writeFile(join(clientDir, "sitemap.xml"), sitemap),
  writeFile(
    join(clientDir, "robots.txt"),
    `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`,
  ),
]);

console.log(
  `✅ Generated ${llmsTxtPath}, ${llmsFullTxtPath}, and ${markdownPaths.length} Markdown doc pages`,
);
