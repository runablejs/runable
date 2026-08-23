import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { SITE_URL } from "../../app/lib/site-config.js";
import { parseFrontmatter } from "./frontmatter.js";
import { getNavOrderIndex } from "./nav-order.js";
import { llmsSections, type LlmsSection } from "./sections.js";

/** Doc categories included in llms-full.txt, in output order — every page
 * under website/content/docs/en/<category>/** is included automatically,
 * no allow-list. Anything outside these top-level folders (if any are ever
 * added) is excluded. */
const LLMS_FULL_CATEGORIES: { dir: string; title: string }[] = [
  { dir: "getting-started", title: "Getting Started" },
  { dir: "guide", title: "Core Concepts" },
  { dir: "structure", title: "Application Structure" },
  { dir: "integrations", title: "Server Integrations" },
  { dir: "api", title: "API Reference" },
];

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));

/** The single official source for llms.txt: EN docs are the technical
 * reference. FR is intentionally excluded, see AGENTS.md. */
export const DOCS_EN_ROOT = join(SCRIPT_DIR, "../../content/docs/en");

export interface DocPage {
  slug: string;
  title: string;
  description: string;
  body: string;
}

function listMarkdownFiles(dir: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);

    if (entry.isDirectory()) files.push(...listMarkdownFiles(full));
    else if (entry.name.endsWith(".md")) files.push(full);
  }

  return files;
}

function toSlug(filePath: string): string {
  return relative(DOCS_EN_ROOT, filePath)
    .replace(/\.md$/, "")
    .split(/[\\/]/)
    .join("/");
}

/** Reads every EN doc page from disk and indexes it by slug. Throws if a
 * page has no `title` in its frontmatter — llms.txt links need one. */
export function collectDocPages(): Map<string, DocPage> {
  const pages = new Map<string, DocPage>();

  for (const file of listMarkdownFiles(DOCS_EN_ROOT)) {
    const slug = toSlug(file);
    const { title, description, body } = parseFrontmatter(
      readFileSync(file, "utf8"),
    );

    if (!title) {
      throw new Error(
        `Documentation page is missing a "title" in its frontmatter: ${file}`,
      );
    }

    pages.set(slug, { slug, title, description: description ?? "", body });
  }

  return pages;
}

export function htmlUrl(slug: string): string {
  return `${SITE_URL}/docs/${slug}`;
}

export function markdownUrl(slug: string): string {
  return `${SITE_URL}/docs/${slug}.md`;
}

/** Throws if the same slug is listed in more than one section (or twice in
 * the same one) — each page belongs in exactly one place in llms.txt. */
export function assertNoDuplicateSlugs(sections: LlmsSection[]): void {
  const sectionsBySlug = new Map<string, string[]>();

  for (const section of sections) {
    for (const ref of section.pages) {
      const titles = sectionsBySlug.get(ref.slug) ?? [];
      titles.push(section.title);
      sectionsBySlug.set(ref.slug, titles);
    }
  }

  const duplicates = [...sectionsBySlug.entries()].filter(
    ([, titles]) => titles.length > 1,
  );
  if (duplicates.length === 0) return;

  const details = duplicates
    .map(([slug, titles]) => `"${slug}" (in: ${titles.join(", ")})`)
    .join("; ");

  throw new Error(
    `website/scripts/llms/sections.ts lists the same page more than once — ` +
      `each slug must appear in exactly one section. Duplicated: ${details}.`,
  );
}

/** Builds the llms.txt content. Throws if `llmsSections` lists the same
 * slug twice (see `assertNoDuplicateSlugs`), or references a slug that
 * doesn't resolve to a real page, so a renamed/removed doc page fails the
 * build instead of publishing a dead link (see sections.ts). */
export function buildLlmsTxt(pages: Map<string, DocPage>): string {
  assertNoDuplicateSlugs(llmsSections);

  const lines: string[] = [];

  lines.push("# Runable");
  lines.push("");
  lines.push(
    "> Runable is a Vue framework that adds file-based routing, layouts, SSR, auto-imports, modules, and application tooling on top of Vue and Vite, while letting you keep the backend runtime you already use.",
  );
  lines.push("");
  lines.push(
    "Runable does not provide its own HTTP runtime. Applications run with Express, Fastify, NestJS, AdonisJS, Hono, Koa, Bun, Deno, or a custom server — Runable mounts as the last handler and serves the Vue application.",
  );
  lines.push("");
  lines.push(
    "Generated files under `.app/` and `.output/` are build output. Never edit them directly — change the source files or `runable.config.ts` and rebuild.",
  );

  for (const section of llmsSections) {
    lines.push("");
    lines.push(`## ${section.title}`);
    lines.push("");

    for (const ref of section.pages) {
      const page = pages.get(ref.slug);

      if (!page) {
        throw new Error(
          `website/scripts/llms/sections.ts references "${ref.slug}" in section "${section.title}", ` +
            `but no matching file exists under website/content/docs/en/. Update sections.ts.`,
        );
      }

      const description = ref.description ?? page.description;
      const suffix = description ? `: ${description}` : "";

      lines.push(`- [${page.title}](${markdownUrl(page.slug)})${suffix}`);
    }
  }

  lines.push("");
  lines.push("## Resources");
  lines.push("");
  lines.push(
    "- [GitHub repository](https://github.com/runablejs/runable): Source code, issues, and releases.",
  );
  lines.push("");

  return lines.join("\n");
}

/** Public Markdown representation of a page: clean `# Title` + description
 * + body, no CMS frontmatter — this is what `<slug>.md` serves. */
export function buildPublicMarkdown(page: DocPage): string {
  const description = page.description ? `\n\n${page.description}` : "";
  return `# ${page.title}${description}\n\n${page.body.trim()}\n`;
}

function pageCategory(slug: string): string {
  return slug.split("/")[0];
}

/** Orders pages within a llms-full.txt category: by their position in the
 * site's sidebar nav when known (see nav-order.ts), then alphabetically by
 * slug for any page the nav doesn't link (e.g. category index pages) — so
 * the order stays fully deterministic even for pages outside the nav. */
function comparePages(
  a: DocPage,
  b: DocPage,
  navOrder: Map<string, number>,
): number {
  const aIndex = navOrder.get(a.slug);
  const bIndex = navOrder.get(b.slug);

  if (aIndex !== undefined && bIndex !== undefined) return aIndex - bIndex;
  if (aIndex !== undefined) return -1;
  if (bIndex !== undefined) return 1;

  return a.slug.localeCompare(b.slug);
}

/** Builds llms-full.txt: the complete EN technical documentation
 * (getting-started/, guide/, structure/, integrations/, api/) as one
 * Markdown document. Unlike llms.txt, this is exhaustive — every page in
 * those categories is included automatically, no allow-list — so adding a
 * new page under one of them requires no change here. There is exactly one
 * `# ` heading in the whole document; each page becomes a `###` section
 * using the same `title`/`description`/`body` already extracted by
 * `collectDocPages()`. */
export function buildLlmsFullTxt(pages: Map<string, DocPage>): string {
  const navOrder = getNavOrderIndex();
  const lines: string[] = [];

  lines.push("# Runable");
  lines.push("");
  lines.push("> Complete technical documentation for Runable.");
  lines.push("");
  lines.push(
    "Runable does not provide its own HTTP runtime. Your backend remains the application entry point and delegates frontend requests to Runable through an adapter.",
  );
  lines.push("");
  lines.push(
    "Generated files under `.app/` and `.output/` are build output. Never edit them directly — change the application source, configuration, or module that generates them and rebuild.",
  );

  for (const category of LLMS_FULL_CATEGORIES) {
    const categoryPages = [...pages.values()]
      .filter((page) => pageCategory(page.slug) === category.dir)
      .sort((a, b) => comparePages(a, b, navOrder));

    if (categoryPages.length === 0) continue;

    lines.push("");
    lines.push(`## ${category.title}`);

    for (const page of categoryPages) {
      const body = page.body.trim();
      const description = page.description;
      // Skip the description when the body already opens with it verbatim,
      // to avoid printing the same sentence twice in a row.
      const includeDescription = description && !body.startsWith(description);

      lines.push("");
      lines.push(`### ${page.title}`);

      if (includeDescription) {
        lines.push("");
        lines.push(description);
      }

      lines.push("");
      lines.push(body);
    }
  }

  lines.push("");

  return lines.join("\n");
}

export interface GenerateResult {
  pages: Map<string, DocPage>;
  llmsTxt: string;
  llmsTxtPath: string;
  llmsFullTxt: string;
  llmsFullTxtPath: string;
  markdownPaths: string[];
}

/** Generates `llms.txt`, `llms-full.txt`, and a clean `.md` copy of every
 * EN doc page into `outDir` (the site's build output, e.g.
 * `.output/client`) — all three read `website/content/docs/en/` exactly
 * once via `collectDocPages()`. */
export function generateLlmsArtifacts(outDir: string): GenerateResult {
  const pages = collectDocPages();
  const llmsTxt = buildLlmsTxt(pages);
  const llmsFullTxt = buildLlmsFullTxt(pages);

  mkdirSync(outDir, { recursive: true });

  const llmsTxtPath = join(outDir, "llms.txt");
  writeFileSync(llmsTxtPath, llmsTxt, "utf8");

  const llmsFullTxtPath = join(outDir, "llms-full.txt");
  writeFileSync(llmsFullTxtPath, llmsFullTxt, "utf8");

  const markdownPaths: string[] = [];
  for (const page of pages.values()) {
    const target = join(outDir, "docs", `${page.slug}.md`);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, buildPublicMarkdown(page), "utf8");
    markdownPaths.push(target);
  }

  return {
    pages,
    llmsTxt,
    llmsTxtPath,
    llmsFullTxt,
    llmsFullTxtPath,
    markdownPaths,
  };
}
