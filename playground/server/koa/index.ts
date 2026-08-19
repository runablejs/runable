import { koa } from "@syora/core/adapters/koa";
import Koa from "koa";

const app = new Koa();
app.use(koa());

app.listen(5173);
