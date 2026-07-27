declare module ":router" {
  import type { Router, RouteRecordRaw } from "vue-router";
  export const router: readonly Router;
  export const routes: RouteRecordRaw[];
}

declare module ":globals" {}

declare module ":plugins" {
  import type { Plugin } from "vue";
  import type { VuePluginObject } from "./src/plugin/helper.js";

  export const plugins: VuePluginObject[];
  export const pluginsPlugin: Plugin;
}

declare module ":app-vue" {
  import type { Component } from "vue";
  import type { DefineComponent } from "vue";

  const component: DefineComponent<{}, {}, any>;
  export const app: Component | false;
}

declare module ":layouts" {
  import type { Component } from "vue";
  export const layouts: Record<string, () => Promise<Component>>;
}

declare module ":config" {
  import type { ClientConfig } from "../src/config";

  const config: ClientConfig;
  export default config;
}

declare module ":css";

declare module ":runtime" {
  import type { RuntimeValues } from "../src/runtime/types";
  export const values: RuntimeValues;
}
