import { extname, relative } from "node:path";
import merge from "lodash/merge.js";

import type { ResolvedScanDirFile } from "@/utils/dir/scan.js";
import { extractPageMeta } from "@/router/extract-page-meta.js";
import { normalizeRouteName } from "@/router/route-name.js";
import { toProjectRelative } from "./relative.js";
import type { InspectorRoute } from "./types.js";

/*
 * Runable's real routing engine is `vue-router/vite` (the official
 * unplugin-vue-router integration, wired up in `router/builder.ts`): it
 * owns file-based routing's actual segment/tree/path-token conventions,
 * and Runable only customizes the result via an `extendRoute` hook
 * (kebab-case names, `definePageMeta()` overrides). That engine only runs
 * as part of a bundler pipeline (Vite's plugin `resolveId`/`transform`
 * hooks) — there's no headless API to call it directly, and starting a
 * Vite dev server just to list routes is explicitly out of scope for the
 * Inspector (see the module doc on `./index.js`).
 *
 * This module is therefore a deliberate, documented exception to "reuse
 * Runable's own pipeline": a static, Vite-free reproduction of
 * unplugin-vue-router's default file-based routing convention (bracket
 * segments, nesting, nothing else — no custom `routesFolder` overrides),
 * covering the standard cases (index/dynamic/optional/catch-all/nested).
 * It was verified empirically against the real pipeline's generated
 * `router-routes.d.ts` for each of those cases (see
 * `tests/regressions/inspector.test.ts`) rather than guessed at.
 *
 * Everything downstream of "what's the file structure" — `definePageMeta()`
 * parsing and the exact route-name normalization (kebab-case, `-index`
 * suffix) — reuses Runable's own primitives (`extractPageMeta`,
 * `normalizeRouteName`) unchanged, so it can't drift from the real pipeline.
 */

interface RouteFileEntry {
  file: string;
  /** Raw path segments (bracket syntax untouched), e.g. ["users", "[id]"]. */
  segments: string[];
  isIndex: boolean;
}

interface RouteTreeNode {
  /** Raw segment for this level ("" for the tree root). */
  segment: string;
  /** A file matching this level exactly (e.g. `users.vue` for a `users/` folder) — wraps its children. */
  file: string | null;
  /** `index.*` file at this level, e.g. `users/index.vue`. */
  indexFile: string | null;
  children: RouteTreeNode[];
}

function toRouteEntry(filePath: string, parentDir: string): RouteFileEntry {
  let normalized = filePath === parentDir ? filePath : relative(parentDir, filePath);
  normalized = normalized.replace(/\\/g, "/");

  const ext = extname(normalized);
  normalized = normalized.slice(0, -ext.length);

  const rawSegments = normalized.split("/").filter(Boolean);
  const isIndex = rawSegments.at(-1) === "index";
  const segments = isIndex ? rawSegments.slice(0, -1) : rawSegments;

  return { file: filePath, segments, isIndex };
}

/** Converts one raw file-based-routing segment into its path token and its bare name token. */
function toSegmentTokens(segment: string): { path: string; name: string } {
  const catchAll = /^\[\.\.\.(.+)\]$/.exec(segment);
  if (catchAll) return { path: `:${catchAll[1]}(.*)`, name: catchAll[1]! };

  const optional = /^\[\[(.+)\]\]$/.exec(segment);
  if (optional) return { path: `:${optional[1]}?`, name: optional[1]! };

  const dynamic = /^\[(.+)\]$/.exec(segment);
  if (dynamic) return { path: `:${dynamic[1]}`, name: dynamic[1]! };

  return { path: segment, name: segment };
}

function buildTree(entries: RouteFileEntry[]): RouteTreeNode {
  const root: RouteTreeNode = { segment: "", file: null, indexFile: null, children: [] };

  for (const entry of entries) {
    let current = root;

    for (const segment of entry.segments) {
      let child = current.children.find((c) => c.segment === segment);
      if (!child) {
        child = { segment, file: null, indexFile: null, children: [] };
        current.children.push(child);
      }
      current = child;
    }

    if (entry.isIndex) current.indexFile = entry.file;
    else current.file = entry.file;
  }

  return root;
}

function buildPath(segments: string[]): string {
  const tokens = segments.map((s) => toSegmentTokens(s).path);
  return tokens.length ? `/${tokens.join("/")}` : "/";
}

function buildName(segments: string[], file: string): string {
  const joined = segments.map((s) => toSegmentTokens(s).name).join("-");
  return normalizeRouteName(joined, file);
}

/** Splits `name`/`path` overrides out of a page's own `definePageMeta()` result — they become the route's own fields, not part of `meta` (and must not be inherited by child routes via meta merging). */
function splitOverrides(meta: Record<string, unknown>): {
  name?: string;
  path?: string;
  rest?: Record<string, unknown>;
} {
  const { name, path, ...rest } = meta;
  return {
    name: typeof name === "string" ? name : undefined,
    path: typeof path === "string" ? path : undefined,
    rest: Object.keys(rest).length > 0 ? rest : undefined,
  };
}

function toInspectorRoute(
  rootDir: string,
  file: string,
  path: string,
  name: string,
  meta: Record<string, unknown> | undefined,
  parentFile: string | null,
): InspectorRoute {
  const route: InspectorRoute = {
    name,
    path,
    file: toProjectRelative(rootDir, file),
  };
  if (parentFile) route.parent = toProjectRelative(rootDir, parentFile);
  if (meta) route.meta = meta;
  return route;
}

function walk(
  rootDir: string,
  node: RouteTreeNode,
  ancestorSegments: string[],
  parentMeta: Record<string, unknown> | undefined,
  parentFile: string | null,
  out: InspectorRoute[],
): void {
  let ownMeta = parentMeta;
  let wrappingFile = parentFile;

  if (node.file) {
    const raw = extractPageMeta(node.file);
    const { name: customName, path: customPath, rest } = splitOverrides(raw);
    const segments = [...ancestorSegments, node.segment];

    const path = customPath ?? buildPath(segments);
    const name = customName ?? buildName(segments, node.file);
    const meta = rest ? merge({}, parentMeta, rest) : parentMeta;

    out.push(toInspectorRoute(rootDir, node.file, path, name, meta, parentFile));

    ownMeta = meta;
    wrappingFile = node.file;
  }

  if (node.indexFile) {
    const raw = extractPageMeta(node.indexFile);
    const { name: customName, path: customPath, rest } = splitOverrides(raw);
    const segments = [...ancestorSegments, node.segment];

    const path = customPath ?? buildPath(segments);
    const name = customName ?? buildName(segments, node.indexFile);
    const meta = rest ? merge({}, ownMeta, rest) : ownMeta;

    out.push(toInspectorRoute(rootDir, node.indexFile, path, name, meta, wrappingFile));
  }

  for (const child of node.children) {
    walk(rootDir, child, [...ancestorSegments, node.segment], ownMeta, wrappingFile, out);
  }
}

/**
 * Resolves `InspectorRoute[]` from every `pages` scan dir across the
 * config graph (main app + modules) — the same aggregate the real Vite
 * pipeline builds in `vite/config.ts` (`_pages.dirs.push(...config.pages)`
 * across every config).
 */
export function resolveInspectorRoutes(
  rootDir: string,
  pageFiles: ResolvedScanDirFile[],
): InspectorRoute[] {
  const entries = pageFiles.map((f) => toRouteEntry(f.file, f.parent));
  const tree = buildTree(entries);

  const out: InspectorRoute[] = [];
  // The tree root itself has no segment/file of its own (see the module
  // doc: a 0-segment, non-index file can't exist), only an optional
  // `indexFile` (the app's `/` route) and top-level children.
  if (tree.indexFile) {
    const raw = extractPageMeta(tree.indexFile);
    const { name: customName, path: customPath, rest } = splitOverrides(raw);
    const path = customPath ?? "/";
    const name = customName ?? buildName([], tree.indexFile);
    out.push(toInspectorRoute(rootDir, tree.indexFile, path, name, rest, null));
  }
  for (const child of tree.children) {
    walk(rootDir, child, [], undefined, null, out);
  }

  return out;
}
