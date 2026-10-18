import { resolve } from "node:path";
import { readFileSync } from "node:fs";

import VueRouter from "vue-router/vite";
import merge from "lodash/merge.js";
import kebabCase from "lodash/kebabCase.js";

// import { PagesOptions } from "./pages.js";
// import { extractPageMeta } from "./extract-page-meta.js";
// import { normalizeRouteName } from "./route-name.js";
import type {
  EditableRouteTreeNode,
  RouterOptionsRawResolved,
} from "./types.js";

export function buildRoutes(
  output: string,
  dirs: RouterOptionsRawResolved[],
  extendRoutes?: (routes: EditableRouteTreeNode) => void | Promise<void>,
) {
  return VueRouter({
    dts: resolve(output, "router-routes.d.ts"),

    routesFolder: dirs.map((dir) => {
      return {
        src: dir.cwd!,

        extensions() {
          return (dir.extensions ?? [".vue", ".jsx", ".tsx"]).map((ext) =>
            ext.startsWith(".") ? ext : `.${ext}`,
          );
        },
      };
    }),

    async beforeWriteFiles(root) {
      await extendRoutes?.(root as unknown as EditableRouteTreeNode);
    },

    async extendRoute(route) {
      if (!route.component) return;

      if (typeof route.name === "string") {
        route.name = normalizeRouteName(route.name, route.component);
      }

      const meta = extractPageMeta(route.component);

      if (meta.name) route.name = meta.name;

      if (meta.path) route.path = meta.path;

      if (meta.path) route.addAlias(meta.alias);

      const parentMeta = route.parent?.meta ?? {};
      route.addToMeta(merge({}, parentMeta, route.meta, meta));
    },
  });
}

/**
 * Normalizes a route name the same way the real `vue-router/vite`
 * `extendRoute` pipeline does (see `router/builder.ts`): kebab-case it, then
 * make sure an `index.*` component's name ends with `-index` (unplugin-vue-
 * router's own default naming already does this for *some* index files, but
 * not consistently once a name has been kebab-cased here).
 *
 * Shared by the real build pipeline (`buildRoutes` in `router/builder.ts`)
 * and the read-only Inspector (`inspector/routes.ts`), so both compute the
 * exact same route name for the exact same file instead of drifting apart.
 */
export function normalizeRouteName(
  name: string,
  componentPath: string,
): string {
  let result = kebabCase(name);

  const isIndexFile = /.*\/index\.(vue|ts|js|mjs)$/.test(componentPath);
  if (isIndexFile && !result.endsWith("-index")) {
    result = [...result.split("-").filter(Boolean), "index"].join("-");
  }

  return result;
}

export function extractPageMeta(
  filePath: string,
  code?: string,
): { name?: string; path?: string; alias?: string[] } & Record<
  string,
  unknown
> {
  if (!code) code = readFileSync(filePath, "utf-8");

  const match = code.match(/definePageMeta\s*\(\s*({[\s\S]*?})\s*\)/);

  if (match) {
    let metaStr = match[1]
      ?.replace(/(\w+):/g, '"$1":') // quote keys
      .replace(/'/g, '"') // simple quotes -> double
      .replace(/,\s*}/g, "}"); // trailing comma

    if (!metaStr) metaStr = "{}";

    const meta = JSON.parse(metaStr);

    return meta;
  }

  return {};
}
