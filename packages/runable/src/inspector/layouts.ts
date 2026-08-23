import type { ResolvedScanDirFile } from "@/utils/dir/scan.js";
import { getLayoutName } from "@/layout/unplugin.js";
import { toProjectRelative } from "./relative.js";
import type { InspectorLayout } from "./types.js";

/**
 * Reuses `getLayoutName` — the exact naming function the real `:layouts`
 * virtual-module plugin uses (`layout/unplugin.ts`) — against the already
 * fully-resolved layout files on the config (`ResolvedConfig.layouts`), so
 * this never rescans the filesystem or reimplements the naming convention.
 */
export function resolveInspectorLayouts(
  rootDir: string,
  layoutFiles: ResolvedScanDirFile[],
): InspectorLayout[] {
  return layoutFiles.map((entry) => ({
    name: getLayoutName(entry.file, entry.parent),
    file: toProjectRelative(rootDir, entry.file),
  }));
}
