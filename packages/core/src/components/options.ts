import type {
  ComponentDir,
  AutoComponentOptions,
  ResolvedComponentDir,
  ResolvedOptions,
  ComponentFallback,
  ComponentScanExtra,
} from "./types.js";
import {
  Arrayable,
  resolveDir as _resolveDir,
  mergeExcludePatterns,
  resolveScanDirs_v2,
  toArray,
} from "@/utils";

const DEFAULT_EXTENSIONS = ["vue"];
const DEFAULT_DTS = "components.d.ts";

export function resolveOptions(
  options: AutoComponentOptions,
  root: string,
): ResolvedOptions {
  mergeExcludePatterns(options.exclude);

  const rawDirs = toArray(options.dirs ?? []).map((raw) => {
    raw.pathPrefix = raw.pathPrefix ?? options.pathPrefix ?? true;

    raw.componentName ??= options.componentName;

    raw.extensions ??= toArray(options.extensions ?? []);

    raw.exclude = mergeExcludePatterns(
      raw.exclude,
      toArray(options.extensions ?? []),
    );

    return raw;
  });

  return {
    root,
    dirs: rawDirs,
    dts:
      options.dts === true || typeof options.dts === "undefined"
        ? DEFAULT_DTS
        : options.dts,
    verbose: options.verbose ?? false,
  };
}

export function resolveComponentDirs(
  cwd: string,
  dirs: Arrayable<ComponentDir>,
  { fallback }: { fallback?: ComponentFallback } = {},
): ResolvedComponentDir[] {
  return resolveScanDirs_v2<ComponentScanExtra>(cwd, dirs, {
    defaultExtensions: DEFAULT_EXTENSIONS,
    fallback,
    resolveExtra: (raw, fb) => ({
      pathPrefix: raw.pathPrefix ?? fb.pathPrefix ?? true,
      componentName: raw.componentName ?? fb.componentName,
      extensions: raw.extensions ?? fb.extensions ?? ["vue"],
      prefix: raw.prefix ?? fb.prefix,
    }),
  });

  // return resolveScanDirs<ComponentScanExtra>(cwd, dirs, {
  //   defaultExtensions: DEFAULT_EXTENSIONS,
  //   fallback,
  //   resolveExtra: (raw, fb) => ({
  //     pathPrefix: raw.pathPrefix ?? fb.pathPrefix ?? true,
  //     componentName: raw.componentName ?? fb.componentName,
  //   }),
  // });
}
