import { existsSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { createUnplugin } from "unplugin";
import { getChildren } from "../utils/get-children.js";
import { normalizeDir, resolveDir } from "../utils/dir.js";
import { extractPageMeta } from "./extract-page-meta.js";
import { atomicWriteFile } from "../utils/atomic-write-file.js";
import merge from "lodash/merge.js";

const VIRTUAL_ID = ":router";
const RESOLVED_VIRTUAL_ID = "\:router";

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

type RouterConfig = {
  dynamic?: boolean;
  routeDirs?: string[];
  output?: string;
};

const template = `
{{imports}}

{{routes}}
`;

const dtsTemplate = `
import 'vue-router';

declare global {
  const definePageMeta: <T extends PageMeta>(meta: T) => T
}

declare module "vue-router" {
  interface RouteMeta extends PageMeta {}
}

export {};
`;
async function generateCode({
  routeDirs = [],
  dynamic = true,
  output = process.cwd(),
}: RouterConfig = {}) {
  const routeEntries: RouteEntry[] = [];
  const imports: string[] = [];

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
          child = {
            segment,
            file: null,
            indexFile: null,
            children: [],
          };

          current.children.push(child);
        }

        current = child;
      }

      if (entry.isIndex) {
        current.indexFile = entry.file;
      } else {
        current.file = entry.file;
      }
    }

    return root;
  }

  function toRouteSegment(segment: string): string {
    const catchAllMatch = /^\[\.\.\.(.+)\]$/.exec(segment);

    if (catchAllMatch) {
      return `:${catchAllMatch[1]}*`;
    }

    const optionalMatch = /^\[\[(.+)\]\]$/.exec(segment);

    if (optionalMatch) {
      return `:${optionalMatch[1]}?`;
    }

    const dynamicMatch = /^\[(.+)\]$/.exec(segment);

    if (dynamicMatch) {
      return `:${dynamicMatch[1]}`;
    }

    return segment;
  }

  function resolveRouteEntry(viewsDir: string, filePath: string): RouteEntry {
    let normalized = relative(viewsDir, filePath).replaceAll("\\", "/");

    const ext = extname(normalized);
    normalized = normalized.slice(0, -ext.length);

    const rawSegments = normalized.split("/").filter(Boolean);
    const isIndex = rawSegments.at(-1) === "index";

    const segments = isIndex ? rawSegments.slice(0, -1) : rawSegments;

    return {
      file: filePath,
      segments: segments.map(toRouteSegment),
      isIndex,
    };
  }

  async function getViews(viewsDir: string) {
    viewsDir = resolveDir(viewsDir);
    if (!existsSync(viewsDir)) return;

    const files = getChildren(viewsDir, {
      recursive: true,
      onlyFile: true,
      endWith: /\.(vue|jsx|tsx)$/,
    });

    for (const file of files) {
      routeEntries.push(resolveRouteEntry(viewsDir, file.path));
    }
  }

  function toImportPath(filePath: string): string {
    return normalizeDir(relative(process.cwd(), filePath));
  }

  function joinPath(base: string, sub: string): string {
    if (!sub) return base;
    return `${base}/${sub}`.replace(/\/+/g, "/");
  }

  function mergeMeta(
    parent?: Record<string, unknown>,
    own?: Record<string, unknown>,
  ): Record<string, unknown> | undefined {
    if (!parent && !own) return undefined;
    return merge(parent, own);
  }

  /**
   * Convertit les enfants d'un noeud (route non-racine) en routes Vue.
   * `isTopLevel` = true pour les enfants directs de la racine (path absolu),
   * false pour les niveaux plus profonds (path relatif, imbriqué via `children`).
   */
  function buildChildRoutes(
    node: RouteTree,
    isTopLevel: boolean,
    parentMeta?: Record<string, unknown>,
  ): VueRoute[] {
    const childRoutes: VueRoute[] = [];

    // meta effectif à ce niveau : hérité du parent + éventuel layout local (node.file)
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

    return childRoutes.map((r) => ({
      ...r,
      path: joinPath(path, r.path),
    }));
  }

  function buildVueRoutes(tree: RouteTree): VueRoute[] {
    const routes: VueRoute[] = [];
    const rootMeta = extractPageMeta(tree.file ?? "");

    if (tree.file) {
      routes.push({ path: "/", component: tree.file, meta: rootMeta });
    } else if (tree.indexFile) {
      routes.push({
        path: "/",
        component: tree.indexFile,
        meta: mergeMeta(rootMeta, extractPageMeta(tree.indexFile)),
      });
    }

    for (const child of tree.children) {
      routes.push(...buildChildRoutes(child, true, rootMeta));
    }

    return routes;
  }

  function serializeRoutes(routes: VueRoute[]): string {
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

  async function generateDtsFile(): Promise<void> {
    const dtsPath = resolve(output, "router.d.ts");
    atomicWriteFile(dtsPath, dtsTemplate);
  }

  for (const routeDir of routeDirs) {
    await getViews(routeDir);
  }

  const tree = buildRouteTree(routeEntries);
  const vueRoutes = buildVueRoutes(tree);
  const routes = serializeRoutes(vueRoutes);

  generateDtsFile();

  return template
    .replace("{{imports}}", imports.join("\n"))
    .replace("{{routes}}", routes);
}

export default createUnplugin((config?: RouterConfig) => {
  let code = "";

  return {
    name: "syora:vue-router",
    enforce: "post",

    async buildStart() {
      code = await generateCode(config);
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
    },

    load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return null;

      return code;
    },
  };
});
