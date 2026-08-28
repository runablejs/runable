import { existsSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import { createUnplugin } from "unplugin";
import { createUnimport, Import, Unimport } from "unimport";

import { getChildren } from "../utils/get-children.js";
import { getExports } from "../utils/get-exports.js";
import { atomicWriteFile } from "../utils/atomic-write-file.js";
import { normalizeDir, ResolvedScanDirFile } from "../utils/dir/index.js";
import { getPackageJson } from "@/utils/pkg.js";
import { resolvePackageEntry } from "@/utils/pkg-resolve-entry.js";
import type { Arrayable } from "@/utils/types.js";
import { toArray } from "@/utils/to-array.js";
import { isTypeDeclaration } from "@/utils/is-type-declaration.js";

// -----------------------------------------------------------------------
// Config types
// -----------------------------------------------------------------------

type ImportsCommon = { from: string; imports: string[] };
type ImportsMap = Record<string, string[]>;

export type GlobalOptionsImports =
  | ResolvedScanDirFile[]
  | string
  | ImportsCommon
  | ImportsMap;

export type GlobalConfig = {
  /** Directory where `globals.d.ts` is written. Defaults to `process.cwd()`. */
  output: string;
  imports: Arrayable<GlobalOptionsImports>;
  /** Dependency files explicitly registered by Runable and allowed to use auto-imports. */
  transformInclude?: string[];
};

export function shouldTransformGlobals(
  id: string,
  transformInclude: string[] = [],
): boolean {
  if (id.startsWith("\0")) return false;
  if (!id.includes("node_modules")) return true;

  const file = id.split("?", 1)[0];
  return transformInclude.includes(file!);
}

// -----------------------------------------------------------------------
// Export resolution — turns config `imports` entries into a flat map of
// exportable names, run once per config during `buildStart`.
// -----------------------------------------------------------------------

const JS_EXTENSIONS = [".js", ".ts", ".mjs", ".mts"] as const;

/**
 * Resolves a file path by trying each supported extension in order and
 * returning the first one that exists on disk, since callers may omit it.
 */
function resolveFile(file: string): string | undefined {
  for (const ext of JS_EXTENSIONS) {
    const candidate = file.endsWith(ext) ? file : `${file}${ext}`;
    if (
      !isTypeDeclaration(candidate) &&
      existsSync(candidate) &&
      statSync(candidate).isFile()
    ) {
      return candidate;
    }
  }
  return undefined;
}

/**
 * Resolves a `{ from, imports }` entry (a preset or a user-declared
 * package import) to its actual file on disk via the package's
 * package.json, then merges each named import into `target`.
 *
 * Supports subpath imports, e.g. `"@unhead/schema-org/vue"` resolves the
 * package `@unhead/schema-org` with subpath `"vue"`.
 */
function resolvePackageImport(moduleName: string) {
  const segments = moduleName.split("/");
  const packageName = segments.slice(0, 2).join("/");
  const subpath = segments.length > 2 ? segments.slice(2).join("/") : undefined;

  const { dir, content } = getPackageJson(packageName, import.meta.dirname);
  const entry = resolvePackageEntry(content, subpath, "import");
  if (!entry.default) return;

  const file = join(dir, entry.default);
  const fileType = entry.types ? join(dir, entry.types) : undefined;

  return { file, type: fileType };
}

/**
 * Resolves one config's `imports` (presets, files, directories, packages)
 * and merges the resulting exports into `target`. Pure merge — never
 * touches the filesystem output, so several configs can call this against
 * the same shared accumulator without clobbering each other.
 */
export function resolveConfigImports(config: GlobalConfig | undefined): Import[] {
  const rawImports = config?.imports ?? [];
  const entries = Array.isArray(rawImports) ? rawImports : [rawImports];
  const imports: Import[] = [];

  for (const entry of entries) {
    if (typeof entry === "string") {
      if (!existsSync(entry)) continue;

      if (statSync(entry).isFile()) {
        const file = resolveFile(entry);
        if (!file) continue;

        imports.push(
          ...Object.values(getExports(file).exports).map((exp) => ({
            name: exp.name,
            from: exp.file,
          })),
        );
      } else {
        const files = getChildren(entry, {
          recursive: true,
          onlyFile: true,
          endWith: /\.(js|ts|mjs|mts|cjs)$/,
        });

        for (const file of files) {
          if (isTypeDeclaration(file.path)) continue;

          imports.push(
            ...Object.values(getExports(file.path).exports).map((exp) => ({
              name: exp.name,
              from: exp.file,
            })),
          );
        }
      }

      continue;
    }

    if (Array.isArray(entry)) {
      for (const file of entry) {
        if (isTypeDeclaration(file.file)) continue;

        imports.push(
          ...Object.values(getExports(file.file).exports).map((exp) => ({
            name: exp.name,
            from: exp.file,
          })),
        );
      }

      continue;
    }

    if ("from" in entry && "imports" in entry) {
      imports.push(
        ...entry.imports.map((name) => ({ name, from: entry.from as string })),
      );

      continue;
    }

    for (let [from, names] of Object.entries(entry)) {
      names = toArray(names);
      imports.push(...names.map((name) => ({ name, from })));
    }
  }

  return imports;
}

// -----------------------------------------------------------------------
// Plugin
// -----------------------------------------------------------------------

export default createUnplugin<GlobalConfig>((config) => {
  let unimport: Unimport;

  return [
    {
      name: "runable:globals",
      enforce: "pre",

      vite: {
        async buildStart() {
          unimport = createUnimport({
            imports: resolveConfigImports(config),
          });

          const dts = await unimport.generateTypeDeclarations({
            resolvePath: (r) => {
              if (!existsSync(r.from)) {
                const imports = resolvePackageImport(r.from);
                if (!imports) return r.from;

                return normalizeDir(relative(config.output, imports.file));
              }

              return normalizeDir(relative(config.output, r.from));
            },
          });

          (await unimport.getImports()).map((i) => {
            this.addWatchFile(i.from);
          });

          atomicWriteFile(resolve(config.output, "globals.d.ts"), dts);
        },
      },
    },

    {
      name: "runable:globals:transform",
      enforce: "post",

      async transform(code, id) {
        if (!shouldTransformGlobals(id, config.transformInclude)) return;

        const result = await unimport.injectImports(code, id);
        if (!result.s.hasChanged()) return;

        return {
          code: result.s.toString(),
          map: result.s.generateMap({ hires: true }),
        };
      },
    },
  ];
});
