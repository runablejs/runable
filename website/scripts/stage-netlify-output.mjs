import { cpSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const source = resolve("website/.output");
const target = resolve(".output");

rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });
