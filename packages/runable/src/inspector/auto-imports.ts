import { createUnimport } from "unimport";

import type { ResolvedComponentDir } from "@/components/types.js";
import { scanComponents } from "@/components/unplugin.js";
import { resolveConfigImports } from "@/globals/unplugin.js";
import type { GlobalOptionsImports } from "@/globals/unplugin.js";
import { toProjectRelative } from "./relative.js";
import type {
  InspectorAutoImports,
  InspectorComponent,
  InspectorImport,
} from "./types.js";

/**
 * Components: reuses `scanComponents` unchanged — the exact function the
 * real `:components` virtual-module plugin calls in `buildStart` — against
 * the already-resolved component dirs (`ResolvedConfig.components`).
 */
async function resolveComponents(
  rootDir: string,
  dirs: ResolvedComponentDir[],
): Promise<InspectorComponent[]> {
  const components = await scanComponents({ dirs });

  return [...components.values()]
    .map((c) => ({ name: c.name, file: toProjectRelative(rootDir, c.path) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Composables/globals: reuses `resolveConfigImports` (the same source-list
 * resolver the real `:globals`/`unimport` pipeline calls) plus `unimport`
 * itself (already a direct dependency, driving the real auto-import
 * transform) to compute the exported-name list — without needing Vite's
 * transform pipeline, since `unimport.getImports()` only reads each
 * source file's exports statically (via `getExports`, an AST-based scan
 * with no execution).
 */
async function resolveImports(
  rootDir: string,
  imports: GlobalOptionsImports[],
): Promise<InspectorImport[]> {
  const unimport = createUnimport({ imports: resolveConfigImports({ output: rootDir, imports }) });
  const resolved = await unimport.getImports();

  return resolved
    .map((i) => {
      const entry: InspectorImport = {
        name: i.as ?? i.name,
        file: toProjectRelative(rootDir, i.from),
      };
      if (i.name !== "default" && i.name !== entry.name) entry.exportName = i.name;
      return entry;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function resolveInspectorAutoImports(
  rootDir: string,
  options: {
    components: ResolvedComponentDir[];
    composables: GlobalOptionsImports[];
    globals: GlobalOptionsImports[];
  },
): Promise<InspectorAutoImports> {
  const [components, composables, globals] = await Promise.all([
    resolveComponents(rootDir, options.components),
    resolveImports(rootDir, options.composables),
    resolveImports(rootDir, options.globals),
  ]);

  return { components, composables, globals };
}
