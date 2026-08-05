import { join } from "node:path";

import { getModuleOptions, useConfig } from "@syora/core";

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

  const syoraConfig = useConfig();

  config.output ??= syoraConfig.cwd;
  config.root ??= join(syoraConfig.cwd, "content");

  const { collections } = await resolveContentConfig(config, {
    root: config.root,
    syoraConfig,
  });

  return collections;
}
