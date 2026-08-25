import { cpSync, realpathSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const source = resolve("website/.output");
const target = resolve(".output");

rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });

// Generated SSR chunks resolve bare imports from `.output/server`. Netlify
// installs function dependencies under `website/node_modules`, so stage the
// native content database beside those chunks as well.
const sqliteSource = realpathSync(resolve("website/node_modules/better-sqlite3"));
const sqliteTarget = resolve(target, "server/node_modules/better-sqlite3");
cpSync(sqliteSource, sqliteTarget, { recursive: true });
