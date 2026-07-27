import { parse as babelParse } from "@babel/parser";
import traverse from "@babel/traverse";
import fs from "node:fs";
import path from "node:path";
import type { ObjectExpression } from "@babel/types";

const SFC_EXT = ".vue";

function readNameFromObject(obj: ObjectExpression): string | undefined {
  for (const prop of obj.properties) {
    if (
      prop.type === "ObjectProperty" &&
      !prop.computed &&
      ((prop.key.type === "Identifier" && prop.key.name === "name") ||
        (prop.key.type === "StringLiteral" && prop.key.value === "name")) &&
      prop.value.type === "StringLiteral"
    ) {
      return prop.value.value;
    }
  }
  return undefined;
}

/**
 * For non-SFC files (.js/.ts/.jsx/.tsx), try to recover the component's
 * declared name from `defineComponent({ name: '...' })` or a default
 * exported object literal `{ name: '...' }`. Returns undefined if none
 * is found (or the file can't be parsed), so the caller can fall back
 * to the filename-based name.
 */
export function extractDeclaredName(file: string): string | undefined {
  if (path.extname(file) === SFC_EXT) return undefined;

  let code: string;
  try {
    code = fs.readFileSync(file, "utf-8");
  } catch {
    return undefined;
  }

  // Fast bail-out to avoid parsing files that obviously don't declare a name.
  if (!code.includes("name")) return undefined;

  let ast;
  try {
    ast = babelParse(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx", "decorators-legacy"],
    });
  } catch {
    return undefined;
  }

  let found: string | undefined;

  traverse(ast, {
    CallExpression(p) {
      if (found) return;
      const callee = p.node.callee;
      const isDefineComponent =
        (callee.type === "Identifier" && callee.name === "defineComponent") ||
        (callee.type === "MemberExpression" &&
          callee.property.type === "Identifier" &&
          callee.property.name === "defineComponent");

      if (!isDefineComponent) return;

      const arg = p.node.arguments[0];
      if (arg?.type === "ObjectExpression") {
        found = readNameFromObject(arg);
      }
    },
    ExportDefaultDeclaration(p) {
      if (found) return;
      const decl = p.node.declaration;
      if (decl.type === "ObjectExpression") {
        found = readNameFromObject(decl);
      }
    },
  });

  return found;
}
