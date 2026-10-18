import type { Arrayable } from "@/types/reset.js";

export function toArray<T>(value: Arrayable<T>): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}
