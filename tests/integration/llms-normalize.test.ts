import { describe, expect, it } from "vitest";

import {
  normalizeAdmonitions,
  normalizeDecorativeHtml,
  normalizeLinks,
  normalizeLlmsMarkdown,
  shiftHeadings,
  stripCodeGroupContainers,
} from "../../website/scripts/llms/normalize.js";

const SITE_URL = "https://runable.netlify.app";

describe("shiftHeadings", () => {
  it("shifts an H2 to H4 (## -> ####)", () => {
    expect(shiftHeadings("## Prerequisites", 2)).toBe("#### Prerequisites");
  });

  it("shifts an H3 to H5 (### -> #####)", () => {
    expect(shiftHeadings("### Node.js", 2)).toBe("##### Node.js");
  });

  it("leaves headings inside a fenced code block untouched", () => {
    const input = ["Text before.", "```md", "# Not a real heading", "## Also not", "```", "## Real heading"].join(
      "\n",
    );

    const result = shiftHeadings(input, 2);

    expect(result).toContain("# Not a real heading");
    expect(result).toContain("## Also not");
    expect(result).toContain("#### Real heading");
  });

  it("preserves relative hierarchy across multiple nested levels", () => {
    const input = ["# Top", "## Second", "### Third"].join("\n");
    const result = shiftHeadings(input, 2).split("\n");

    expect(result[0]).toBe("### Top");
    expect(result[1]).toBe("#### Second");
    expect(result[2]).toBe("##### Third");
  });

  it("clamps at level 6 instead of producing invalid Markdown", () => {
    expect(shiftHeadings("##### Deep", 2)).toBe("###### Deep");
    expect(shiftHeadings("###### Deepest", 2)).toBe("###### Deepest");
  });

  it("does not treat a line without a space after # as a heading", () => {
    expect(shiftHeadings("#no-space-not-a-heading", 2)).toBe("#no-space-not-a-heading");
  });
});

describe("normalizeAdmonitions", () => {
  it("converts a simple single-paragraph admonition to a blockquote", () => {
    const input = [
      "::u-tip",
      "---",
      "variant: warning",
      "title: Alpha project",
      "---",
      "",
      "Runable is currently in alpha.",
      "",
      "::",
    ].join("\n");

    expect(normalizeAdmonitions(input)).toBe(
      "> **Alpha project:** Runable is currently in alpha.",
    );
  });

  it("converts a multi-paragraph admonition, separating paragraphs with a bare '>' line", () => {
    const input = [
      "::u-tip",
      "---",
      "variant: info",
      "title: Two paragraphs",
      "---",
      "",
      "First paragraph.",
      "",
      "Second paragraph.",
      "",
      "::",
    ].join("\n");

    expect(normalizeAdmonitions(input)).toBe(
      ["> **Two paragraphs:** First paragraph.", ">", "> Second paragraph."].join("\n"),
    );
  });

  it("omits the bold prefix when no title is present", () => {
    const input = [
      "::u-tip",
      "---",
      "variant: info",
      "---",
      "",
      "No title here.",
      "",
      "::",
    ].join("\n");

    expect(normalizeAdmonitions(input)).toBe("> No title here.");
  });

  it("drops the variant without leaking it into the output", () => {
    const input = [
      "::u-tip",
      "---",
      "variant: destructive",
      "title: Danger",
      "---",
      "",
      "Be careful.",
      "",
      "::",
    ].join("\n");

    const result = normalizeAdmonitions(input);
    expect(result).not.toContain("variant");
    expect(result).not.toContain("destructive");
    expect(result).toBe("> **Danger:** Be careful.");
  });

  it("preserves inline code inside the admonition content", () => {
    const input = [
      "::u-tip",
      "---",
      "variant: warning",
      "title: CLI",
      "---",
      "",
      "The `create-runable` command exists but is evolving.",
      "",
      "::",
    ].join("\n");

    expect(normalizeAdmonitions(input)).toContain("`create-runable`");
  });

  it("converts every admonition when a page has several", () => {
    const input = [
      "::u-tip",
      "---",
      "variant: info",
      "title: First",
      "---",
      "",
      "First body.",
      "",
      "::",
      "",
      "## Some heading",
      "",
      "::u-tip",
      "---",
      "variant: warning",
      "title: Second",
      "---",
      "",
      "Second body.",
      "",
      "::",
    ].join("\n");

    const result = normalizeAdmonitions(input);
    expect(result).not.toContain("::u-tip");
    expect(result).toContain("> **First:** First body.");
    expect(result).toContain("> **Second:** Second body.");
  });

  it("leaves an admonition-like block inside a fenced code block untouched", () => {
    const input = ["```md", "::u-tip", "---", "title: Example", "---", "", "Body.", "", "::", "```"].join("\n");

    expect(normalizeAdmonitions(input)).toBe(input);
  });
});

describe("stripCodeGroupContainers", () => {
  it("removes the wrapper lines but keeps the fenced code blocks", () => {
    const input = [
      "::u-code-group",
      "",
      "```bash [pnpm]",
      "pnpm add runable",
      "```",
      "",
      "```bash [npm]",
      "npm install runable",
      "```",
      "",
      "::",
    ].join("\n");

    const result = stripCodeGroupContainers(input);
    expect(result).not.toContain("::u-code-group");
    expect(result).not.toContain("::");
    expect(result).toContain("pnpm add runable");
    expect(result).toContain("npm install runable");
  });
});

describe("normalizeDecorativeHtml", () => {
  it("converts the known <u-icon>+<span> list pattern into a Markdown list", () => {
    const input = [
      '<div class="py-3 space-y-2">',
      '  <div class="flex flex-wrap items-center gap-2"><u-icon name="tabler:circle-1-filled" class="size-5"></u-icon><span>first item;</span></div>',
      '  <div class="flex flex-wrap items-center gap-2"><u-icon name="tabler:circle-2-filled" class="size-5"></u-icon><span>second item.</span></div>',
      "</div>",
    ].join("\n");

    const result = normalizeDecorativeHtml(input);

    expect(result).not.toContain("<u-icon");
    expect(result).not.toContain('class="');
    expect(result).toBe(["- first item;", "- second item."].join("\n"));
  });

  it("maps <strong> and <code> inside the item text to Markdown", () => {
    const input = [
      '<div class="py-3 space-y-2">',
      '  <div class="flex items-center"><u-icon name="x"></u-icon><span>you already have a <strong>production backend</strong>;</span></div>',
      '  <div class="flex items-center"><u-icon name="x"></u-icon><span><code>useAsyncData()</code> waits for data;</span></div>',
      "</div>",
    ].join("\n");

    const result = normalizeDecorativeHtml(input);
    expect(result).toContain("**production backend**");
    expect(result).toContain("`useAsyncData()`");
    expect(result).not.toContain("<strong>");
    expect(result).not.toContain("<code>");
  });

  it("leaves an unrecognized div untouched rather than guessing", () => {
    const input = '<div class="shell"><header>My application</header></div>';
    expect(normalizeDecorativeHtml(input)).toBe(input);
  });

  it("does not touch HTML shown inside a fenced code block", () => {
    const input = ["```vue", "<div>", "  <header>My application</header>", "</div>", "```"].join("\n");
    expect(normalizeDecorativeHtml(input)).toBe(input);
  });
});

describe("normalizeLinks", () => {
  it("converts a site-relative <a href> into an absolute Markdown link", () => {
    const input = 'See <a href="/docs/getting-started/installation.md">Installation</a> for details.';
    expect(normalizeLinks(input, SITE_URL)).toBe(
      `See [Installation](${SITE_URL}/docs/getting-started/installation.md) for details.`,
    );
  });

  it("keeps an already-absolute href as-is", () => {
    const input = '<a href="https://example.com/page">External</a>';
    expect(normalizeLinks(input, SITE_URL)).toBe("[External](https://example.com/page)");
  });

  it("leaves an existing Markdown link untouched", () => {
    const input = "See [Installation](/docs/getting-started/installation.md) for details.";
    expect(normalizeLinks(input, SITE_URL)).toBe(input);
  });

  it("does not transform a link shown inside a fenced code block", () => {
    const input = ["```html", '<a href="/docs/example.md">Example</a>', "```"].join("\n");
    expect(normalizeLinks(input, SITE_URL)).toBe(input);
  });
});

describe("normalizeLlmsMarkdown (full pipeline)", () => {
  it("applies every transform together and nests body headings under the page wrapper", () => {
    const body = [
      "Add Runable to your backend.",
      "",
      "## Prerequisites",
      "",
      "### Node.js",
      "",
      "Use a supported version.",
      "",
      "::u-tip",
      "---",
      "variant: warning",
      "title: Alpha CLI",
      "---",
      "",
      "The interactive command is still evolving.",
      "",
      "::",
      "",
      "See <a href=\"/docs/getting-started/quickstart.md\">Quick Start</a> next.",
    ].join("\n");

    const result = normalizeLlmsMarkdown(body, { siteUrl: SITE_URL, headingShift: 2 });

    expect(result).toContain("#### Prerequisites");
    expect(result).toContain("##### Node.js");
    expect(result).toContain("> **Alpha CLI:** The interactive command is still evolving.");
    expect(result).toContain(`[Quick Start](${SITE_URL}/docs/getting-started/quickstart.md)`);
    expect(result).not.toContain("::u-tip");
    expect(result).not.toContain("variant:");
  });
});
