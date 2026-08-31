import serverless from "serverless-http";

// The SSR content database imports this native package from a generated chunk.
// Keep the static reference so Netlify includes it in the function artifact.
// import "better-sqlite3";
import app from "../../express.js";

export const handler = serverless(app);
