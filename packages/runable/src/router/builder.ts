import { resolve } from "node:path";

import VueRouter from "vue-router/vite";
import merge from "lodash/merge.js";

import { PagesOptions } from "./pages.js";
import { extractPageMeta } from "./extract-page-meta.js";
import { normalizeRouteName } from "./route-name.js";
import type { EditableRouteTreeNode } from "./types.js";

export function buildRoutes(
  options: Required<PagesOptions>,
  extendRoutes?: (routes: EditableRouteTreeNode) => void | Promise<void>,
) {
  return VueRouter({
    dts: resolve(options.output, "router-routes.d.ts"),

    routesFolder: options.dirs.map((dir) => {
      return {
        src: dir.parent,

        extensions() {
          return dir.extensions.map((ext) =>
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
