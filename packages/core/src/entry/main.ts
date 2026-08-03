import * as vue from "vue";
import merge from "lodash/merge";

import { routerPlugin } from "../router/plugin.js";
import { pluginPlugin } from "../plugin/index.js";

import { appContextPlugin } from "../context/plugin.js";
import { createAsyncData } from "../async-data/plugin.js";

import {
  createHead as createHeadClient,
  type VueHeadClient,
} from "@unhead/vue/client";
import { createHead as createHeadServer } from "@unhead/vue/server";
import { UnheadSchemaOrg } from "@unhead/schema-org/vue";
import { layoutPlugin } from "../layout/plugin.js";

export async function createApp(isSsr = false) {
  const config = useConfig();
  const { default: App } = await import("../app/components/app.js");

  let app: vue.App<Element>;
  let head: VueHeadClient;

  const headOptions = {
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
  };

  if (isSsr) {
    app = vue.createSSRApp(App);
    head = createHeadServer(headOptions);
  } else if (config.ssr) {
    app = vue.createSSRApp(App);
    head = createHeadClient(headOptions);
  } else {
    app = vue.createApp(App);
    head = createHeadClient(headOptions);
  }

  app.use(appContextPlugin);
  app.use(routerPlugin);
  app.use(layoutPlugin);
  app.use(pluginPlugin);
  app.use(createAsyncData());
  app.use(head);

  return { app, head };
}
