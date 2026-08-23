import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "../helpers.js";

/**
 * Lightweight guard so a future documentation page can't ship totally
 * unusable for an LLM/agent (or the site's own frontmatter-driven title):
 * every page under website/content/docs/{en,fr} must have YAML frontmatter
 * with a non-empty `title` and `description`, and non-trivial body content.
 * Deliberately not a full Markdown linter and no new dependency — just
 * enough to catch an empty stub or missing frontmatter.
 */
const DOCS_ROOT = path.join(REPO_ROOT, "website/content/docs");
const LOCALES = ["en", "fr"];

function listMarkdownFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listMarkdownFiles(fullPath));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(fullPath);
  }
  return files;
}

/** Extracts `title`/`description` from simple `key: value` YAML
 * frontmatter — these pages never use nested/multiline frontmatter, so a
 * full YAML parser isn't needed. */
function parseFrontmatter(content: string): { title?: string; description?: string; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { body: content };

  const [, frontmatter, body] = match;
  const result: { title?: string; description?: string; body: string } = { body: body ?? "" };

  for (const line of frontmatter!.split("\n")) {
    const fieldMatch = line.match(/^(title|description):\s*(.*)$/);
    if (!fieldMatch) continue;
    const [, key, rawValue] = fieldMatch;
    const value = rawValue!.trim().replace(/^["']|["']$/g, "");
    if (key === "title") result.title = value;
    if (key === "description") result.description = value;
  }

  return result;
}

describe("documentation pages are minimally AI/RAG-readable", () => {
  for (const locale of LOCALES) {
    const localeDir = path.join(DOCS_ROOT, locale);
    const files = listMarkdownFiles(localeDir).sort();

    it(`found documentation pages for locale "${locale}"`, () => {
      // Canary: if this reads 0, the glob/path is broken and every other
      // assertion below is vacuous.
      expect(files.length).toBeGreaterThan(0);
    });

    it.each(files)(`%s has a title, description, and real content`, (filePath) => {
      const content = readFileSync(filePath, "utf8");
      const { title, description, body } = parseFrontmatter(content);
      const relative = path.relative(REPO_ROOT, filePath);

      expect(title, `${relative} is missing a frontmatter "title"`).toBeTruthy();
      expect(
        description,
        `${relative} is missing a frontmatter "description"`,
      ).toBeTruthy();
      expect(
        body.trim().split(/\s+/).length,
        `${relative} has almost no body content (looks like an empty stub)`,
      ).toBeGreaterThan(10);
    });
  }
});
