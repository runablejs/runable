export * from "./scan.js";
export * from "./alias.js";

import { isAbsolute, join, parse, resolve } from "node:path";
import { Arrayable } from "../types.js";

export function normalizeDir(dir: string) {
  if (!isAbsolute(dir) && !dir.startsWith("..") && !dir.startsWith("./")) {
    dir = `./${dir.replace(/\\/g, "/")}`;
  }
  return dir;
}

export function normalizeDirs<T extends object>(dirs: T) {
  function _forEach(datas: any) {
    if (Array.isArray(datas)) {
      for (let i = 0; i < datas.length; i++) {
        datas[i] = _forEach(datas[i]);
      }
    } else if (Object.prototype.toString.call(datas) === "[object Object]") {
      for (const key in datas) {
        datas[key] = _forEach(datas[key]);
      }
    } else if (typeof datas === "string") {
      datas = normalizeDir(datas);
    }

    return datas;
  }

  return _forEach(dirs) as T;
}

export function resolveDir<TDir extends Arrayable<string>>(
  dir: TDir,
  root?: string,
) {
  if (typeof dir === "string") {
    dir = _resolver(dir, root) as TDir;
  } else {
    for (let i = 0; i < dir.length; i++) {
      dir[i] = _resolver(dir[i]!, root);
    }
  }

  function _resolver(dir: string, root?: string) {
    if (!isAbsolute(dir)) {
      if (root) dir = resolve(root, dir);
      else dir = resolve(process.cwd(), dir);
    }

    return dir;
  }

  return dir;
}

export function parseDirPattern(dir: string) {
  const globIndex = dir.search(/[*?{}[\]]/);
  if (globIndex === -1) {
    return { baseDir: dir, customPattern: null };
  }

  const lastSlash = dir.lastIndexOf("/", globIndex);
  const baseDir = lastSlash === -1 ? "." : dir.slice(0, lastSlash);
  const customPattern = dir.slice(lastSlash + 1);

  return { baseDir, customPattern };
}

export function removeFileExtension(filePath: string): string {
  const { dir, name } = parse(filePath);
  return dir ? join(dir, name) : name;
}
