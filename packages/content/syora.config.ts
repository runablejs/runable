import { defineModule } from "@syora/core";
import {
  ContentConfig,
  defineContentConfig,
  resolveContentConfig,
  saveCollections,
} from "./core";
import { join } from "node:path";
import Database from "better-sqlite3";

export default defineModule<ContentConfig>({
  appDir: "playground/app",

  meta: {},

  configKey: "content",

  async setup(options, config) {
    // const _config = defineContentConfig(options);
    // _config.output ??= process.cwd();
    // _config.root ??= join(process.cwd(), "content");
    // const collections = await resolveContentConfig(_config, {
    //   root: _config.root,
    // });
    // const db = new Database(join(config.output, ".content.sqlite"));
    // saveCollections(db, collections);
  },
});
