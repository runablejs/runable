import type { ComponentInfo, ResolvedOptions } from "./types";
import { getDefaultComponentName, slash } from "./utils";
import { resolveScanFiles, toArray } from "@/utils";

export async function scanComponents(
  options: ResolvedOptions,
  log: (msg: string) => void,
): Promise<Map<string, ComponentInfo>> {
  const map = new Map<string, ComponentInfo>();

  for (const dirConfig of options.dirs) {
    const { dirs, extensions, pathPrefix, componentName } = dirConfig;

    for (const dir of toArray(dirs)) {
      const files = resolveScanFiles([{ ...dirConfig, dirs: [dir] }]);

      for (const file of files) {
        const absPath = slash(file);
        const defaultName = getDefaultComponentName(
          absPath,
          dir,
          pathPrefix ?? true,
        );
        if (!defaultName) continue;
        let name: string | false | undefined = defaultName;
        if (componentName) {
          try {
            name = componentName(absPath, defaultName);
          } catch (err) {
            log(
              `[syora:components] componentName() threw for "${absPath}": ${(err as Error).message}`,
            );
            name = defaultName;
          }
        }
        if (name === false) continue;
        if (name === undefined) name = defaultName;
        const previous = map.get(name);
        if (previous && previous.path !== absPath) {
          log(
            `[syora:components] duplicate component name "${name}": ` +
              `"${previous.path}" is overridden by "${absPath}"`,
          );
        }
        const ext = extensions.find((e) => absPath.endsWith(`.${e}`)) ?? "";
        map.set(name, { name, path: absPath, ext });
      }
    }
  }

  return map;
}
