import { join } from "node:path";

import { atomicWriteFile, getModuleOptions, useConfig } from "@syora/core";

import {
  CollectionDefinition,
  ContentConfig,
  resolveContentConfig,
} from "./collection/index.js";

export async function initContent<
  TCollections extends Record<string, CollectionDefinition<any>>,
>(config?: ContentConfig<TCollections>) {
  config ??= getModuleOptions<ContentConfig<TCollections>>("content");
  config.collections ??= {} as TCollections;

  const { cwd, output } = useConfig();

  config.output ??= cwd;
  config.root ??= join(cwd, "content");

  const { collections, compressed } = await resolveContentConfig(config, {
    root: config.root,
  });

  atomicWriteFile(join(output, "content", "compressed.ts"), compressed);

  return collections;
}

// export async function initContent0<
//   TCollections extends Record<string, CollectionDefinition<any>>,
// >(config?: ContentConfig<TCollections>) {
//   config ??= getModuleOptions<ContentConfig<TCollections>>("content");
//   config.collections ??= {} as TCollections;

//   const { cwd, output } = useConfig();

//   config.output ??= cwd;
//   config.root ??= join(cwd, "content");

//   const { collections, compressed } = await resolveContentConfig(config, {
//     root: config.root,
//   });

//   atomicWriteFile(join(output, "content", "compressed.mjs"), compressed);

//   const db: SqliteDatabase = new Database(
//     join(config.output, ".content.sqlite"),
//   );

//   saveCollections(db, collections);

//   function collection<K extends keyof TCollections & string>(name: K) {
//     return getCollection(db, config!, name);
//   }

//   function getCollectionBase64<K extends keyof TCollections & string>(name: K) {
//     const json = JSON.stringify(collections.docs);
//     const base64 = Buffer.from(json, "utf-8").toString("base64");

//     return base64;
//   }

//   return {
//     db,
//     config,
//     collections,
//     collection,

//     resolveContent: (params: ContentRequestParams) => {
//       return resolveContent(collections as any, collection, params);
//     },
//   };
// }
