import toCamelCase from "lodash/camelCase.js";
import toUpperFirst from "lodash/upperFirst.js";

/** Native Vue global components, never resolved/auto-imported. */
export const BUILTIN_COMPONENTS = new Set([
  "Transition",
  "TransitionGroup",
  "KeepAlive",
  "Teleport",
  "Suspense",
  "component",
  "slot",
  "template",
]);

/**
 * Converts a file path segment (e.g. "my-button.vue" or
 * "form/text-input.vue") into a default PascalCase component name.
 * Directory separators are treated as word boundaries, so
 * "form/text-input.vue" -> "FormTextInput".
 */
export function toPascalCase(input: string): string {
  return toUpperFirst(toCamelCase(input.replace(/\.\w+$/, "")));
  // input
  //   .replace(/\.\w+$/, "")
  //   .split(/[-_/\\ ]+/)
  //   .filter(Boolean)
  //   .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
  //   .join("");
}

/** Converts a kebab-case tag ("text-input") into PascalCase ("TextInput"). */
export function kebabToPascal(tag: string): string {
  return tag
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
}

export function isBuiltIn(name: string): boolean {
  return BUILTIN_COMPONENTS.has(name);
}

export function toArray<T>(value: T | T[] | undefined, fallback: T[]): T[] {
  if (value === undefined) return fallback;
  return Array.isArray(value) ? value : [value];
}
