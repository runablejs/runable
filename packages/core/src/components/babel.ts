import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";

// @babel/traverse ships as a CJS module. Depending on the bundler/loader
// used to build *this* plugin, the callable function can end up on
// `.default` instead of being the module's top-level export. This
// normalizes both shapes so `traverse(...)` always works.
export const traverse: typeof _traverse =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((_traverse as any).default ?? _traverse) as typeof _traverse;

/**
 * Parses a script (JS/TS/JSX/TSX, or the content of a Vue `<script>` block)
 * into a Babel AST. Both `typescript` and `jsx` syntax plugins are enabled
 * unconditionally: this keeps a single parser configuration that works for
 * every extension we support, without needing to branch on the file type.
 */
export function parseScript(code: string) {
  return parse(code, {
    sourceType: "module",
    plugins: [
      "typescript",
      "jsx",
      "decorators-legacy",
      "classProperties",
      "topLevelAwait",
    ],
    errorRecovery: true,
  });
}
