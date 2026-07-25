import fs from "node:fs";
import path from "node:path";
import { findStaticImports, parseStaticImport } from "mlly";
import { walk as simpleWalk, type Node } from "estree-walker";
import MagicString from "magic-string";
import { parse } from "@babel/parser";
import _ from "lodash";
import type { Identifier } from "estree";
import { normalizeDir } from "./dir.js";

// Type d'extension étendu pour inclure start/end d'acorn
type AcornNode = Node & { start: number; end: number };

export type ExportKind =
  | "type"
  | "interface"
  | "const"
  | "init"
  | "get"
  | "set"
  | "constructor"
  | "method"
  | "var"
  | "let"
  | "function"
  | "class"
  | "using"
  | "await using"
  | "unknown";

export interface ExportMetadata {
  // type: ExportType;
  isDefault: boolean;
  name: string;
  kind: ExportKind;
  file: string;
}

export function getExports(file: string, { target }: { target?: string } = {}) {
  const code = fs.readFileSync(file, "utf8");
  const ms = new MagicString(code);
  const fileDir = path.dirname(file);

  // 1. Cartographier les imports statiques
  const imports = findStaticImports(code);
  const importMap = new Map<string, string>();

  for (const i of imports) {
    const parsed = parseStaticImport(i);
    let importSpecifier = parsed.specifier;

    // Resolve relative imports starting with "."
    if (importSpecifier.startsWith(".")) {
      // 1. Get absolute path of the dependency
      const absoluteDependencyPath = path.resolve(fileDir, importSpecifier);

      if (target) {
        // 2. Compute the new relative path from the target directory to the dependency
        importSpecifier = normalizeDir(
          path.relative(target, absoluteDependencyPath),
        );
      } else {
        importSpecifier = absoluteDependencyPath;
      }
    }

    parsed.code = parsed.code.replace(parsed.specifier, importSpecifier);

    const names = [
      parsed.defaultImport,
      ...Object.values(parsed.namedImports || {}),
      parsed.namespacedImport,
    ].filter(Boolean) as string[];

    for (const name of names) {
      importMap.set(name, parsed.code.trim());
    }
  }

  // 2. Parser l'AST avec Acorn
  const ast = parse(code, {
    sourceType: "module",
    plugins: [
      "typescript", // Permet de lire le TypeScript
      "estree", // REQUIS : force Babel à générer un AST compatible avec estree-walker
    ],
  });

  // 3. Répertorier les déclarations globales (fonctions, variables)
  const topLevelDeclarations = new Map<string, AcornNode>();
  // Stocker les nœuds d'export pour les traiter en premier
  const exportNodes: AcornNode[] = [];
  const exportMetadataMap: Record<string, ExportMetadata> = {};

  for (const node of ast.program.body as AcornNode[]) {
    const isExport =
      node.type === "ExportNamedDeclaration" ||
      node.type === "ExportDefaultDeclaration" ||
      node.type === "ExportAllDeclaration";

    // Si c'est un export, on le garde de côté pour l'analyser
    if (isExport) {
      const isDefault = node.type === "ExportDefaultDeclaration";

      // Si l'export contient une déclaration directe (ex: export const a = 1)
      if ("declaration" in node && node.declaration) {
        exportNodes.push(node);

        const decl = node.declaration as AcornNode;

        const kind: ExportKind = isDefault
          ? "const"
          : decl.type === "FunctionDeclaration"
            ? "function"
            : "kind" in decl
              ? decl.kind
              : "type";

        if (decl.type === "VariableDeclaration") {
          for (const d of decl.declarations) {
            if (d.id.type === "Identifier") {
              topLevelDeclarations.set(d.id.name, node);

              exportMetadataMap[d.id.name] = {
                name: d.id.name,
                kind,
                isDefault,
                file,
              };
            }
          }
        } else if (
          // (decl.type === "FunctionDeclaration" ||
          //   decl.type === "ClassDeclaration") &&
          // decl.id

          "id" in decl &&
          decl.id?.type === "Identifier"
        ) {
          topLevelDeclarations.set(decl.id.name, node);
          exportMetadataMap[decl.id.name] = {
            name: decl.id.name,
            kind,
            isDefault,
            file,
          };
        } else if (isDefault) {
          const name = _.camelCase(path.parse(file).name);

          exportMetadataMap[name] = {
            name: name,
            kind,
            isDefault,
            file,
          };
        }
      } else if ("specifiers" in node && node.specifiers) {
        for (const spec of node.specifiers) {
          const exportedName = (spec.exported as Identifier).name;
          // Par défaut on met "unknown", on l'affinera au second passage grâce à topLevelDeclarations
          exportMetadataMap[exportedName] = {
            name: exportedName,
            kind: "unknown",
            isDefault: exportedName === "default",
            file,
          };
        }
      }

      continue;
    }

    // Déclarations top-level classiques (non exportées directement sur la même ligne)
    if (node.type === "VariableDeclaration") {
      for (const decl of node.declarations) {
        if (decl.id.type === "Identifier") {
          topLevelDeclarations.set(decl.id.name, node);
        }
      }
    } else if (
      // (node.type === "FunctionDeclaration" ||
      //   node.type === "ClassDeclaration") &&
      // node.id
      (node.type === "FunctionDeclaration" ||
        node.type === "ClassDeclaration") &&
      node.id?.type === "Identifier"
    ) {
      topLevelDeclarations.set(node.id.name, node);
    }
  }

  for (const [exportedName, meta] of Object.entries(exportMetadataMap)) {
    if (meta.kind === "unknown") {
      const originNode = topLevelDeclarations.get(exportedName);
      if (originNode) {
        // Si c'est un export indirect, le nœud d'origine est une déclaration standard
        if (originNode.type === "VariableDeclaration") {
          meta.kind = originNode.kind;
        }
      }
    }
  }

  // Trackers pour éviter les doublons ou boucles infinies
  const addedImports = new Set<string>();
  const addedDeclarations = new Set<string>();
  const retainedRanges: Array<{ start: number; end: number }> = [];

  function addImport(name: string) {
    const importCode = importMap.get(name);
    if (importCode && !addedImports.has(importCode)) {
      addedImports.add(importCode);
    }
  }

  function processDeclaration(node: AcornNode) {
    const codeSectionKey = `${node.start}-${node.end}`;
    if (addedDeclarations.has(codeSectionKey)) return;

    addedDeclarations.add(codeSectionKey);
    retainedRanges.push({ start: node.start, end: node.end });

    // Recherche des dépendances à l'intérieur de ce bloc de code
    simpleWalk(node, {
      enter(innerNode, parent) {
        if (innerNode.type !== "Identifier") return;
        if (
          parent?.type === "MemberExpression" &&
          parent.property === innerNode &&
          !parent.computed
        )
          return;
        if (
          parent?.type === "Property" &&
          parent.key === innerNode &&
          !parent.computed
        )
          return;
        if (parent?.type === "VariableDeclarator" && parent.id === innerNode)
          return;

        const name = innerNode.name;

        if (importMap.has(name)) {
          addImport(name);
        } else if (topLevelDeclarations.has(name)) {
          processDeclaration(topLevelDeclarations.get(name)!);
        }
      },
    });
  }

  // 4. Lancer l'analyse en partant uniquement de ce qui est exporté
  for (const exportNode of exportNodes) {
    processDeclaration(exportNode);
  }

  // 5. Reconstruire le code final
  // On trie les intervalles retenus pour ne pas corrompre MagicString
  retainedRanges.sort((a, b) => a.start - b.start);

  const finalCode: string[] = [];

  // Ajouter les imports requis au début
  if (addedImports.size > 0) {
    finalCode.push(...Array.from(addedImports));
  }

  // Extraire les sections de code retenues (déclarations + exports) via MagicString
  for (const range of retainedRanges) {
    finalCode.push(ms.slice(range.start, range.end));
  }

  return {
    code: finalCode.join("\n"),
    exports: exportMetadataMap,
  };
}

export function generateGlobalTypesFromExports(
  exports: Record<string, ExportMetadata>,
  {
    onlyLine = false,
    indent = 2,
    targetPath,
  }: { onlyLine?: boolean; indent?: number; targetPath?: string } = {},
) {
  // console.log(exports);

  const lines = Object.entries(exports).map(([name, value]) => {
    const gap = "".padStart(indent, " ");

    // 1. Déterminer le chemin propre de l'import (sans l'extension .ts/.tsx si nécessaire)
    let importPath = value.file;

    if (targetPath) importPath = path.relative(targetPath, importPath);

    importPath = normalizeDir(importPath);

    // 2. Gérer le cas de l'export default
    if (value.isDefault) {
      // Si c'est une classe ou une interface, on utilise directement "InstanceType" ou le type lui-même
      // Mais via typeof import, le plus sûr pour une globale est de récupérer la propriété .default
      return `${gap}const ${name}: (typeof import("${importPath}"))["default"];`;
    }

    // 3. Gérer les types et interfaces TypeScript
    // Un type ne peut pas être référencé avec "typeof", il existe déjà dans l'espace des types d'un import()
    if (value.kind === "type" || value.kind === "interface") {
      return `${gap}type ${name} = import("${importPath}").${name};`;
    }

    // 4. Gérer les variables, fonctions et classes standard
    return `${gap}const ${name}: (typeof import("${importPath}"))["${name}"];`;
  });

  const content = lines.join("\n");
  if (onlyLine) return content;

  return `declare global {\n${content}\n}\n\nexport {};`;
}
