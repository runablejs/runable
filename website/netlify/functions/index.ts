import { handle } from "hono/netlify";
import app from "../../server.js";

export default handle(app);
