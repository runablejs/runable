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

export function inferEnvType(value: any): string {
  const trimmed = JSON.stringify(value).trim();

  // null
  if (trimmed.toLowerCase() === "null") return "null";

  // undefined
  if (trimmed.toLowerCase() === "undefined") return "undefined";

  // boolean
  if (["true", "false"].includes(trimmed.toLowerCase())) return "boolean";

  // number
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return "number";

  // JSON (array/object)
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return "any";
    }
  }

  // string
  return "string";
}
