import env from "#start/env";
import app from "@adonisjs/core/services/app";
import { defineConfig } from "@adonisjs/core/app";

export default defineConfig({
  appKey: env.get("APP_KEY"),
  http: {
    generateRequestId: true,
    trustProxy: false,
    allowMethodSpoofing: false,
    useAsyncLocalStorage: false,
    cookie: {
      domain: "",
      path: "/",
      maxAge: "2h",
      httpOnly: true,
      secure: app.inProduction,
      sameSite: "lax",
    },
  },
});

