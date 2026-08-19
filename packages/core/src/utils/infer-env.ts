export type EnvValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | unknown[]
  | Record<string, unknown>;

export function inferEnvValue(value: string): EnvValue {
  const trimmed = value.trim();

  // null
  if (trimmed.toLowerCase() === "null") {
    return null;
  }

  // undefined
  if (trimmed.toLowerCase() === "undefined") {
    return undefined;
  }

  // boolean
  if (trimmed.toLowerCase() === "true") {
    return true;
  }

  if (trimmed.toLowerCase() === "false") {
    return false;
  }

  // number
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  // JSON (array/object)
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // Ignore si le JSON est invalide
    }
  }

  // string
  return value;
}

export function inferEnvType(value: unknown): string {
  if (value === undefined) return "undefined";
  if (value === null) return "null";

  if (Array.isArray(value)) {
    if (value.length === 0) return "unknown[]";

    const elementTypes = [...new Set(value.map(inferEnvType))];
    return `Array<${elementTypes.join(" | ")}>`;
  }

  if (typeof value === "object") {
    const properties = Object.entries(value);
    if (properties.length === 0) return "Record<string, unknown>";

    return `{ ${properties
      .map(([key, property]) => `${JSON.stringify(key)}: ${inferEnvType(property)};`)
      .join(" ")} }`;
  }

  if (["string", "number", "boolean"].includes(typeof value)) {
    return typeof value;
  }

  return "unknown";
}
