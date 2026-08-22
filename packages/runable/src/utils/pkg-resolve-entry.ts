import type { ExportEntry, PackageJson } from "./pkg";

export interface ResolvedExport {
  default?: string;
  types?: string;
}

/**
 * Determines the default module resolution condition ("import" or "require")
 * based on the package's `type` field.
 *
 * Per Node.js semantics:
 * - `type: "module"` → the package is ESM by default → prefer "import"
 * - `type: "commonjs"` or missing → the package is CJS by default → prefer "require"
 *
 * @param pkg - The parsed package.json
 * @returns "import" if the package is ESM, "require" otherwise
 */
function getDefaultCondition(pkg: PackageJson): "import" | "require" {
  return pkg.type === "module" ? "import" : "require";
}

/**
 * Normalizes a simple export entry (string or { types, default }) into a
 * ResolvedExport shape.
 *
 * @param entry - The export entry to normalize
 * @returns The resolved `default` and `types` paths, if present
 */
function resolveExportType(entry: ExportEntry | undefined): ResolvedExport {
  if (!entry) return {};

  // A string entry only describes the default entry point, no types info
  if (typeof entry === "string") {
    return { default: entry };
  }

  return { default: entry.default, types: entry.types };
}

/**
 * Resolves an export entry that may contain conditional exports
 * (`import` / `require`), a plain ExportEntry, or a string.
 *
 * If the preferred condition is missing, falls back to the other one
 * so we still return something usable rather than an empty result.
 *
 * @param entry - The export entry (string, ExportEntry, or conditional object)
 * @param condition - The preferred condition to resolve ("import" or "require")
 * @returns The resolved `default` and `types` paths, if present
 */
function resolveConditionalExport(
  entry:
    | ExportEntry
    | { import?: ExportEntry; require?: ExportEntry }
    | undefined,
  condition: "import" | "require",
): ResolvedExport {
  if (!entry) return {};

  if (typeof entry === "string") {
    return { default: entry };
  }

  // Conditional entry: { import?, require? }
  if ("import" in entry || "require" in entry) {
    const preferred = entry[condition];
    const otherCondition = condition === "import" ? "require" : "import";
    const fallback = entry[otherCondition];

    return resolveExportType(preferred ?? fallback);
  }

  // Plain entry: { types?, default? }
  return resolveExportType(entry as ExportEntry);
}

/**
 * Resolves the `default` entry point and `types` declaration file for a
 * given package, optionally for a specific subpath export (e.g. "vue",
 * "./vue/meta").
 *
 * Resolution order:
 * 1. Look up the subpath in `exports` (handles string, { types, default },
 *    and conditional { import, require } shapes).
 * 2. If resolving the root export (".") and `types` is still missing,
 *    fall back to the top-level `types` / `typings` fields.
 * 3. If there is no matching `exports` entry at all:
 *    - for the root export, fall back to `module` / `main` and
 *      `types` / `typings`.
 *    - for a subpath export, there is no reliable fallback, so an
 *      empty object is returned.
 *
 * @param pkg - The parsed package.json
 * @param subpath - The subpath export to resolve ("." for the root export)
 * @param condition - Preferred module condition ("import" or "require").
 *   Defaults to the package's own `type` field: "module" → "import",
 *   "commonjs" or missing → "require".
 * @returns The resolved `default` and `types` paths, if found
 *
 * @example
 * resolvePackageEntry(pkg);           // root export, condition inferred from pkg.type
 * resolvePackageEntry(pkg, "vue");    // "./vue" subpath export
 * resolvePackageEntry(pkg, ".", "require"); // force CJS resolution
 */
export function resolvePackageEntry(
  pkg: PackageJson,
  subpath: string = ".",
  condition: "import" | "require" = getDefaultCondition(pkg),
): ResolvedExport {
  // Normalize subpath: "vue" -> "./vue", "." stays as-is
  const key =
    subpath === "." ? "." : subpath.startsWith("./") ? subpath : `./${subpath}`;

  const exportEntry = pkg.exports?.[key];

  if (exportEntry !== undefined) {
    const resolved = resolveConditionalExport(exportEntry, condition);

    // Fall back to root-level `types`/`typings` only for the root export
    if (!resolved.types && key === ".") {
      resolved.types = pkg.types ?? pkg.typings;
    }

    return resolved;
  }

  // No matching entry in "exports"
  if (key === ".") {
    // Fall back to legacy fields for the root export
    return {
      default: pkg.module ?? pkg.main,
      types: pkg.types ?? pkg.typings,
    };
  }

  // Subpath export requested but not found: no reliable fallback
  return {};
}
