import { describe, expect, it } from "vitest";

import { parseFrontmatter } from "../../website/scripts/llms/frontmatter.js";

describe("parseFrontmatter", () => {
  it("parses simple unquoted YAML values", () => {
    const result = parseFrontmatter(
      "---\ntitle: Routing\ndescription: Define application routes\n---\nBody text.",
    );

    expect(result.title).toBe("Routing");
    expect(result.description).toBe("Define application routes");
    expect(result.body).toBe("Body text.");
  });

  it("parses quoted YAML values without leaking the quote characters", () => {
    const result = parseFrontmatter(
      '---\ntitle: "Routing"\ndescription: "Learn how routing works"\n---\nBody.',
    );

    expect(result.title).toBe("Routing");
    expect(result.description).toBe("Learn how routing works");
  });

  it("preserves a colon inside a quoted value instead of truncating it", () => {
    const result = parseFrontmatter(
      '---\ntitle: Routing\ndescription: "Understand the backend: a companion server"\n---\nBody.',
    );

    expect(result.description).toBe("Understand the backend: a companion server");
  });

  it("folds a multiline '>' (folded) description into a single line", () => {
    const result = parseFrontmatter(
      "---\ntitle: Routing\ndescription: >\n  Learn how Runable integrates\n  with your existing backend.\n---\nBody.",
    );

    expect(result.description).toBe(
      "Learn how Runable integrates with your existing backend.",
    );
  });

  it("keeps line breaks from a multiline '|' (literal) description", () => {
    const result = parseFrontmatter(
      "---\ntitle: Routing\ndescription: |\n  First line.\n  Second line.\n---\nBody.",
    );

    expect(result.description).toBe("First line.\nSecond line.");
  });

  it("returns only the body, with no title/description, for a document without frontmatter", () => {
    const result = parseFrontmatter("# Just a heading\n\nSome body text.");

    expect(result.title).toBeUndefined();
    expect(result.description).toBeUndefined();
    expect(result.body).toBe("# Just a heading\n\nSome body text.");
  });

  it("ignores frontmatter fields other than title/description", () => {
    const result = parseFrontmatter(
      "---\ntitle: Routing\ndraft: true\ntags:\n  - guide\n  - routing\n---\nBody.",
    );

    expect(result.title).toBe("Routing");
    expect(result.description).toBeUndefined();
  });
});
