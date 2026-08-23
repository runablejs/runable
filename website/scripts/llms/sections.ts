/**
 * Curated selection of documentation pages exposed through `/llms.txt`.
 *
 * This is an explicit allow-list, not a dump of every page under
 * `website/content/docs/en/`: `llms.txt` stays small and high-signal, and
 * the rest of the documentation is still reachable from the pages listed
 * here or from the site itself.
 *
 * Each `slug` is a path relative to `website/content/docs/en/`, without the
 * `.md` extension (e.g. "guide/routing" -> content/docs/en/guide/routing.md).
 * Titles and descriptions are read from that file's frontmatter by
 * `generate.ts` — set `description` here only to override it for this
 * listing. `generate.ts` throws if a slug doesn't resolve to a real file,
 * so a renamed or deleted page fails the build instead of publishing a
 * dead link.
 */

export interface LlmsPageRef {
  slug: string;
  description?: string;
}

export interface LlmsSection {
  title: string;
  pages: LlmsPageRef[];
}

export const llmsSections: LlmsSection[] = [
  {
    title: "Getting Started",
    pages: [
      { slug: "getting-started/installation" },
      { slug: "getting-started/quickstart" },
      { slug: "getting-started/concepts" },
    ],
  },
  {
    title: "CLI",
    pages: [
      { slug: "guide/cli/index" },
      { slug: "guide/cli/create" },
      { slug: "guide/cli/prepare" },
      { slug: "guide/cli/build" },
      { slug: "guide/cli/skills" },
    ],
  },
  {
    title: "Core Concepts",
    pages: [
      { slug: "guide/routing" },
      { slug: "guide/layouts" },
      { slug: "guide/middlewares" },
      { slug: "guide/data-fetching" },
      { slug: "guide/rendering-modes" },
      { slug: "guide/error-handling" },
    ],
  },
  {
    title: "Configuration",
    pages: [
      { slug: "getting-started/configuration" },
      { slug: "structure/runable-config" },
      { slug: "guide/modules" },
      { slug: "guide/runtime-config" },
      { slug: "structure/env" },
    ],
  },
  {
    title: "Extending Runable",
    pages: [
      { slug: "guide/plugins" },
      { slug: "guide/auto-imports" },
      { slug: "guide/inspector" },
    ],
  },
  {
    title: "Server Runtimes",
    pages: [
      { slug: "integrations/express" },
      { slug: "integrations/fastify" },
      { slug: "integrations/nestjs" },
      { slug: "integrations/adonisjs" },
      { slug: "integrations/hono" },
      { slug: "integrations/koa" },
      { slug: "integrations/bun" },
      { slug: "integrations/deno" },
      { slug: "integrations/h3" },
      { slug: "integrations/custom" },
    ],
  },
  {
    title: "API",
    pages: [
      { slug: "api/composables/use-async-data" },
      { slug: "api/composables/use-fetch" },
      { slug: "api/composables/use-config" },
      { slug: "api/composables/use-runtime" },
      { slug: "api/globals/define-vue-middleware" },
      { slug: "api/globals/define-vue-plugin" },
      { slug: "api/globals/define-page-meta" },
      { slug: "api/globals/dollar-fetch" },
      { slug: "api/components/runable-page" },
      { slug: "api/components/runable-link" },
      { slug: "api/components/runable-layout" },
    ],
  },
];
