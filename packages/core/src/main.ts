import * as vue from "vue";
import merge from "lodash/merge";

import { router } from ":router";
import { registerPlugins } from "./plugin/index.js";

import App from "./app-vue/app.vue";
import { appContextPlugin } from "./vue/plugin.js";
import { createAsyncData } from "./async-data/plugin.js";

import { createHead as createHeadClient } from "@unhead/vue/client";
import { createHead as createHeadServer } from "@unhead/vue/server";
import { UnheadSchemaOrg } from "@unhead/schema-org/vue";

export function createApp(server = false) {
  const config = useConfig();
  const app = vue.createSSRApp(App);

  app.use(appContextPlugin);

  registerPlugins(app);

  const asyncData = createAsyncData();
  app.use(asyncData);

  app.use(router);

  const createHead = server ? createHeadServer : createHeadClient;

  const head = createHead({
    init: [
      merge(
        {
          title: "Syora",
          meta: [
            { charset: "utf-8" },

            {
              name: "viewport",
              content: "width=device-width, initial-scale=1.0",
            },
          ],
        },
        config.head,
      ),
    ],

    plugins: [UnheadSchemaOrg({ host: config.siteUrl }) as any],
  });

  return { app, head, router };
}
