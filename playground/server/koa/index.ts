import { koa } from "@syora/core";
import Koa from "koa";

const app = new Koa();
app.use(koa());

app.listen(5173);
