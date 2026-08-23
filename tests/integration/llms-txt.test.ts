import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  assertNoDuplicateSlugs,
  buildLlmsTxt,
  buildPublicMarkdown,
  collectDocPages,
  DOCS_EN_ROOT,
  generateLlmsArtifacts,
  htmlUrl,
  markdownUrl,
  type DocPage,
} from "../../website/scripts/llms/generate.js";
import { llmsSections, type LlmsSection } from "../../website/scripts/llms/sections.js";

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

function extractLinks(markdown: string): { text: string; url: string }[] {
  return [...markdown.matchAll(LINK_RE)].map((m) => ({
    text: m[1],
    url: m[2],
  }));
}

let tmpDirs: string[] = [];

function makeTmpDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "runable-llms-test-"));
  tmpDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tmpDirs) rmSync(dir, { recursive: true, force: true });
  tmpDirs = [];
});

describe("llms.txt generation", () => {
  const pages = collectDocPages();
  const llmsTxt = buildLlmsTxt(pages);

  it("is not empty", () => {
    expect(llmsTxt.trim().length).toBeGreaterThan(0);
  });

  it("starts with the H1 project name, per llms.txt v2", () => {
    expect(llmsTxt.startsWith("# Runable\n")).toBe(true);
  });

  it("contains a blockquote summary", () => {
    expect(llmsTxt).toMatch(/^> .+/m);
  });

  it("stays small — a curated index, not a full documentation dump", () => {
    const sizeInKb = Buffer.byteLength(llmsTxt, "utf8") / 1024;
    expect(sizeInKb).toBeLessThan(20);
  });

  it("only lists slugs that exist in sections.ts (no accidental duplicates)", () => {
    const allSlugs = llmsSections.flatMap((s) => s.pages.map((p) => p.slug));
    expect(new Set(allSlugs).size).toBe(allSlugs.length);
  });

  it("excludes why-runable and vs-nuxt from the curated selection, but still exposes their .md", () => {
    const allSlugs = llmsSections.flatMap((s) => s.pages.map((p) => p.slug));

    expect(allSlugs).not.toContain("getting-started/why-runable");
    expect(allSlugs).not.toContain("getting-started/vs-nuxt");

    expect(pages.has("getting-started/why-runable")).toBe(true);
    expect(pages.has("getting-started/vs-nuxt")).toBe(true);
  });

  describe("links", () => {
    const links = extractLinks(llmsTxt);

    it("has links", () => {
      expect(links.length).toBeGreaterThan(0);
    });

    it("every link is a syntactically valid absolute URL", () => {
      for (const { url } of links) {
        expect(() => new URL(url)).not.toThrow();
      }
    });

    it("every doc link (site URL) points to a page that resolves to a real file", () => {
      const siteUrl = new URL(htmlUrl("")).origin;

      for (const { url } of links) {
        if (!url.startsWith(`${siteUrl}/docs/`)) continue;

        const slug = url
          .slice(`${siteUrl}/docs/`.length)
          .replace(/\.md$/, "");

        expect(
          pages.has(slug),
          `llms.txt links to "${url}" but "${slug}.md" does not exist under website/content/docs/en/`,
        ).toBe(true);
      }
    });

    it("every referenced doc page resolves to a Markdown file generate.ts can produce", () => {
      const siteUrl = new URL(htmlUrl("")).origin;
      const docLinks = links.filter((l) =>
        l.url.startsWith(`${siteUrl}/docs/`),
      );
      expect(docLinks.length).toBeGreaterThan(0);

      for (const { url } of docLinks) {
        expect(url.endsWith(".md")).toBe(true);

        const slug = url.slice(`${siteUrl}/docs/`.length).replace(/\.md$/, "");
        const page = pages.get(slug);
        expect(page).toBeDefined();
        expect(markdownUrl(slug)).toBe(url);
      }
    });
  });

  it("fails loudly when sections.ts references a page that no longer exists", () => {
    const brokenPages = new Map(pages);
    const firstSlug = llmsSections[0].pages[0].slug;
    brokenPages.delete(firstSlug);

    expect(() => buildLlmsTxt(brokenPages)).toThrow(/no matching file exists/);
  });

  it("the real sections.ts has no duplicate slugs", () => {
    expect(() => assertNoDuplicateSlugs(llmsSections)).not.toThrow();
  });

  it("detects a slug duplicated across two different sections", () => {
    const withDuplicate: LlmsSection[] = [
      { title: "Core Concepts", pages: [{ slug: "guide/plugins" }] },
      { title: "Extending Runable", pages: [{ slug: "guide/plugins" }] },
    ];

    expect(() => assertNoDuplicateSlugs(withDuplicate)).toThrow(
      /guide\/plugins.*Core Concepts.*Extending Runable/s,
    );
  });

  it("detects a slug duplicated twice within the same section", () => {
    const withDuplicate: LlmsSection[] = [
      {
        title: "Core Concepts",
        pages: [{ slug: "guide/routing" }, { slug: "guide/routing" }],
      },
    ];

    expect(() => assertNoDuplicateSlugs(withDuplicate)).toThrow(/guide\/routing/);
  });
});

describe("public Markdown pages", () => {
  const pages = collectDocPages();

  it("collects pages from website/content/docs/en/ only", () => {
    expect(pages.size).toBeGreaterThan(0);
    for (const slug of pages.keys()) {
      expect(slug).not.toContain("..");
    }
    expect(DOCS_EN_ROOT).toMatch(/[\\/]content[\\/]docs[\\/]en$/);
  });

  it("every page has a title", () => {
    for (const page of pages.values()) {
      expect(page.title.length).toBeGreaterThan(0);
    }
  });

  it("renders a clean Markdown document starting with the page's H1 title", () => {
    const page = pages.get("guide/routing") as DocPage;
    expect(page).toBeDefined();

    const md = buildPublicMarkdown(page);
    expect(md.startsWith(`# ${page.title}`)).toBe(true);
  });

  it("does not contain site navigation/layout HTML", () => {
    const page = pages.get("guide/routing") as DocPage;
    const md = buildPublicMarkdown(page);

    for (const marker of [
      "<html",
      "<head",
      "<body",
      "data-slot=\"docs-skeleton\"",
      "SidebarProvider",
      "<nav",
    ]) {
      expect(md).not.toContain(marker);
    }
  });
});

describe("generateLlmsArtifacts", () => {
  it("writes llms.txt and a .md file per doc page into the given output directory", () => {
    const outDir = makeTmpDir();
    const result = generateLlmsArtifacts(outDir);

    expect(existsSync(join(outDir, "llms.txt"))).toBe(true);
    expect(result.markdownPaths.length).toBe(result.pages.size);

    const routingMdPath = join(outDir, "docs", "guide", "routing.md");
    expect(existsSync(routingMdPath)).toBe(true);

    const content = readFileSync(routingMdPath, "utf8");
    expect(content.startsWith("# Routing")).toBe(true);
  });

  it("every Markdown path returned actually exists on disk", () => {
    const outDir = makeTmpDir();
    const { markdownPaths } = generateLlmsArtifacts(outDir);

    for (const path of markdownPaths) {
      expect(existsSync(path)).toBe(true);
    }
  });
});
