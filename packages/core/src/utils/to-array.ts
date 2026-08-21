import type { Arrayable } from "./types.js";

export function toArray<T>(value: Arrayable<T>): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}
// T | T[] | undefined | null
