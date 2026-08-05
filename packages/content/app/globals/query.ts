import type { CollectionDefinition } from "./../../core/collection/collection.js";
import {
  type CollectionQuery,
  CollectionQueryImpl,
} from "../../core/collection/query.js";

export function queryCollection<
  TCollections extends Record<string, CollectionDefinition<any>>,
  K extends keyof TCollections & string,
>(
  name: K,
): TCollections[K] extends CollectionDefinition<infer T>
  ? CollectionQuery<T>
  : never {
  return new CollectionQueryImpl<any>(name) as any;
}
