import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import MagicString from "magic-string";
import { createUnplugin } from "unplugin";

/**
 * @fileoverview Vite plugin that adds custom `import.meta.*` shorthands
 * for common environment checks (SSR, client, dev, prod) and build values.
 *
 * This plugin statically rewrites the following properties on `import.meta`
 * into their equivalent Vite `import.meta.env` expressions, allowing a more
 * ergonomic syntax in application code:
 *
 * | Shorthand                  | Rewritten to                    |
 * |-----------------------------|----------------------------------|
 * | `import.meta.server`        | `import.meta.env.SSR`            |
 * | `import.meta.client`        | `!import.meta.env.SSR`           |
 * | `import.meta.development`   | `import.meta.env.DEV`            |
 * | `import.meta.production`    | `import.meta.env.PROD`           |
 * | `import.meta.baseUrl`       | `import.meta.env.BASE_URL`       |
 *
 * @example
 * ```ts
 * if (import.meta.server) {
 *   // server-only code
 * }
 *
 * const assetUrl = `${import.meta.baseUrl}logo.png`;
 * ```
 *
 * @remarks
 * - Only `.js`, `.jsx`, `.ts`, `.tsx`, and compiled `.vue` files are processed.
 * - Files that don't contain the string `import.meta` are skipped early for
 *   performance.
 * - Files that fail to parse (e.g. raw, uncompiled SFCs) are silently ignored.
 * - Registered with `enforce: "post"` so it runs after other transforms
 *   (notably `@vitejs/plugin-vue`, which must compile `.vue` files to plain
 *   JS before this plugin can process them).
 *
 * @see {@link https://vitejs.dev/guide/env-and-mode.html} for Vite's native
 * `import.meta.env` variables (`SSR`, `DEV`, `PROD`, `BASE_URL`) that this
 * plugin builds on.
 */
export default createUnplugin(() => {
  return {
    name: "runable:import-meta",
    enforce: "post",

    vite: {
      transform(code, id) {
        // Only target JS/TS/JSX/TSX files. (.vue files reach this point already
        // compiled to JS by @vitejs/plugin-vue, provided that plugin is registered
        // before this one.)
        if (!/\.(vue|[jt]sx?)(\?|$)/.test(id)) return;
        if (!code.includes("import.meta")) return;

        let ast;
        try {
          ast = parse(code, {
            sourceType: "module",
            plugins: ["typescript", "jsx"],
          });
        } catch {
          // Content is not parseable as-is (e.g. a raw, uncompiled SFC) -> skip it
          return;
        }

        const s = new MagicString(code);
        let touched = false;

        // Lookup table mapping our custom `import.meta.*` shorthands to their
        // actual replacement expression, based on Vite's built-in `import.meta.env`.
        const REPLACEMENTS: Record<string, string> = {
          server: "import.meta.env.SSR",
          client: "!import.meta.env.SSR",
          development: "import.meta.env.DEV",
          production: "import.meta.env.PROD",
          baseUrl: "import.meta.env.BASE_URL",
        };

        traverse(ast, {
          MemberExpression(path) {
            const { object, property } = path.node;

            // Match only the exact pattern `import.meta.<identifier>`
            if (
              object.type !== "MetaProperty" ||
              object.meta.name !== "import" ||
              object.property.name !== "meta" ||
              property.type !== "Identifier"
            ) {
              return;
            }

            const name = property.name;
            const value = REPLACEMENTS[name];

            // Leave unrelated properties (import.meta.env, import.meta.hot, etc.)
            // untouched; only rewrite the known shorthands.
            if (value !== undefined) {
              s.overwrite(path.node.start!, path.node.end!, value);
              touched = true;
            }
          },
        });

        // Skip generating output if nothing was actually rewritten
        if (!touched) return;

        return {
          code: s.toString(),
          map: s.generateMap({ hires: true, source: id }),
        };
      },
    },
  };
});
