import { extname, relative, resolve } from "node:path";

import { createUnplugin } from "unplugin";

import { normalizeDir } from "../utils/dir/index.js";
import { extractPageMeta } from "./extract-page-meta-old.js";
import { atomicWriteFile } from "../utils/atomic-write-file.js";
import merge from "lodash/merge.js";
import type { RouterOptionsRawResolved } from "./types.js";

const VIRTUAL_ID = ":router";
const RESOLVED_VIRTUAL_ID = "\0:router";

type RouteTree = {
  segment: string;
  file: string | null;
  indexFile: string | null;
  children: RouteTree[];
};

type RouteEntry = {
  file: string;
  segments: string[];
  isIndex: boolean;
};

type VueRoute = {
  path: string;
  component: string;
  name?: string;
  meta?: Record<string, unknown>;
  children?: VueRoute[];
};

export type PagesOptions = {
  output?: string;
  dirs: RouterOptionsRawResolved[];
};

const template = `
{{imports}}

{{routes}}
`;

const dtsTemplate = `
import 'vue-router';
import type { PageMeta, definePageMeta } from '{{router_helper_path}}'

declare global {
  type definePageMeta = typeof definePageMeta
}

declare module "vue-router" {
  interface RouteMeta extends PageMeta {}
}

export {};
`;

function toRouteSegment(segment: string): string {
  const catchAllMatch = /^\[\.\.\.(.+)\]$/.exec(segment);
  if (catchAllMatch) return `:${catchAllMatch[1]}*`;

  const optionalMatch = /^\[\[(.+)\]\]$/.exec(segment);
  if (optionalMatch) return `:${optionalMatch[1]}?`;

  const dynamicMatch = /^\[(.+)\]$/.exec(segment);
  if (dynamicMatch) return `:${dynamicMatch[1]}`;

  return segment;
}

function resolveRouteEntry(filePath: string, parentDir: string): RouteEntry {
  let normalized = normalizeDir(filePath);
  if (filePath !== parentDir) normalized = relative(parentDir, filePath);

  const ext = extname(normalized);
  normalized = normalized.slice(0, -ext.length);

  const rawSegments = normalized.split("/").filter(Boolean);
  const isIndex = rawSegments.at(-1) === "index";
  const segments = isIndex ? rawSegments.slice(0, -1) : rawSegments;

  return { file: filePath, segments: segments.map(toRouteSegment), isIndex };
}

/** Scans one `routeDirs` entry and pushes its routes into the shared accumulator. */
function collectViews(files: RouterOptionsRawResolved[], target: RouteEntry[]) {
  for (const file of files) {
    const entry = resolveRouteEntry(file.file, file.parent);
    target.push(entry);
  }
}

function buildRouteTree(entries: RouteEntry[]): RouteTree {
  const root: RouteTree = {
    segment: "",
    file: null,
    indexFile: null,
    children: [],
  };

  for (const entry of entries) {
    let current = root;

    for (const segment of entry.segments) {
      let child = current.children.find((item) => item.segment === segment);

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

function joinPath(base: string, sub: string): string {
  if (!sub) return base;
  return `${base}/${sub}`.replace(/\/+/g, "/");
}

// FIX: `lodash.merge(dest, src)` mutates `dest` in place. `parent`/`ownMeta`
// objects are reused across siblings in buildChildRoutes, so mutating them
// directly corrupted meta on unrelated routes. Merge into a fresh object.
function mergeMeta(
  parent?: Record<string, unknown>,
  own?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!parent && !own) return undefined;
  return merge({}, parent, own);
}

/** Converts a route segment into an alphanumeric PascalCase token,
 * e.g. ":user-id?" -> "UserId", "blog-posts" -> "BlogPosts". */
function toNameSegment(segment: string): string {
  return segment
    .replace(/^:/, "")
    .replace(/[?*]$/, "")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/** Derives an alphanumeric route `name` from a file's segments,
 * e.g. pages/users/[id].vue -> "UsersId". */
function computeRouteName(entry: RouteEntry): string {
  const parts = entry.segments.map(toNameSegment);
  return parts.join("") || "Root";
}

/** Maps each source file to its computed route name. Built once per pass
 * from the flat entry list, since the RouteTree only keeps file paths. */
function buildRouteNameMap(entries: RouteEntry[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const entry of entries) map.set(entry.file, computeRouteName(entry));
  return map;
}

/** Splits optional `name`/`path` overrides out of a page's own (non-merged)
 * meta, so they become `route.name`/`route.path` instead of leaking into
 * `route.meta` or being inherited by child routes via meta merging. Must
 * run BEFORE mergeMeta(parentMeta, ownMeta) — otherwise a `name`/`path` set
 * on a parent page would incorrectly propagate down to every child route. */
function splitRouteMeta(meta?: Record<string, unknown>): {
  name?: string;
  path?: string;
  rest?: Record<string, unknown>;
} {
  if (!meta) return {};
  const { name, path, ...rest } = meta;
  return {
    name: typeof name === "string" ? name : undefined,
    path: typeof path === "string" ? path : undefined,
    rest: Object.keys(rest).length > 0 ? rest : undefined,
  };
}

/**
 * Converts a node's children (non-root route) into Vue routes.
 * `isTopLevel` = true for direct children of the root (absolute path),
 * false for deeper levels (relative path, nested via `children`).
 */
function buildChildRoutes(
  node: RouteTree,
  isTopLevel: boolean,
  nameMap: Map<string, string>,
  parentMeta?: Record<string, unknown>,
): VueRoute[] {
  const childRoutes: VueRoute[] = [];

  const {
    name: ownCustomName,
    path: ownCustomPath,
    rest: ownMetaOwnOnly,
  } = splitRouteMeta(node.file ? extractPageMeta(node.file) : undefined);
  const ownMeta = node.file
    ? mergeMeta(parentMeta, ownMetaOwnOnly)
    : parentMeta;

  if (node.indexFile) {
    const {
      name: indexCustomName,
      path: indexCustomPath,
      rest: indexMetaOwnOnly,
    } = splitRouteMeta(extractPageMeta(node.indexFile));
    childRoutes.push({
      path: indexCustomPath ?? "",
      component: node.indexFile,
      name: indexCustomName ?? nameMap.get(node.indexFile),
      meta: mergeMeta(ownMeta, indexMetaOwnOnly),
    });
  }

  for (const child of node.children) {
    childRoutes.push(...buildChildRoutes(child, false, nameMap, ownMeta));
  }

  const path =
    ownCustomPath ?? (isTopLevel ? `/${node.segment}` : node.segment);

  if (node.file) {
    const route: VueRoute = {
      path,
      component: node.file,
      name: ownCustomName ?? nameMap.get(node.file),
      meta: ownMeta,
    };
    if (childRoutes.length > 0) route.children = childRoutes;
    return [route];
  }

  if (childRoutes.length === 0) return [];

  return childRoutes.map((r) => ({ ...r, path: joinPath(path, r.path) }));
}

function buildVueRoutes(
  tree: RouteTree,
  nameMap: Map<string, string>,
): VueRoute[] {
  const routes: VueRoute[] = [];
  // FIX: only compute rootMeta when there is an actual root file/index,
  // avoid calling extractPageMeta("") for no reason.
  const rawRootMeta = tree.file
    ? extractPageMeta(tree.file)
    : tree.indexFile
      ? extractPageMeta(tree.indexFile)
      : undefined;
  const {
    name: rootCustomName,
    path: rootCustomPath,
    rest: rootMeta,
  } = splitRouteMeta(rawRootMeta);

  if (tree.file) {
    routes.push({
      path: rootCustomPath ?? "/",
      component: tree.file,
      name: rootCustomName ?? nameMap.get(tree.file),
      meta: rootMeta,
    });
  } else if (tree.indexFile) {
    routes.push({
      path: rootCustomPath ?? "/",
      component: tree.indexFile,
      name: rootCustomName ?? nameMap.get(tree.indexFile),
      meta: rootMeta,
    });
  }

  for (const child of tree.children) {
    routes.push(...buildChildRoutes(child, true, nameMap, rootMeta));
  }

  return routes;
}

function toImportPath(filePath: string): string {
  return normalizeDir(relative(process.cwd(), filePath));
}

function serializeRoutes(
  routes: VueRoute[],
  dynamic: boolean,
  imports: string[],
): string {
  let counter = 0;
  const json = JSON.stringify(routes, null, 2);

  const withImportsAndMeta = json.replace(
    /"component":\s*"([^"]+)"/g,
    (_match, filePath: string) => {
      counter++;
      const resolvedPath = toImportPath(filePath);

      if (!dynamic) {
        imports.push(`import View_${counter} from '${resolvedPath}'`);
        // FIX: don't append a manual trailing comma here — the original
        // JSON already includes the correct comma when a property follows
        // (e.g. "name", "meta"), and none when component is genuinely last.
        // Adding one unconditionally produced a double comma whenever a
        // property came after "component" in the serialized object.
        return `"component": View_${counter}`;
      }

      return `"component": () => import('${resolvedPath}')`;
    },
  );

  return `export const routes = ${withImportsAndMeta};\n`;
}

/** Builds the `:router` virtual module content from the fully merged route entries. */
function generateRouterCode(
  routeEntries: RouteEntry[],
  dynamic: boolean,
): string {
  const imports: string[] = [];

  const nameMap = buildRouteNameMap(routeEntries);
  const tree = buildRouteTree(routeEntries);
  const vueRoutes = buildVueRoutes(tree, nameMap);

  const routes = serializeRoutes(vueRoutes, dynamic, imports);

  return template
    .replace("{{imports}}", imports.join("\n"))
    .replace("{{routes}}", routes);
}

/**
 * Shared across every instance of this plugin (one per Syora config: main +
 * each module) so `:router` includes every config's routes, not just
 * whichever instance's `buildStart`/`load` happens to win. `sharedCode` is
 * computed once, after the last instance's `buildStart`, since building the
 * route tree needs every config's entries merged first — unlike layouts/
 * plugins there's no per-name map here, entries are just concatenated.
 */
let total = 0;
let completed = 0;
let sharedRouteEntries: RouteEntry[] = [];
let sharedOutput: string | undefined;
let sharedDynamic: boolean | undefined;
let sharedCode = "";

export default createUnplugin(
  ({ dirs = [], output = process.cwd() }: PagesOptions) => {
    total++;
    sharedOutput ??= output;

    return {
      name: "syora:vue-router",
      enforce: "post",

      async buildStart() {
        completed++;

        // FIX: reset shared state at the start of a fresh full pass
        // (first instance to run in this cycle) so watch-mode rebuilds
        // don't just keep appending to sharedRouteEntries forever, and
        // completed/total stay in sync across rebuilds.
        if (completed === 1) sharedRouteEntries = [];

        collectViews(dirs, sharedRouteEntries);

        if (completed === total) {
          sharedCode = generateRouterCode(sharedRouteEntries, sharedDynamic!);

          atomicWriteFile(
            resolve(sharedOutput!, "router.d.ts"),
            dtsTemplate.replaceAll(
              "{{router_helper_path}}",
              normalizeDir(
                relative(
                  sharedOutput!,
                  resolve(import.meta.dirname, "./helpers.js"),
                ),
              ),
            ),
          );

          // FIX: reset completed so the next full build/rebuild cycle
          // can reach `completed === total` again instead of counting
          // up indefinitely.
          completed = 0;
        }
      },

      resolveId(id) {
        if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
      },

      load(id) {
        if (id !== RESOLVED_VIRTUAL_ID) return null;
        return sharedCode;
      },
    };
  },
);
