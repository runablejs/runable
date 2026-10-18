import type { Arrayable } from "@/types/reset.js";
import fg from "fast-glob";
import { extname, join } from "node:path";

export type DirOptions = Omit<fg.Options, "ignore"> & {
  exclude?: string | string[];
  folder?: string;
} & (
    | { patterns: string | string[] }
    | { patterns?: string | string[]; extensions: string | string[] }
  );

export type ScanDir<Extra extends object = {}> = Omit<
  DirOptions,
  "cwd" | "absolute"
> &
  Extra;

export type ResolveScanDir<Extra extends object = {}> = fg.Options & {
  extensions?: string[];
  files: string[];
} & Extra;

export function scanDir<Extra extends object = {}>(
  options: DirOptions,
): ResolveScanDir<Extra> {
  let { patterns = [], exclude, cwd, folder, ...rest } = options;

  patterns = Array.isArray(patterns) ? patterns : [patterns];

  if ("extensions" in options) {
    const extensions = Array.isArray(options.extensions)
      ? options.extensions
      : [options.extensions];

    patterns = extensions.map((extension) => {
      const normalizedExtension = extension.startsWith(".")
        ? extension
        : `.${extension}`;

      return `**/*${normalizedExtension}`;
    });
  }

  if (folder) {
    if (cwd) cwd = join(cwd, folder);
    else cwd = folder;
  }

  const defaultExcludes = ["**/-*/**", "**/-*", "**/*.d.*", "**/.git/**"];

  const _options: fg.Options = {
    ...rest,
    cwd,
    absolute: true,
    ignore: [
      ...defaultExcludes,
      ...(exclude ? (Array.isArray(exclude) ? exclude : [exclude]) : []),
    ],
  };

  const files = fg.globSync(patterns, _options);

  return { ..._options, files } as ResolveScanDir<Extra>;
}

export function scanDirs(options: Arrayable<DirOptions>) {
  const entries = Array.isArray(options) ? options : [options];
  return entries.map((entry) => scanDir(entry));
}

export function resolveScanDirOptions(
  options: Arrayable<ScanDir | string>,
  merge?: DirOptions & Record<string, unknown>,
): DirOptions[] {
  const entries = Array.isArray(options) ? options : [options];

  return entries.map((option) => {
    if (typeof option !== "string") {
      return { ...merge, ...option } as DirOptions;
    }

    const isFile = extname(option) !== "";

    return {
      ...merge,
      ...(isFile ? { patterns: option } : { folder: option }),
    } as DirOptions;
  });
}
