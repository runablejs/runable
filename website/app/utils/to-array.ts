export type Arrayable<T> = T | Array<T>;

export function toArray<T>(value: Arrayable<T>): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}
