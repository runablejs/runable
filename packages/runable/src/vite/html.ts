import { normalizeDir } from "../utils/index.js";
import { relative } from "node:path";

const template = (entry: string) => `
<!doctype html>
<html>
  <head>
    <!--app-head-->
  </head>
  
  <body>
    <div id="app"><!--app-html--></div>

    <script type="module" src="${entry}"></script>
  </body>
</html>
`;

export function getIndexHtml(entry: string) {
  return template(entry);
}
