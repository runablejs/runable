import { defineModule } from "@syora/core";
import { ContentConfig } from "./core";

export default defineModule<ContentConfig>({
  modules: ["./playground/module"],

  components: { dirs: "app/components", pathPrefix: false },

  configKey: "content",
});
