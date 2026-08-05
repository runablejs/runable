import { dirname, extname, relative, resolve } from "node:path";
import { existsSync, statSync } from "node:fs";

import { createUnplugin } from "unplugin";
import fg from "fast-glob";

import { normalizeDir } from "../utils/dir/index.js";
import { extractPageMeta } from "./extract-page-meta.js";
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

function resolveRouteEntry(viewsDir: string, filePath: string): RouteEntry {
  let normalized = relative(viewsDir, filePath).replaceAll("\\", "/");

  const ext = extname(normalized);
  normalized = normalized.slice(0, -ext.length);

  const rawSegments = normalized.split("/").filter(Boolean);
  const isIndex = rawSegments.at(-1) === "index";
  const segments = isIndex ? rawSegments.slice(0, -1) : rawSegments;

  return { file: filePath, segments: segments.map(toRouteSegment), isIndex };
}

/** Scans one `routeDirs` entry and pushes its routes into the shared accumulator. */
function collectViews(lists: RouterOptionsRawResolved[], target: RouteEntry[]) {
  for (const ntry of lists) {
    for (const dir of ntry.dirs) {
      if (existsSync(dir) && statSync(dir).isFile()) {
        target.push(resolveRouteEntry(dirname(dir), dir));
        continue;
      }

      const files = fg.sync(ntry.extGlob, {
        ...ntry,
        ignore: ntry.exclude,
        cwd: dir,
        absolute: true,
        onlyFiles: true,
      });

      for (const file of files) {
        target.push(resolveRouteEntry(dir, file));
      }
    }
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

/**
 * Converts a node's children (non-root route) into Vue routes.
 * `isTopLevel` = true for direct children of the root (absolute path),
 * false for deeper levels (relative path, nested via `children`).
 */
function buildChildRoutes(
  node: RouteTree,
  isTopLevel: boolean,
  parentMeta?: Record<string, unknown>,
): VueRoute[] {
  const childRoutes: VueRoute[] = [];

  const ownMeta = node.file
    ? mergeMeta(parentMeta, extractPageMeta(node.file))
    : parentMeta;

  if (node.indexFile) {
    childRoutes.push({
      path: "",
      component: node.indexFile,
      meta: mergeMeta(ownMeta, extractPageMeta(node.indexFile)),
    });
  }

  for (const child of node.children) {
    childRoutes.push(...buildChildRoutes(child, false, ownMeta));
  }

  const path = isTopLevel ? `/${node.segment}` : node.segment;

  if (node.file) {
    const route: VueRoute = { path, component: node.file, meta: ownMeta };
    if (childRoutes.length > 0) route.children = childRoutes;
    return [route];
  }

  if (childRoutes.length === 0) return [];

  return childRoutes.map((r) => ({ ...r, path: joinPath(path, r.path) }));
}

function buildVueRoutes(tree: RouteTree): VueRoute[] {
  const routes: VueRoute[] = [];
  // FIX: only compute rootMeta when there is an actual root file/index,
  // avoid calling extractPageMeta("") for no reason.
  const rootMeta = tree.file
    ? extractPageMeta(tree.file)
    : tree.indexFile
      ? extractPageMeta(tree.indexFile)
      : undefined;

  if (tree.file) {
    routes.push({ path: "/", component: tree.file, meta: rootMeta });
  } else if (tree.indexFile) {
    routes.push({
      path: "/",
      component: tree.indexFile,
      meta: rootMeta,
    });
  }

  for (const child of tree.children) {
    routes.push(...buildChildRoutes(child, true, rootMeta));
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
        return `"component": View_${counter},`;
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

  const tree = buildRouteTree(routeEntries);
  const vueRoutes = buildVueRoutes(tree);
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
