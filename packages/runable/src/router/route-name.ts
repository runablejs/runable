import kebabCase from "lodash/kebabCase.js";

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
export function normalizeRouteName(name: string, componentPath: string): string {
  let result = kebabCase(name);

  const isIndexFile = /.*\/index\.(vue|ts|js|mjs)$/.test(componentPath);
  if (isIndexFile && !result.endsWith("-index")) {
    result = [...result.split("-").filter(Boolean), "index"].join("-");
  }

  return result;
}
