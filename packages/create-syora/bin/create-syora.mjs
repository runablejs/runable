#!/usr/bin/env node
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import process from "node:process";

const require = createRequire(import.meta.url);

let cliPath;
try {
  cliPath = require.resolve("@syora/cli/dist/index.js");
} catch {
  console.error("Cannot find @syora/cli");
  process.exit(1);
}

// On injecte "create" comme premier argument
const args = ["create", ...process.argv.slice(2)];

try {
  execFileSync(process.execPath, [cliPath, ...args], {
    stdio: "inherit",
    cwd: process.cwd(),
    windowsHide: true,
  });
} catch (err) {
  process.exit(err.status || 1);
}
