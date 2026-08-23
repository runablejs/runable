import { join, resolve } from "node:path";

import { resolveScanDirs_v2 } from "@/utils/dir/index.js";
import type { ResolvedComponentDir } from "@/components/types.js";
import type { GlobalOptionsImports } from "@/globals/unplugin.js";

/**
 * Runable's own built-in components/composables/globals (`<Page>`,
 * `<Link>`, `useRuntime()`, ...) really are auto-available in every
 * project without an import — the real pipeline merges them in
 * unconditionally (`builtinComponents`/`builtinGlobalImports` in
 * `vite/config.ts`). The Inspector mirrors that same directory list here
 * so `getAutoImports()` answers "does X exist in this project" completely,
 * not just for project-authored code.
 */

export function builtinComponentDirs(): ResolvedComponentDir[] {
  return resolveScanDirs_v2(
    resolve(import.meta.dirname, ".."),
    join(import.meta.dirname, "../app/components"),
    { defaultExtensions: ["js", "ts", "mjs", "mts", "cjs", "vue"] },
  );
}

export function builtinGlobalImports(): GlobalOptionsImports[] {
  return [
    join(import.meta.dirname, "../fetch"),
    join(import.meta.dirname, "../app/globals"),
  ];
}

export function builtinComposableImports(): GlobalOptionsImports[] {
  return [
    join(import.meta.dirname, "../app/composables"),
    join(import.meta.dirname, "../async-data/composable"),
  ];
}
