---
"runable": patch
---

Fix `loadRuntimeEnv()` (used internally when resolving runtime config, e.g. by `runable/inspector`'s `getConfig()`) unconditionally writing an "injected env (...) from .env" notice to stdout via `dotenv` whenever a project's `.env` file defines any `RUN_`/`VITE_`-prefixed variable. This is now passed `quiet: true`, so loading runtime env stays silent on stdout — important for any host process that reserves stdout for something else, such as an MCP server speaking JSON-RPC over stdio.
