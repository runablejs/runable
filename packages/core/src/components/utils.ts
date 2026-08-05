import { basename, extname, isAbsolute, relative } from "node:path";

export function slash(p: string): string {
  return p.replace(/\\/g, "/");
}

/** Converts a single path segment (kebab-case, snake_case, dot.case...) to PascalCase. */
export function segmentToPascalCase(segment: string): string {
  return segment
    .split(/[-_.\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * Computes the default PascalCase component name from an absolute file path.
 *
 * - `src/components/base/Button.vue` -> `BaseButton` (pathPrefix: true) or `Button`
 * - `src/components/Button/index.vue` -> `Button` (folder name is used, not "Index")
 */
export function getDefaultComponentName(
  absPath: string,
  scanDir: string,
  pathPrefix: boolean,
): string {
  const ext = extname(absPath);
  const rel =
    absPath === scanDir ? basename(absPath) : relative(scanDir, absPath);
  const relNoExt = ext ? rel.slice(0, -ext.length) : rel;
  const segments = slash(relNoExt).split("/").filter(Boolean);

  // Folder/index.vue -> use the folder name only, drop the trailing "index".
  if (
    segments.length > 1 &&
    segments[segments.length - 1]?.toLowerCase() === "index"
  ) {
    segments.pop();
  }

  const parts = pathPrefix ? segments : [segments[segments.length - 1]!];
  return parts.map(segmentToPascalCase).join("");
}

/** True if `child` is inside (or equal to) `parent`. */
export function isSubPath(parent: string, child: string): boolean {
  const rel = relative(parent, child);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}
