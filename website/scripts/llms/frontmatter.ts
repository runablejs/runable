const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const FIELD_RE = /^(title|description):\s*(.*)$/;

export interface ParsedMarkdown {
  title?: string;
  description?: string;
  body: string;
}

/** Minimal frontmatter reader for `title`/`description` — matches the parser
 * used by tests/integration/docs-content.test.ts. No YAML dependency. */
export function parseFrontmatter(content: string): ParsedMarkdown {
  const match = content.match(FRONTMATTER_RE);
  if (!match) return { body: content };

  const [, frontmatter, body] = match;
  const result: ParsedMarkdown = { body };

  for (const line of frontmatter.split(/\r?\n/)) {
    const fieldMatch = line.match(FIELD_RE);
    if (!fieldMatch) continue;

    const [, key, rawValue] = fieldMatch;
    result[key as "title" | "description"] = rawValue.trim();
  }

  return result;
}
