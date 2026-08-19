import { express } from "@syora/core/adapters/express";
import Express from "express";

const app = Express();
app.use(express());

app.listen(5173);
