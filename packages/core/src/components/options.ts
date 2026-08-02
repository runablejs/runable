import { isAbsolute, resolve } from "node:path";
import type {
  ComponentDir,
  AutoComponentOptions,
  ResolvedComponentDir,
  ResolvedOptions,
} from "./types";
import { toArray } from "./utils";

const DEFAULT_DIRS = "src/components";
const DEFAULT_EXTENSIONS = ["vue"];
const DEFAULT_EXCLUDE = ["**/.git/**", "**/*.d.*", "**/-*.*"]; // "**/node_modules/**",
const DEFAULT_DTS = "components.d.ts";

interface Fallback {
  extensions: string[];
  exclude: string[];
  pathPrefix: boolean;
  componentName?: AutoComponentOptions["componentName"];
}

function resolveDir(
  root: string,
  dir: ComponentDir,
  fallback: Fallback,
): ResolvedComponentDir {
  const raw = typeof dir === "string" ? { dirs: dir } : dir;

  const dirs = toArray(raw.dirs).map((d) =>
    isAbsolute(d) ? d : resolve(root, d),
  );
  const extensions = raw.extensions
    ? toArray(raw.extensions)
    : fallback.extensions;
  const exclude = raw.exclude ?? fallback.exclude;
  const pathPrefix = raw.pathPrefix ?? fallback.pathPrefix;
  const componentName = raw.componentName ?? fallback.componentName;

  return { dirs, extensions, exclude, pathPrefix, componentName };
}

export function resolveOptions(
  options: AutoComponentOptions,
  root: string,
): ResolvedOptions {
  const fallback: Fallback = {
    extensions: toArray(options.extensions ?? DEFAULT_EXTENSIONS),
    exclude: [...DEFAULT_EXCLUDE, ...(options.exclude ?? [])],
    pathPrefix: options.pathPrefix ?? true,
    componentName: options.componentName,
  };

  const rawDirs = options.dirs ? toArray(options.dirs) : [DEFAULT_DIRS];

  return {
    root,
    dirs: rawDirs.map((dir) => resolveDir(root, dir, fallback)),
    dts:
      options.dts === true || typeof options.dts === "undefined"
        ? DEFAULT_DTS
        : options.dts,
    verbose: options.verbose ?? false,
  };
}
