import { parse as parseYaml } from "yaml";

/**
 * Normalization steps applied only to `llms-full.txt` (never to the source
 * Markdown under website/content/docs/en/, and never to the per-page
 * `/docs/**​/*.md` endpoints, which stay a faithful copy of the source).
 * The goal is to strip syntax that is specific to the website's content
 * engine (MDC containers like `::u-tip`, decorative presentation HTML) so
 * the aggregated document reads as plain, standard Markdown.
 *
 * Every transform below is fence-aware: it splits the input into fenced
 * code blocks and everything else via `splitByCodeFences`, and only
 * rewrites the "everything else" parts. Code blocks are never touched,
 * so a literal `::u-tip`, `<u-icon`, or `<a href=` shown as an example
 * inside a ``` fence survives unchanged.
 */

interface MarkdownChunk {
  isCode: boolean;
  text: string;
}

/** Splits `markdown` into chunks alternating between fenced code blocks
 * (delimiters included) and everything else. Fences are only recognized
 * at the start of a line (```lang or ```), matching every fence in
 * website/content/docs/en/ — none are indented. */
function splitByCodeFences(markdown: string): MarkdownChunk[] {
  const lines = markdown.split("\n");
  const chunks: MarkdownChunk[] = [];
  let current: string[] = [];
  let inCode = false;

  const flush = (isCode: boolean) => {
    if (current.length > 0) chunks.push({ isCode, text: current.join("\n") });
    current = [];
  };

  for (const line of lines) {
    const isFenceLine = /^```/.test(line);

    if (isFenceLine && !inCode) {
      flush(false);
      current.push(line);
      inCode = true;
    } else if (isFenceLine && inCode) {
      current.push(line);
      flush(true);
      inCode = false;
    } else {
      current.push(line);
    }
  }
  flush(inCode);

  return chunks;
}

/** Applies `transform` to every part of `markdown` outside fenced code
 * blocks; code blocks are passed through untouched. Shared by every
 * normalization step below — this is the single place fence protection
 * is implemented. */
function transformOutsideFences(
  markdown: string,
  transform: (text: string) => string,
): string {
  return splitByCodeFences(markdown)
    .map((chunk) => (chunk.isCode ? chunk.text : transform(chunk.text)))
    .join("\n");
}

const ATX_HEADING_RE = /^(#{1,6})( +)(.*)$/;

/** Shifts every ATX heading (`#` to `######`) outside fenced code blocks
 * down by `levels`, clamped at level 6 so the result is always valid
 * Markdown — relative hierarchy between headings is preserved, only the
 * absolute level changes. Used to nest a page's own headings under its
 * `### <title>` wrapper in llms-full.txt. */
export function shiftHeadings(markdown: string, levels: number): string {
  return transformOutsideFences(markdown, (text) =>
    text
      .split("\n")
      .map((line) => {
        const match = line.match(ATX_HEADING_RE);
        if (!match) return line;

        const [, hashes, spacing, rest] = match;
        const newLevel = Math.min(hashes.length + levels, 6);
        return `${"#".repeat(newLevel)}${spacing}${rest}`;
      })
      .join("\n"),
  );
}

// Matches a whole `::u-tip` MDC container: the opening tag, its YAML-ish
// `---`-fenced meta block (variant/title), a blank line, the body (one or
// more paragraphs), a blank line, then the closing `::` alone on its line.
const ADMONITION_RE =
  /^::u-tip\r?\n---\r?\n([\s\S]*?)\r?\n---\r?\n\r?\n([\s\S]*?)\r?\n\r?\n::[ \t]*$/gm;

/** Converts `::u-tip` admonitions to a standard Markdown blockquote:
 * `> **<title>:** <first paragraph>`, with further paragraphs joined by a
 * bare `>` line. `variant` carries no reusable semantic meaning once
 * converted to plain Markdown, so it's dropped; `title` is kept. */
export function normalizeAdmonitions(markdown: string): string {
  return transformOutsideFences(markdown, (text) => {
    ADMONITION_RE.lastIndex = 0;

    return text.replace(ADMONITION_RE, (_match, meta: string, body: string) => {
      const data = (parseYaml(meta) ?? {}) as Record<string, unknown>;
      const title = typeof data.title === "string" ? data.title.trim() : undefined;

      const paragraphs = body
        .split(/\r?\n\r?\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

      const blocks = paragraphs.map((paragraph, index) =>
        paragraph
          .split(/\r?\n/)
          .map((line, lineIndex) => {
            const prefix = index === 0 && lineIndex === 0 && title ? `**${title}:** ` : "";
            return `> ${prefix}${line}`;
          })
          .join("\n"),
      );

      return blocks.join("\n>\n");
    });
  });
}

/** Strips the `::u-code-group` tabbed-code-block wrapper: a presentation
 * container around several fenced code blocks that are already valid,
 * readable Markdown on their own once the container lines are removed.
 * Must run after `normalizeAdmonitions`, which is the only other thing
 * that produces a bare `::` line in this corpus — anything left over at
 * that point belongs to a code group. */
export function stripCodeGroupContainers(markdown: string): string {
  return transformOutsideFences(markdown, (text) =>
    text
      .split("\n")
      .filter((line) => {
        const trimmed = line.trim();
        return trimmed !== "::u-code-group" && trimmed !== "::";
      })
      .join("\n"),
  );
}

// The one decorative HTML pattern actually present in
// website/content/docs/en/: a `<u-icon>` + `<span>` row repeated inside a
// wrapper div, used to render a bulleted feature/decision list. See
// getting-started/why-runable.md, getting-started/vs-nuxt.md,
// getting-started/concepts.md.
const ICON_LIST_WRAPPER_RE =
  /<div class="py-3 space-y-2">\r?\n([\s\S]*?)\r?\n<\/div>/g;
const ICON_LIST_ITEM_RE =
  /<div class="flex[^"]*">\s*<u-icon[^>]*>\s*<\/u-icon>\s*<span>([\s\S]*?)<\/span>\s*<\/div>/g;

function convertInlineHtml(text: string): string {
  return text
    .replace(/<strong>([\s\S]*?)<\/strong>/g, "**$1**")
    .replace(/<code>([\s\S]*?)<\/code>/g, "`$1`");
}

/** Converts the known `<u-icon>` + `<span>` decorative list pattern into a
 * plain Markdown list, keeping the text (with `<strong>`/`<code>` mapped
 * to Markdown) and dropping the icon and Tailwind/UI classes. Any other
 * HTML is left as-is — this only recognizes the one wrapper/item shape
 * actually used in the docs, not HTML in general. */
export function normalizeDecorativeHtml(markdown: string): string {
  return transformOutsideFences(markdown, (text) => {
    ICON_LIST_WRAPPER_RE.lastIndex = 0;

    return text.replace(ICON_LIST_WRAPPER_RE, (fullMatch, inner: string) => {
      const items: string[] = [];
      ICON_LIST_ITEM_RE.lastIndex = 0;

      let itemMatch: RegExpExecArray | null;
      while ((itemMatch = ICON_LIST_ITEM_RE.exec(inner))) {
        items.push(`- ${convertInlineHtml(itemMatch[1]).trim()}`);
      }

      // Nothing recognized inside — leave the block untouched rather than
      // silently dropping content we don't understand.
      return items.length > 0 ? items.join("\n") : fullMatch;
    });
  });
}

const HTML_LINK_RE = /<a href="([^"]+)">([^<]*)<\/a>/g;

/** Converts simple `<a href="...">text</a>` links to Markdown links,
 * resolving a site-relative href (starting with `/`) against `siteUrl`
 * and leaving an already-absolute href as-is. Only matches links whose
 * text has no nested tags — anything more complex is left as HTML rather
 * than risk mangling it. Markdown links already written as `[text](url)`
 * never match this pattern and pass through untouched. */
export function normalizeLinks(markdown: string, siteUrl: string): string {
  return transformOutsideFences(markdown, (text) => {
    HTML_LINK_RE.lastIndex = 0;

    return text.replace(HTML_LINK_RE, (fullMatch, href: string, label: string) => {
      if (/^https?:\/\//.test(href)) return `[${label}](${href})`;
      if (href.startsWith("/")) return `[${label}](${siteUrl}${href})`;

      return fullMatch;
    });
  });
}

export interface NormalizeOptions {
  siteUrl: string;
  /** Levels to shift the page body's own headings down by, so they nest
   * under its `### <title>` wrapper. */
  headingShift: number;
}

/** Runs the full llms-full.txt normalization pipeline on one page's body:
 * admonitions and code-group containers to standard Markdown, decorative
 * HTML to a Markdown list, HTML links to Markdown links, then heading
 * levels shifted to nest under the page's `###` wrapper. */
export function normalizeLlmsMarkdown(
  body: string,
  options: NormalizeOptions,
): string {
  let text = normalizeAdmonitions(body);
  text = stripCodeGroupContainers(text);
  text = normalizeDecorativeHtml(text);
  text = normalizeLinks(text, options.siteUrl);
  text = shiftHeadings(text, options.headingShift);

  return text;
}
