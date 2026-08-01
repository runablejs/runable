import { defineModule } from "@/config";

interface ModuleOptions {
  dir?: string;
}

export default defineModule<ModuleOptions>({
  meta: {},

  configKey: "content",

  default: { dir: "content" },

  setup(options, config) {},

  // hooks: {
  //   "app:mounted"() {

  //     console.log("+*/*************");
  //   },
  // },
});
