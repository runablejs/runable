import fg from "fast-glob";
import fs from "node:fs";
import path from "node:path";
import type { ComponentInfo, ResolvedOptions } from "./types.js";
import { extractDeclaredName } from "./extract-name.js";
import { toPascalCase } from "./utils.js";

/**
 * Walks the configured directories and builds the finalName -> ComponentInfo
 * lookup table, applying `options.componentName` to support renaming.
 * Every local component is registered as a default export (`name: 'default'`).
 *
 * For non-SFC files (.js/.ts), if the component declares its own `name`
 * via `defineComponent({ name: '...' })` (or a default-exported object
 * literal), that name is used instead of the filename-derived one.
 */
export function scanComponents(
  root: string,
  options: ResolvedOptions,
): Map<string, ComponentInfo> {
  const dirs = Array.isArray(options.dirs) ? options.dirs : [options.dirs];
  const extensions = Array.isArray(options.extensions)
    ? options.extensions
    : [options.extensions];
  const map = new Map<string, ComponentInfo>();

  for (const dir of dirs) {
    const absDir = path.resolve(root, dir);
    if (!fs.existsSync(absDir)) continue;

    const pattern =
      extensions.length === 1
        ? `**/*.${extensions[0]}`
        : `**/*.{${extensions.join(",")}}`;

    let files: string[];
    if (fs.statSync(dir).isFile()) files = [dir];
    else {
      files = fg.sync(pattern, {
        cwd: absDir,
        ignore: options.exclude,
        absolute: true,
        onlyFiles: true,
      });
    }

    for (const file of files) {
      const relative = path.relative(absDir, file);
      const declaredName = extractDeclaredName(file);
      const defaultName = declaredName ?? toPascalCase(relative);

      let finalName: string | false | undefined = defaultName;
      if (options.componentName) {
        const result = options.componentName(file, defaultName);
        finalName = result === undefined ? defaultName : result;
      }

      // The component is explicitly excluded from auto-import.
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

  return map;
}
