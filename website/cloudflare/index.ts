import { handle } from "hono/cloudflare-pages";
import app from "../server.js";

export default handle(app);
