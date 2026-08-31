import { handle } from "hono/netlify";
// The SSR content database imports this native package from a generated chunk.
// Keep the static reference so Netlify includes it in the function artifact.
import "better-sqlite3";
import app from "../../server.js";

export default handle(app);
