/**
 * Defensively strips anything that can't survive `JSON.stringify()`
 * (functions, `undefined`, circular references) from a value that
 * ultimately comes from user config (e.g. `head`, which `@unhead/vue`
 * types as "resolvable" — some of its fields may be functions the user
 * never expects to reach a public, serialized boundary).
 *
 * Not a general-purpose deep-clone: it only needs to guarantee the
 * Inspector's own output contract (every returned value is JSON-safe), not
 * preserve every nuance of the input.
 */
export function toSerializable<T>(value: T): T {
  if (value === undefined) return value;

  try {
    return JSON.parse(JSON.stringify(value)) as T;
  } catch {
    return undefined as T;
  }
}
