import type { ResolvedConfig } from "@/config/types.js";
import { getPackageJson } from "@/utils/pkg.js";
import { toProjectRelative } from "./relative.js";
import type { InspectorProject } from "./types.js";

/** Reuses `getPackageJson` (the same package-resolution primitive `config/load.ts`
 * itself uses to resolve modules) to read the actually-installed `runable` version
 * for this project, rather than assuming it matches the Inspector's own build. */
function resolveRunableVersion(rootDir: string): string | undefined {
  try {
    return getPackageJson("runable", rootDir).content.version;
  } catch {
    return undefined;
  }
}

export function resolveInspectorProject(
  rootDir: string,
  main: ResolvedConfig,
): InspectorProject {
  return {
    rootDir,
    runableVersion: resolveRunableVersion(rootDir),
    ssr: main.ssr,
    paths: {
      appDir: toProjectRelative(rootDir, main.appDir),
      generatedDir: toProjectRelative(rootDir, main.output),
      outputDir: toProjectRelative(rootDir, main.distdir),
      publicDir:
        typeof main.publicDir === "string"
          ? toProjectRelative(rootDir, main.publicDir)
          : undefined,
    },
  };
}
