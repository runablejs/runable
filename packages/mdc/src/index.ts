import { resolve } from "node:path";
import { buildRemark } from "./core";

const vfile = await buildRemark({
  file: resolve(
    import.meta.dirname,
    "../playground/content/docs/get-started/index.md",
  ),
  root: resolve(import.meta.dirname, "../playground/content"),
});

const vfile2 = await buildRemark({
  file: resolve(
    import.meta.dirname,
    "../playground/content/docs/get-started/usage.md",
  ),
  root: resolve(import.meta.dirname, "../playground/content"),
});

console.log(vfile.data);
console.log(vfile2.data);
