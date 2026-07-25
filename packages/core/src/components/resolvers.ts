import type {
  ComponentInfo,
  ComponentResolveResult,
  ComponentResolver,
  ComponentResolverObject,
} from './types'

function normalizeResolver(resolver: ComponentResolver): ComponentResolverObject {
  return typeof resolver === 'function' ? { resolve: resolver } : resolver
}

/**
 * Flattens `(ComponentResolver | ComponentResolver[])[]` into a plain list
 * of resolver objects, dropping any 'directive' resolvers since this
 * plugin only auto-imports components.
 */
export function flattenResolvers(
  resolvers: (ComponentResolver | ComponentResolver[])[] = [],
): ComponentResolverObject[] {
  const flat: ComponentResolver[] = []
  for (const entry of resolvers) {
    if (Array.isArray(entry))
      flat.push(...entry)
    else
      flat.push(entry)
  }
  return flat.map(normalizeResolver).filter(r => r.type !== 'directive')
}

function normalizeResult(name: string, result: ComponentResolveResult): ComponentInfo | null {
  if (!result)
    return null
  // A resolver returning a plain string is shorthand for a default-export
  // import from that module, e.g. 'my-ui-lib/Button' -> `import Name from 'my-ui-lib/Button'`.
  if (typeof result === 'string')
    return { name: 'default', from: result }
  return result
}

export type ResolveFn = (name: string) => Promise<ComponentInfo | null>

/**
 * Builds a `resolve(name)` function that tries each configured resolver in
 * order and returns the first match. Results (including misses) are
 * cached per component name, since resolvers may be async / perform I/O
 * and the same tag can appear across many files.
 */
export function createResolverEngine(resolvers: (ComponentResolver | ComponentResolver[])[] = []): ResolveFn {
  const list = flattenResolvers(resolvers)
  const cache = new Map<string, ComponentInfo | null>()

  return async function resolve(name: string): Promise<ComponentInfo | null> {
    if (cache.has(name))
      return cache.get(name)!

    for (const resolver of list) {
      const raw = await resolver.resolve(name)
      const info = normalizeResult(name, raw)
      if (info) {
        cache.set(name, info)
        return info
      }
    }

    cache.set(name, null)
    return null
  }
}
