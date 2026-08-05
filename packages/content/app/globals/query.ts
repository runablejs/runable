import type { Collections } from "#app/content/collections.js";

import {
  type CollectionQuery,
  CollectionQueryImpl,
} from "../../core/collection/query.js";

export function queryCollection<
  K extends keyof Collections & string,
  TCollection extends Collections[K],
>(name: K): CollectionQuery<TCollection> {
  return new CollectionQueryImpl<TCollection>(name) as any;
}
