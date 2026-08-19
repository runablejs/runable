import { resolve } from "node:path";
import kebabCase from "lodash/kebabCase.js";

import VueRouter from "vue-router/vite";
import merge from "lodash/merge.js";

import { PagesOptions } from "./pages.js";
import { extractPageMeta } from "./extract-page-meta.js";

export function buildRoutes(options: Required<PagesOptions>) {
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

    async extendRoute(route) {
      if (!route.component) return;

      if (typeof route.name === "string") {
        route.name = kebabCase(route.name);
        const re = /.*\/index.(vue|ts|js|mjs)$/gm;

        if (re.test(route.component) && !route.name.endsWith("-index")) {
          route.name = [...route.name.split("-").filter(Boolean), "index"].join(
            "-",
          );
        }
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
