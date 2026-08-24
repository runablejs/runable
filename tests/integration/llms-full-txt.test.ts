import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  buildLlmsFullTxt,
  collectDocPages,
  generateLlmsArtifacts,
  LLMS_FULL_EXCLUDED_SLUGS,
} from "../../website/scripts/llms/generate.js";

/** Strips fenced code blocks before scanning for headings, so a literal
 * `# comment` inside a ```dotenv example (see structure/env.md) isn't
 * mistaken for a Markdown heading. */
function withoutCodeFences(markdown: string): string {
  return markdown.replace(/```[\s\S]*?```/g, "");
}

function countTopLevelHeadings(markdown: string): number {
  return (withoutCodeFences(markdown).match(/^# .+$/gm) ?? []).length;
}

const CATEGORY_DIRS = [
  "getting-started",
  "guide",
  "structure",
  "integrations",
  "api",
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Counts whole `### <title>` heading lines — a naive substring count would
 * false-positive when one title is a prefix of another (e.g. "useApp" is a
 * substring of the "useAppError" heading). */
function countHeadingOccurrences(markdown: string, title: string): number {
  const re = new RegExp(`^### ${escapeRegExp(title)}$`, "gm");
  return (markdown.match(re) ?? []).length;
}

describe("llms-full.txt generation", () => {
  const pages = collectDocPages();
  const llmsFullTxt = buildLlmsFullTxt(pages);

  it("is not empty", () => {
    expect(llmsFullTxt.trim().length).toBeGreaterThan(0);
  });

  it("starts with the single H1 project name", () => {
    expect(llmsFullTxt.startsWith("# Runable\n")).toBe(true);
  });

  it("contains exactly one top-level heading in the whole document", () => {
    expect(countTopLevelHeadings(llmsFullTxt)).toBe(1);
  });

  it("contains all five category sections", () => {
    for (const title of [
      "## Getting Started",
      "## Core Concepts",
      "## Application Structure",
      "## Server Integrations",
      "## API Reference",
    ]) {
      expect(llmsFullTxt).toContain(title);
    }
  });

  it("includes at least one real page from each category as a ### section", () => {
    expect(llmsFullTxt).toContain("### Installation"); // getting-started
    expect(llmsFullTxt).toContain("### Routing"); // guide
    expect(llmsFullTxt).toContain("### runable.config.ts"); // structure
    expect(llmsFullTxt).toContain("### Express"); // integrations
    expect(llmsFullTxt).toContain("### useAsyncData"); // api
  });

  it("contains no leaked YAML frontmatter block from any source file", () => {
    // A real leaked frontmatter block looks like an opening "---" fence
    // immediately followed by a "title:" field — unlike a bare "---" line,
    // which is legitimate Markdown (a horizontal rule) and does appear in
    // some page bodies.
    expect(llmsFullTxt).not.toMatch(/^---\r?\ntitle:/m);
  });

  it("contains no website-engine-specific syntax outside fenced code blocks", () => {
    const withoutFences = llmsFullTxt.replace(/```[\s\S]*?```/g, "");

    expect(withoutFences).not.toContain("::u-tip");
    expect(withoutFences).not.toContain("::u-code-group");
    expect(withoutFences).not.toContain("<u-icon");
    expect(withoutFences).not.toMatch(/^variant:/m);
    expect(withoutFences).not.toContain('class="py-');
  });

  it("nests a page's own headings under its ### wrapper instead of making them siblings of the category", () => {
    // getting-started/installation.md has "## Prerequisites" in its body.
    const installationIndex = llmsFullTxt.indexOf("### Installation");
    expect(installationIndex).toBeGreaterThan(-1);

    const nextPageIndex = llmsFullTxt.indexOf(
      "### Quick Start",
      installationIndex,
    );
    const installationSection = llmsFullTxt.slice(
      installationIndex,
      nextPageIndex,
    );

    expect(installationSection).toContain("#### Prerequisites");
    expect(installationSection).not.toMatch(/^## Prerequisites$/m);
  });

  it("converts a real admonition and a real internal link from the source docs", () => {
    // getting-started/installation.md ends with a "::u-tip" (title "Alpha
    // CLI") and an <a href="/docs/getting-started/quickstart.md"> link.
    expect(llmsFullTxt).toContain("> **Alpha CLI:**");
    expect(llmsFullTxt).toContain(
      "[Quick Start](https://runablejs.com/docs/getting-started/quickstart.md)",
    );
  });
});

describe("llms-full.txt navigation-only index pages", () => {
  const pages = collectDocPages();
  const llmsFullTxt = buildLlmsFullTxt(pages);

  it("excludes guide/index.md, integrations/index.md, and api/index.md — purely navigational, no unique content", () => {
    expect(LLMS_FULL_EXCLUDED_SLUGS).toEqual(
      new Set(["guide/index", "integrations/index", "api/index"]),
    );

    for (const slug of LLMS_FULL_EXCLUDED_SLUGS) {
      const page = pages.get(slug);
      expect(
        page,
        `expected ${slug} to still exist as a source page`,
      ).toBeDefined();
      expect(countHeadingOccurrences(llmsFullTxt, page!.title)).toBe(0);
    }
  });

  it("keeps other index pages that were inspected and found to hold real content", () => {
    // structure/index.md has a unique directory-tree diagram; the api/*
    // sub-index pages have reference tables not repeated elsewhere and no
    // links to already-included pages — none of these are pure navigation.
    for (const slug of [
      "structure/index",
      "api/components/index",
      "api/composables/index",
      "api/globals/index",
    ]) {
      expect(LLMS_FULL_EXCLUDED_SLUGS.has(slug)).toBe(false);

      const page = pages.get(slug);
      expect(page, `expected ${slug} to exist`).toBeDefined();
      expect(countHeadingOccurrences(llmsFullTxt, page!.title)).toBe(1);
    }
  });
});

describe("llms-full.txt exhaustiveness", () => {
  const pages = collectDocPages();
  const llmsFullTxt = buildLlmsFullTxt(pages);

  it("includes every non-excluded page from the five technical categories exactly once", () => {
    const technicalPages = [...pages.values()].filter(
      (page) =>
        CATEGORY_DIRS.includes(page.slug.split("/")[0]) &&
        !LLMS_FULL_EXCLUDED_SLUGS.has(page.slug),
    );
    expect(technicalPages.length).toBeGreaterThan(0);

    for (const page of technicalPages) {
      const occurrences = countHeadingOccurrences(llmsFullTxt, page.title);

      expect(
        occurrences,
        `expected exactly one "### ${page.title}" section for ${page.slug}`,
      ).toBe(1);
    }
  });

  it("does not require an allow-list — an extra page in an included category is picked up automatically", () => {
    const extraSlug = "guide/__test-only-extra-page";
    const withExtra = new Map(pages);
    withExtra.set(extraSlug, {
      slug: extraSlug,
      title: "Test Only Extra Page",
      description: "",
      body: "Some body content.",
    });

    const result = buildLlmsFullTxt(withExtra);
    expect(result).toContain("### Test Only Extra Page");
  });
});

describe("llms-full.txt exclusions", () => {
  it("does not include a page from a category outside the five technical ones", () => {
    const pages = collectDocPages();
    const withOutsider = new Map(pages);
    const outsiderSlug = "blog-like-section/some-page";
    withOutsider.set(outsiderSlug, {
      slug: outsiderSlug,
      title: "Should Not Appear",
      description: "",
      body: "This page is outside the included categories.",
    });

    const result = buildLlmsFullTxt(withOutsider);
    expect(result).not.toContain("Should Not Appear");
  });
});

describe("llms-full.txt determinism", () => {
  it("produces byte-identical output across two successive generations from the same sources", () => {
    const first = buildLlmsFullTxt(collectDocPages());
    const second = buildLlmsFullTxt(collectDocPages());

    expect(first).toBe(second);
  });
});

describe("generateLlmsArtifacts writes llms-full.txt", () => {
  let outDir: string | undefined;

  afterEach(() => {
    if (outDir) rmSync(outDir, { recursive: true, force: true });
    outDir = undefined;
  });

  it("returns llms-full.txt content and a path consistent with buildLlmsFullTxt", () => {
    outDir = mkdtempSync(join(tmpdir(), "runable-llms-full-test-"));

    const result = generateLlmsArtifacts(outDir);
    const expected = buildLlmsFullTxt(result.pages);

    expect(result.llmsFullTxt).toBe(expected);
    expect(result.llmsFullTxtPath.endsWith("llms-full.txt")).toBe(true);

    const written = readFileSync(result.llmsFullTxtPath, "utf8");
    expect(written).toBe(expected);
  });
});
