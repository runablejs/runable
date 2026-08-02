import { parse as babelParse, type ParserPlugin } from "@babel/parser";
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

interface ScriptBlock {
  content: string;
  lang: string; // "ts" | "js" | ...
  setup: boolean;
}

/**
 * Extrait le/les bloc(s) <script> d'un fichier .vue (SFC).
 * Un SFC peut avoir jusqu'à deux balises <script> :
 * un <script> "classique" et/ou un <script setup>.
 */
function extractScriptBlocks(code: string): ScriptBlock[] {
  const blocks: ScriptBlock[] = [];
  const scriptTagRe = /<script([^>]*)>([\s\S]*?)<\/script>/gi;

  let match: RegExpExecArray | null;
  while ((match = scriptTagRe.exec(code)) !== null) {
    const attrs = match[1] ?? "";
    const content = match[2] ?? "";

    const langMatch = attrs.match(/lang\s*=\s*["']([^"']+)["']/i);
    const lang = langMatch ? langMatch[1]!.toLowerCase() : "js";
    const setup = /(^|\s)setup(\s|=|>|$)/i.test(attrs);

    blocks.push({ content, lang, setup });
  }

  return blocks;
}

/**
 * Cherche un nom déclaré (defineComponent / defineOptions / export default
 * objet littéral) dans un fragment de code JS/TS déjà extrait.
 */
function findDeclaredNameInCode(
  code: string,
  babelPlugins: ParserPlugin[],
): string | undefined {
  if (!code.includes("name")) return undefined;

  let ast;
  try {
    ast = babelParse(code, {
      sourceType: "module",
      plugins: babelPlugins,
    });
  } catch {
    return undefined;
  }

  let found: string | undefined;

  traverse(ast, {
    CallExpression(p) {
      if (found) return;
      const callee = p.node.callee;

      const calleeName =
        callee.type === "Identifier"
          ? callee.name
          : callee.type === "MemberExpression" &&
              callee.property.type === "Identifier"
            ? callee.property.name
            : undefined;

      // defineComponent({...}) et defineOptions({...}) (Vue <script setup>)
      const isRelevantCall =
        calleeName === "defineComponent" || calleeName === "defineOptions";

      if (!isRelevantCall) return;

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

function pluginsForLang(lang: string): ParserPlugin[] {
  const plugins: ParserPlugin[] = ["jsx", "decorators-legacy"];
  if (lang === "ts" || lang === "tsx") {
    plugins.push("typescript");
  }
  return plugins;
}

/**
 * Cas des fichiers .vue : on extrait le(s) bloc(s) <script>, en
 * priorisant le <script> "classique" (celui qui contient généralement
 * defineComponent({ name: '...' })) puis, à défaut, le <script setup>
 * (defineOptions({ name: '...' })).
 */
function extractDeclaredNameFromSFC(code: string): string | undefined {
  const blocks = extractScriptBlocks(code);
  if (blocks.length === 0) return undefined;

  // On essaie d'abord les blocs non-setup, puis les blocs setup.
  const ordered = [
    ...blocks.filter((b) => !b.setup),
    ...blocks.filter((b) => b.setup),
  ];

  for (const block of ordered) {
    const name = findDeclaredNameInCode(
      block.content,
      pluginsForLang(block.lang),
    );
    if (name) return name;
  }

  return undefined;
}

/**
 * Pour tous les fichiers composants Vue (.vue, .js/.ts/.jsx/.tsx),
 * tente de récupérer le nom déclaré via `defineComponent({ name: '...' })`,
 * `defineOptions({ name: '...' })` (script setup) ou un objet littéral
 * exporté par défaut `{ name: '...' }`. Retourne undefined si rien n'est
 * trouvé (ou si le fichier est illisible/imparsable), pour que l'appelant
 * puisse se rabattre sur le nom basé sur le nom de fichier.
 */
export function extractDeclaredName(file: string): string | undefined {
  let code: string;
  try {
    code = fs.readFileSync(file, "utf-8");
  } catch {
    return undefined;
  }

  if (path.extname(file) === SFC_EXT) {
    return extractDeclaredNameFromSFC(code);
  }

  // Fast bail-out pour éviter de parser des fichiers qui ne déclarent
  // manifestement pas de nom.
  if (!code.includes("name")) return undefined;

  return findDeclaredNameInCode(code, [
    "typescript",
    "jsx",
    "decorators-legacy",
  ]);
}
