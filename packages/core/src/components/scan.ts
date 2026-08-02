import fg from "fast-glob";
import type { ComponentInfo, ResolvedOptions } from "./types";
import { getDefaultComponentName, slash } from "./utils";

export async function scanComponents(
  options: ResolvedOptions,
  log: (msg: string) => void,
): Promise<Map<string, ComponentInfo>> {
  const map = new Map<string, ComponentInfo>();

  for (const dirConfig of options.dirs) {
    const { dirs, extensions, exclude, pathPrefix, componentName } = dirConfig;
    const extGlob =
      extensions.length === 1 ? extensions[0] : `{${extensions.join(",")}}`;

    for (const dir of dirs) {
      let files: string[] = [];
      try {
        files = await fg(`**/*.${extGlob}`, {
          cwd: dir,
          absolute: true,
          onlyFiles: true,
          ignore: exclude,
        });
      } catch (err) {
        log(
          `[unplugin-auto-components] failed to scan "${dir}": ${(err as Error).message}`,
        );
        continue;
      }

      for (const file of files) {
        const absPath = slash(file);
        const defaultName = getDefaultComponentName(absPath, dir, pathPrefix);
        if (!defaultName) continue;

        let name: string | false | undefined = defaultName;
        if (componentName) {
          try {
            name = componentName(absPath, defaultName);
          } catch (err) {
            log(
              `[unplugin-auto-components] componentName() threw for "${absPath}": ${(err as Error).message}`,
            );
            name = defaultName;
          }
        }

        if (name === false) continue;
        if (name === undefined) name = defaultName;

        const previous = map.get(name);
        if (previous && previous.path !== absPath) {
          log(
            `[unplugin-auto-components] duplicate component name "${name}": ` +
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
