import { useAppConfig } from "../../app/composables/useAppConfig.js";

interface NavEntry {
  href?: string;
  children?: NavEntry[];
}

function slugFromHref(href: string): string | undefined {
  if (!href.startsWith("/docs/")) return undefined;
  return href.slice("/docs/".length);
}

function flatten(entries: NavEntry[], order: string[]): void {
  for (const entry of entries) {
    const slug = entry.href ? slugFromHref(entry.href) : undefined;
    if (slug) order.push(slug);
    if (entry.children) flatten(entry.children, order);
  }
}

/**
 * Flattens the site's own sidebar navigation
 * (website/app/composables/useAppConfig.ts) into a slug -> position map.
 * This is the order editors already maintain for the docs sidebar, so
 * llms-full.txt reuses it instead of maintaining a second ordering config.
 *
 * Pages that exist under website/content/docs/en/ but aren't linked from
 * the nav (category index pages, a page added but not yet wired into the
 * sidebar) simply have no entry here — callers fall back to alphabetical
 * order for those, see `comparePages` in generate.ts.
 */
export function getNavOrderIndex(): Map<string, number> {
  const { nav } = useAppConfig();
  const order: string[] = [];
  flatten(nav, order);

  const index = new Map<string, number>();
  for (const [position, slug] of order.entries()) {
    if (!index.has(slug)) index.set(slug, position);
  }

  return index;
}
