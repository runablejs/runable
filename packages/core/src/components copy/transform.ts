import { parse as parseSFC } from "vue/compiler-sfc";
import { baseParse, NodeTypes } from "@vue/compiler-core";
import MagicString from "magic-string";
import path from "node:path";
import type { ComponentInfo } from "./types";
import { findComponentInfo, isBuiltIn, kebabToPascal } from "./utils";
import { HTML_TAGS } from "./html-tags";
import type { ResolveFn } from "./resolvers";

interface RegisterEntry {
  /** Local identifier used in the template (after renaming). */
  localName: string;
  info: ComponentInfo;
}

export interface TransformResult {
  code: string;
  map: ReturnType<MagicString["generateMap"]>;
}

/** Collects the set of tag names present in the template. */
function collectUsedTags(templateContent: string): Set<string> {
  const tags = new Set<string>();

  let ast;
  try {
    ast = baseParse(templateContent, { comments: true });
  } catch {
    // Unparsable template: let Vue's own compiler raise the real error later.
    return tags;
  }

  const walk = (node: any): void => {
    if (!node) return;
    if (node.type === NodeTypes.ELEMENT) tags.add(node.tag);

    if (Array.isArray(node.children)) {
      for (const child of node.children) walk(child);
    }
    // v-if/v-else-if/v-else chains are represented as branches.
    if (Array.isArray(node.branches)) {
      for (const branch of node.branches) walk(branch);
    }
  };

  for (const child of ast.children) walk(child);

  return tags;
}

/** Checks whether an identifier is already imported/declared in the script. */
function alreadyBound(scriptContent: string, name: string): boolean {
  if (!scriptContent) return false;

  const defaultImportRe = new RegExp(`import\\s+${name}\\b`);
  const namedImportRe = new RegExp(
    `import\\s*\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from`,
  );
  const localDeclRe = new RegExp(
    `\\b(?:const|let|var|function|class)\\s+${name}\\b`,
  );

  return (
    defaultImportRe.test(scriptContent) ||
    namedImportRe.test(scriptContent) ||
    localDeclRe.test(scriptContent)
  );
}

/** True for components resolved from an absolute file path (local scan). */
function isFilePath(from: string): boolean {
  return path.isAbsolute(from);
}

function toImportSpecifier(from: string, fromFile: string): string {
  if (!isFilePath(from)) return from;

  let rel = path.relative(path.dirname(fromFile), from).replace(/\\/g, "/");
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel;
}

function buildImportStatement(
  localName: string,
  info: ComponentInfo,
  fromFile: string,
): string {
  const specifier = JSON.stringify(toImportSpecifier(info.from, fromFile));

  if (info.name === "default") return `import ${localName} from ${specifier}`;

  return info.name === localName
    ? `import { ${info.name} } from ${specifier}`
    : `import { ${info.name} as ${localName} } from ${specifier}`;
}

function buildSideEffectImports(entries: RegisterEntry[]): string[] {
  const effects = new Set<string>();
  for (const { info } of entries) {
    if (!info.sideEffects) continue;
    const list = Array.isArray(info.sideEffects)
      ? info.sideEffects
      : [info.sideEffects];
    for (const effect of list) effects.add(effect);
  }
  return [...effects].map((effect) => `import ${JSON.stringify(effect)}`);
}

/** Matches `_resolveComponent("Name")` / `_resolveComponent('Name')` calls in already-compiled render code. */
const RESOLVE_COMPONENT_RE =
  /_resolveComponent\(\s*(['"])((?:(?!\1).)+)\1\s*\)/g;

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Transforms a .vue file: detects components used in the template that are
 * not already imported (resolving them first against locally scanned
 * components, then against the configured `resolvers`), and injects the
 * matching import statements. Returns `null` when no transform is needed.
 *
 * Normally this runs on the raw SFC source, before `@vitejs/plugin-vue`
 * compiles it, so `parseSFC` yields a `descriptor.template` we can scan.
 * However, depending on plugin ordering (e.g. running after
 * `@vitejs/plugin-vue` and/or `vite-plugin-vue-inspector`), this hook may
 * instead receive the file *after* it has already been compiled into a
 * plain render function. In that case there is no `<template>` block left
 * — `descriptor.template` is `null` — but the compiled code still contains
 * `_resolveComponent("Name")` calls for every component the compiler
 * couldn't statically resolve (because it was never imported). We detect
 * that case and patch the compiled output directly instead of bailing out,
 * otherwise those components would silently fail to resolve at runtime.
 */
export async function transformVueFile(
  code: string,
  id: string,
  componentsMap: Map<string, ComponentInfo>,
  resolve: ResolveFn,
): Promise<TransformResult | null> {
  const { descriptor } = parseSFC(code, { filename: id });

  if (!descriptor.template) {
    // --- Fallback path: already-compiled render function output ---
    const matches = [...code.matchAll(RESOLVE_COMPONENT_RE)];
    if (matches.length === 0) return null;

    const toRegister: RegisterEntry[] = [];
    const seenPascal = new Set<string>();
    // rawTag (as written in `_resolveComponent("rawTag")`) -> local import identifier
    const rawTagToLocalName = new Map<string, string>();

    for (const match of matches) {
      const rawTag = match[2];
      if (!rawTag) continue;
      if (rawTagToLocalName.has(rawTag)) continue;

      const pascal = rawTag.includes("-") ? kebabToPascal(rawTag) : rawTag;

      // Locally scanned components take priority over library resolvers.
      const info =
        findComponentInfo(pascal, componentsMap) ??
        (await resolve(pascal)) ??
        undefined;
      if (!info) continue;
      if (isFilePath(info.from) && path.resolve(info.from) === path.resolve(id))
        continue; // avoid a component importing itself
      if (alreadyBound(code, pascal)) continue;

      rawTagToLocalName.set(rawTag, pascal);
      if (!seenPascal.has(pascal)) {
        seenPascal.add(pascal);
        toRegister.push({ localName: pascal, info });
      }
    }

    if (toRegister.length === 0) return null;

    const s = new MagicString(code);
    const importLines = `${[
      ...toRegister.map(({ localName, info }) =>
        buildImportStatement(localName, info, id),
      ),
      ...buildSideEffectImports(toRegister),
    ].join("\n")}\n`;
    s.prepend(importLines);

    // Rewire every `_resolveComponent("Name")` call to reference the
    // newly imported identifier directly, instead of a runtime lookup
    // that would otherwise fail (or silently warn) since the component
    // was never registered as a global or local component.
    for (const [rawTag, localName] of rawTagToLocalName) {
      const re = new RegExp(
        `_resolveComponent\\(\\s*(['"])${escapeRegExp(rawTag)}\\1\\s*\\)`,
        "g",
      );
      s.replaceAll(re, localName);
    }

    return {
      code: s.toString(),
      map: s.generateMap({ hires: true, source: id }),
    };
  }

  // --- Normal path: raw, uncompiled SFC source ---
  const usedTags = collectUsedTags(descriptor.template.content);
  if (usedTags.size === 0) return null;

  const scriptContent = `${descriptor.scriptSetup?.content ?? ""}\n${descriptor.script?.content ?? ""}`;
  const toRegister: RegisterEntry[] = [];
  const seen = new Set<string>();

  for (const tag of usedTags) {
    if (isBuiltIn(tag) || HTML_TAGS.has(tag)) continue;

    const pascal = tag.includes("-") ? kebabToPascal(tag) : tag;
    if (seen.has(pascal)) continue;

    // Locally scanned components take priority over library resolvers.
    const info =
      findComponentInfo(pascal, componentsMap) ??
      (await resolve(pascal)) ??
      undefined;

    if (!info) continue;
    if (isFilePath(info.from) && path.resolve(info.from) === path.resolve(id))
      continue; // avoid a component importing itself
    if (alreadyBound(scriptContent, pascal)) continue;

    seen.add(pascal);
    toRegister.push({ localName: pascal, info });
  }

  if (toRegister.length === 0) return null;

  const s = new MagicString(code);
  const importLines = `${[
    ...toRegister.map(({ localName, info }) =>
      buildImportStatement(localName, info, id),
    ),
    ...buildSideEffectImports(toRegister),
  ].join("\n")}\n`;

  if (descriptor.scriptSetup) {
    s.appendLeft(descriptor.scriptSetup.loc.start.offset, importLines);
  } else if (descriptor.script) {
    const block = descriptor.script;
    s.appendLeft(block.loc.start.offset, importLines);

    const namesToInject = toRegister
      .map(({ localName }) => localName)
      .join(", ");
    const content = block.content;

    const componentsOptionMatch = content.match(/components\s*:\s*\{/);
    if (componentsOptionMatch?.index !== undefined) {
      const insertPos =
        block.loc.start.offset +
        componentsOptionMatch.index +
        componentsOptionMatch[0].length;
      s.appendLeft(insertPos, ` ${namesToInject},`);
    } else {
      const exportMatch = content.match(
        /export\s+default\s+(?:defineComponent\s*\(\s*)?\{/,
      );
      if (exportMatch?.index !== undefined) {
        const insertPos =
          block.loc.start.offset + exportMatch.index + exportMatch[0].length;
        s.appendLeft(insertPos, ` components: { ${namesToInject} },`);
      }
      // Neither <script setup> nor a recognizable default-export object
      // (e.g. `export default defineComponent(functionalComponent)`):
      // rare case, we still inject the import but cannot auto-register it.
    }
  } else {
    return null;
  }

  return {
    code: s.toString(),
    map: s.generateMap({ hires: true, source: id }),
  };
}
