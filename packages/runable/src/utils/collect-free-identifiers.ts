import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";
import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";

const traverse: typeof _traverse = (_traverse as any).default ?? _traverse;

const TYPE_ONLY_ANCESTORS = new Set([
  "TSTypeAnnotation",
  "TSTypeParameterDeclaration",
  "TSTypeParameterInstantiation",
  "TSTypeAliasDeclaration",
  "TSInterfaceDeclaration",
  "TSInterfaceBody",
  "TSTypeReference",
  "TSTypeQuery", // `typeof x` — value reference in spirit, but not a value *usage*
  "TSTypeLiteral",
  "TSImportType",
  "TSAsExpression", // only its `typeAnnotation` child, not `expression` — see below
  "TSSatisfiesExpression",
]);

/**
 * True if `path` sits inside a pure type position (never emitted at
 * runtime). We only need to check this for the "expression"-bearing TS
 * nodes (`as`/`satisfies`) since findParent walks the *actual* AST parent
 * chain — an identifier inside `expression` never has the sibling
 * `typeAnnotation` node as an ancestor, so no special-casing is needed
 * beyond listing the container types.
 */
function isTypeOnlyPosition(path: NodePath<t.Identifier>): boolean {
  return !!path.findParent((p) => TYPE_ONLY_ANCESTORS.has(p.node.type));
}

/**
 * Parses a JS/TS/JSX source and returns the subset of `candidates` used
 * as free value references — i.e. read but never bound locally (import,
 * declaration, param, destructuring, function/class name) anywhere in
 * the file, and not a property key or `.prop` access. Relies on Babel's
 * own reference/scope analysis (`isReferencedIdentifier` + `hasBinding`)
 * rather than a hand-rolled scope tracker.
 */
export function collectFreeIdentifiers(
  code: string,
  fileName: string,
  candidates: Set<string>,
): Set<string> {
  if (candidates.size === 0) return new Set();

  const ast = parse(code, {
    sourceType: "module",
    sourceFilename: fileName,
    plugins: [
      "typescript",
      "jsx",
      "decorators-legacy",
      "importAttributes" as any,
      "topLevelAwait" as any,
    ],
  });

  const used = new Set<string>();

  traverse(ast, {
    Identifier(path: NodePath<t.Identifier>) {
      const name = path.node.name;
      if (!candidates.has(name)) return;
      if (!path.isReferencedIdentifier()) return;
      if (isTypeOnlyPosition(path)) return;
      if (path.scope.hasBinding(name)) return; // bound somewhere in the chain
      used.add(name);
    },
    // `<Ref />` component usage — separate node type from Identifier in JSX.
    JSXIdentifier(path: NodePath<t.JSXIdentifier>) {
      const name = path.node.name;
      if (!candidates.has(name)) return;
      const parent = path.parent;
      const isTag =
        (parent.type === "JSXOpeningElement" ||
          parent.type === "JSXClosingElement") &&
        parent.name === path.node;
      if (!isTag) return;
      if (path.scope.hasBinding(name)) return;
      used.add(name);
    },
  });

  return used;
}
