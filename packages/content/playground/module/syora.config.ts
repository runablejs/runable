import { defineModule } from "@syora/core";
import { ContentConfig } from "../../core";

export default defineModule<ContentConfig>({
  // appDir: "playground/app",

  meta: {
    name: "content",
  },

  configKey: "content",
});
