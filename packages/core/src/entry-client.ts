import { entry } from "./entry/entry";
import type { App } from "vue";

const app = (await entry(false)) as App;
app.mount("#app", true);
