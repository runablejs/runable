import { readFileSync } from "node:fs";

export interface StaticPluginMeta {
  name?: string;
  enforce?: "pre" | "post";
  dependsOn?: string[];
}

/**
 * Statically reads the `name` / `enforce` / `dependsOn` fields off a
 * `defineVuePlugin({ ... })` call, without importing (and therefore
 * executing) the plugin file — the object also contains a `setup(app)`
 * function, so unlike `extractPageMeta` this can't just `JSON.parse` the
 * whole literal; each field is matched independently instead.
 *
 * Best-effort: a field written as anything other than a plain string/array
 * literal (a computed value, a spread, an imported constant) is left
 * `undefined` rather than guessed at.
 */
export function extractPluginMeta(filePath: string, code?: string): StaticPluginMeta {
  code ??= readFileSync(filePath, "utf-8");

  const call = /defineVuePlugin\s*\(\s*{/.exec(code);
  if (!call) return {};

  // Scan only the object literal passed to defineVuePlugin, not the whole
  // file — a `name:`/`enforce:` elsewhere (e.g. inside `setup`) must not
  // be picked up.
  const objectText = extractBalancedObject(code, call.index + call[0].length - 1);
  if (!objectText) return {};

  const name = /(?:^|[,{])\s*name\s*:\s*["'`]([^"'`]+)["'`]/.exec(objectText)?.[1];
  const enforce = /(?:^|[,{])\s*enforce\s*:\s*["'`](pre|post)["'`]/.exec(
    objectText,
  )?.[1] as "pre" | "post" | undefined;

  const dependsOnMatch = /(?:^|[,{])\s*dependsOn\s*:\s*\[([^\]]*)\]/.exec(objectText);
  const dependsOn = dependsOnMatch?.[1]
    ? [...dependsOnMatch[1].matchAll(/["'`]([^"'`]+)["'`]/g)].map((m) => m[1]!)
    : undefined;

  return { name, enforce, dependsOn };
}

/** Returns the text of the `{...}` object starting at `openBraceIndex`
 * (inclusive), matching braces so nested objects/functions don't confuse
 * the scan — or `undefined` if the braces never balance. */
function extractBalancedObject(
  code: string,
  openBraceIndex: number,
): string | undefined {
  let depth = 0;

  for (let i = openBraceIndex; i < code.length; i++) {
    if (code[i] === "{") depth++;
    else if (code[i] === "}") {
      depth--;
      if (depth === 0) return code.slice(openBraceIndex, i + 1);
    }
  }

  return undefined;
}
