import fg from "fast-glob";
import fs from "node:fs";
import path from "node:path";
import type { ComponentDir, ComponentInfo, ResolvedOptions } from "./types.js";
import { extractDeclaredName } from "./extract-name.js";
import { toArray, toPascalCase } from "./utils.js";

function parseDirPattern(dir: string) {
  const globIndex = dir.search(/[*?{}[\]]/);
  if (globIndex === -1) {
    return { baseDir: dir, customPattern: null };
  }

  const lastSlash = dir.lastIndexOf("/", globIndex);
  const baseDir = lastSlash === -1 ? "." : dir.slice(0, lastSlash);
  const customPattern = dir.slice(lastSlash + 1);

  return { baseDir, customPattern };
}

interface ResolvedDirEntry {
  dirPaths: string[];
  extensions: string[];
  exclude: string[];
  componentName?: ResolvedOptions["componentName"];
}

/** Merges one `ComponentDir` entry with the top-level defaults. */
function resolveDirEntry(
  entry: ComponentDir,
  fallback: ResolvedOptions,
): ResolvedDirEntry {
  const fallbackExtensions = toArray(fallback.extensions, []);

  if (typeof entry === "string") {
    return {
      dirPaths: [entry],
      extensions: fallbackExtensions,
      exclude: fallback.exclude,
      componentName: fallback.componentName,
    };
  }

  if (!entry.dirs) {
    throw new Error(
      `[unplugin-vue-components-rename] A "dirs" object entry must specify its own "dirs" path(s).`,
    );
  }

  return {
    dirPaths: toArray(entry.dirs, []),
    extensions: toArray(entry.extensions, fallbackExtensions),
    exclude: entry.exclude ?? fallback.exclude,
    componentName: entry.componentName ?? fallback.componentName,
  };
}

export function scanComponents(
  root: string,
  options: ResolvedOptions,
): Map<string, ComponentInfo> {
  const entries = toArray(options.dirs, []);
  const map = new Map<string, ComponentInfo>();

  for (const rawEntry of entries) {
    const { dirPaths, extensions, exclude, componentName } = resolveDirEntry(
      rawEntry,
      options,
    );

    for (const rawDir of dirPaths) {
      const { baseDir, customPattern } = parseDirPattern(rawDir);
      const absDir = path.resolve(root, baseDir);

      if (!fs.existsSync(absDir)) continue;

      const isFile = fs.statSync(absDir).isFile();

      const pattern =
        customPattern ??
        (extensions.length === 1
          ? `**/*.${extensions[0]}`
          : `**/*.{${extensions.join(",")}}`);

      let files: string[];
      if (isFile) {
        files = [absDir];
      } else {
        files = fg.sync(pattern, {
          cwd: absDir,
          ignore: exclude,
          absolute: true,
          onlyFiles: true,
        });
      }

      const baseForRelative = isFile ? path.dirname(absDir) : absDir;

      for (const file of files) {
        const relative = path.relative(baseForRelative, file);
        const declaredName = file.endsWith("vue")
          ? undefined
          : extractDeclaredName(file);

        const defaultName = declaredName ?? toPascalCase(relative);

        let finalName: string | false | undefined = defaultName;
        if (componentName) {
          const result = componentName(file, defaultName);
          finalName = result === undefined ? defaultName : result;
        }

        if (finalName === false) continue;

        if (!finalName) {
          throw new Error(
            `[unplugin-vue-components-rename] "componentName" returned an empty name for ` +
              `${path.relative(root, file)}.`,
          );
        }

        const existing = map.get(finalName);
        if (existing && existing.from !== file) {
          throw new Error(
            `[unplugin-vue-components-rename] Name conflict: "${finalName}" is already used by ` +
              `${path.relative(root, existing.from)} and ${path.relative(root, file)}. ` +
              `Use the "componentName" option to rename one of them.`,
          );
        }

        map.set(finalName, { name: "default", from: file });

        if (options.verbose && !existing)
          console.log(
            `[unplugin-vue-components-rename] ${finalName} -> ${path.relative(root, file)}` +
              (declaredName ? ` (declared name)` : ""),
          );
      }
    }
  }

  return map;
}
