import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

interface PathChild {
  name: string;
  path: string;
}

interface GetChildrenOptions {
  recursive?: number | boolean;
  onlyFile?: boolean;
  endWith?: string | RegExp;
  filter?: (file: PathChild) => boolean;
}

function escapeRegExp(value: string) {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

export function getChildren(path: string, options: GetChildrenOptions = {}) {
  const {
    recursive = 1,
    onlyFile: isOnlyFile = false,
    endWith,
    filter,
  } = options;

  const children: PathChild[] = [];

  const matcher =
    typeof endWith === "string"
      ? new RegExp(`${escapeRegExp(endWith)}$`)
      : endWith;

  const walk = (parent: string, depth: number) => {
    if (!existsSync(parent)) return;
    if (!statSync(parent).isDirectory()) return;

    const entries = readdirSync(parent).map<PathChild>((name) => ({
      name,
      path: join(parent, name),
    }));

    for (const entry of entries) {
      const stats = statSync(entry.path);
      const isFile = stats.isFile();
      const isDirectory = stats.isDirectory();

      if (isOnlyFile && !isFile) {
        if (isDirectory && shouldRecurse(depth)) {
          walk(entry.path, depth + 1);
        }
        continue;
      }

      if (matcher && isFile && !matcher.test(entry.path)) {
        continue;
      }

      if (filter && !filter(entry)) {
        continue;
      }

      children.push(entry);

      if (isDirectory && shouldRecurse(depth)) {
        walk(entry.path, depth + 1);
      }
    }
  };

  const shouldRecurse = (depth: number) => {
    if (recursive === true) return true;
    if (recursive === false) return false;
    return depth < recursive;
  };

  walk(path, 0);

  return children;
}
