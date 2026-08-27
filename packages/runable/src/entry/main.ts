import * as vue from "vue";
import merge from "lodash-es/merge.js";

import router from "../router/plugin.js";
import components from ":components";

import { installPlugins } from "../plugin/index.js";

import { appContextPlugin } from "../context/plugin.js";
import { createAsyncData } from "../async-data/plugin.js";

import {
  createHead as createHeadClient,
  type VueHeadClient,
} from "@unhead/vue/client";
import { createHead as createHeadServer } from "@unhead/vue/server";
import { UnheadSchemaOrg } from "@unhead/schema-org/vue";
import { layoutPlugin } from "../layout/plugin.js";
import { useConfig } from "@/app/composables/config.js";
import { createErrorCapture } from "../error/plugin.js";
import { callWithAppCtx, setAppCtx } from "@/context/context.js";

export async function createApp(isSsr = false) {
  const config = useConfig();
  const { default: App } = await import("../app/components/app.js");

  let app: vue.App<Element>;
  let head: VueHeadClient;

  const headOptions = {
    init: [
      merge(
        {
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

  const install = async () => {
    app.use(appContextPlugin);
    app.use(router);
    app.use(createErrorCapture());
    app.use(layoutPlugin);
    await installPlugins(app);
    app.use(createAsyncData());
    app.use(head);
    app.use(components);

    return { app, head };
  };

  if (isSsr) return callWithAppCtx(app, install);

  setAppCtx(app);
  return install();
}
