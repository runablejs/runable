import { readFileSync } from "node:fs";

export function extractPageMeta(
  filePath: string,
  code?: string,
): { name?: string; path?: string; alias?: string[] } & Record<
  string,
  unknown
> {
  if (!code) code = readFileSync(filePath, "utf-8");

  const match = code.match(/definePageMeta\s*\(\s*({[\s\S]*?})\s*\)/);

  if (match) {
    let metaStr = match[1]
      ?.replace(/(\w+):/g, '"$1":') // quote keys
      .replace(/'/g, '"') // simple quotes -> double
      .replace(/,\s*}/g, "}"); // trailing comma

    if (!metaStr) metaStr = "{}";

    const meta = JSON.parse(metaStr);

    return meta;
  }

  return {};
}
