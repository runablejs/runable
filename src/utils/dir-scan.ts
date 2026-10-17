import fg from "fast-glob";
import { join } from "node:path";

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

  const _options: fg.Options = {
    ...rest,
    cwd,
    absolute: true,
    ignore: exclude ? (Array.isArray(exclude) ? exclude : [exclude]) : [],
  };

  const files = fg.globSync(patterns, _options);

  return { ..._options, files } as ResolveScanDir<Extra>;
}
