import { join } from "node:path";

import { getModuleOptions, useConfig } from "@syora/core";
import Database from "better-sqlite3";

import {
  CollectionDefinition,
  ContentConfig,
  resolveContentConfig,
} from "./collection/index.js";
import {
  resolveContent,
  type ContentRequestParams,
} from "./content-request.js";
import { getCollection, saveCollections } from "./store/index.js";

export async function initContent<
  TCollections extends Record<string, CollectionDefinition<any>>,
>(config?: ContentConfig<TCollections>) {
  config ??= getModuleOptions<ContentConfig<TCollections>>("content");
  config.collections ??= {} as TCollections;

  const { cwd } = useConfig();

  config.output ??= cwd;
  config.root ??= join(cwd, "content");

  const collections = await resolveContentConfig(config, {
    root: config.root,
  });

  const db = new Database(join(config.output, ".content.sqlite"));
  saveCollections(db, collections);

  function collection<K extends keyof TCollections & string>(name: K) {
    return getCollection(db, config!, name);
  }

  return {
    db,
    config,
    collections,
    collection,

    resolveContent: (params: ContentRequestParams) => {
      return resolveContent(collections as any, collection, params);
    },
  };
}
