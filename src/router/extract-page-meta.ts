import { readFileSync } from "node:fs";
// import { parse as parseSFC } from "@vue/compiler-sfc";
import { Parser } from "acorn";
import { parse as parseSFC } from "vue/compiler-sfc";

export function extractPageMeta(
  filePath: string,
): Record<string, unknown> | undefined {
  if (!filePath.endsWith(".vue")) return undefined;

  const source = readFileSync(filePath, "utf-8");
  const { descriptor } = parseSFC(source, { filename: filePath });
  const script = descriptor.scriptSetup ?? descriptor.script;
  if (!script) return undefined;

  let ast: any;
  try {
    ast = Parser.parse(script.content, {
      ecmaVersion: "latest",
      sourceType: "module",
    });
  } catch {
    return undefined;
  }

  const callNode = findDefinePageMetaCall(ast);
  if (!callNode) return undefined;

  return astToValue(callNode.arguments[0]) as Record<string, unknown>;
}

function findDefinePageMetaCall(node: any): any {
  if (!node || typeof node !== "object") return undefined;
  if (node.type === "CallExpression" && node.callee?.name === "definePageMeta")
    return node;

  for (const key in node) {
    if (key === "type" || key === "loc" || key === "start" || key === "end")
      continue;
    const child = node[key];

    if (Array.isArray(child)) {
      for (const c of child) {
        const found = findDefinePageMetaCall(c);
        if (found) return found;
      }
    } else if (child && typeof child.type === "string") {
      const found = findDefinePageMetaCall(child);
      if (found) return found;
    }
  }
}

function astToValue(node: any): unknown {
  switch (node.type) {
    case "ObjectExpression": {
      const obj: Record<string, unknown> = {};
      for (const prop of node.properties) {
        obj[prop.key.name ?? prop.key.value] = astToValue(prop.value);
      }
      return obj;
    }
    case "ArrayExpression":
      return node.elements.map(astToValue);
    case "Literal":
      return node.value;
    case "TemplateLiteral":
      if (node.expressions.length === 0) {
        return node.quasis.map((q: any) => q.value.cooked).join("");
      }
      throw new Error("definePageMeta: template literal non statique");
    case "UnaryExpression":
      if (node.operator === "-") return -(astToValue(node.argument) as number);
      if (node.operator === "!") return !astToValue(node.argument);
      throw new Error(
        `definePageMeta: opérateur "${node.operator}" non supporté`,
      );
    case "Identifier":
      if (node.name === "undefined") return undefined;
      throw new Error(
        `definePageMeta: identifiant non statique "${node.name}"`,
      );
    default:
      throw new Error(`definePageMeta: expression non statique "${node.type}"`);
  }
}
