import type { ResolvedScanDirFile } from "@/utils/dir/scan.js";
import { resolveMiddleware } from "@/router/middleware/unplugin.js";
import { toProjectRelative } from "./relative.js";
import type { InspectorMiddleware } from "./types.js";

/**
 * Reuses `resolveMiddleware` — the exact naming/`.global.*` detection
 * function the real `:router-middlewares` virtual-module plugin uses
 * (`router/middleware/unplugin.ts`) — against the already fully-resolved
 * middleware files on the config (`ResolvedConfig.middlewares`).
 */
export function resolveInspectorMiddlewares(
  rootDir: string,
  middlewareFiles: ResolvedScanDirFile[],
): InspectorMiddleware[] {
  return middlewareFiles.map((entry) => {
    const { name, isGlobal } = resolveMiddleware(entry.file, entry.parent);
    return { name, global: isGlobal, file: toProjectRelative(rootDir, entry.file) };
  });
}
