import { parse as parseYaml } from "yaml";

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export interface ParsedMarkdown {
  title?: string;
  description?: string;
  body: string;
}

/** Reads `title`/`description` from a page's frontmatter using a real YAML
 * parser — quoted strings, multiline `>`/`|` scalars, and `:` inside values
 * all parse correctly, unlike a line-by-line regex. Only the `---` fence
 * boundaries are matched by regex; the frontmatter block itself is parsed
 * as YAML. */
export function parseFrontmatter(content: string): ParsedMarkdown {
  const match = content.match(FRONTMATTER_RE);
  if (!match) return { body: content };

  const [, frontmatter, body] = match;
  const data = (parseYaml(frontmatter) ?? {}) as Record<string, unknown>;

  const result: ParsedMarkdown = { body };

  if (typeof data.title === "string") result.title = data.title.trim();
  if (typeof data.description === "string") {
    result.description = data.description.trim();
  }

  return result;
}
