# create-runable

## 1.0.0-alpha.2

### Patch Changes

- [#42](https://github.com/runablejs/runable/pull/42) [`8589e2c`](https://github.com/runablejs/runable/commit/8589e2c1ab0ccf785ed3df3b3b886d80ac4a70dc) Thanks [@domutala](https://github.com/domutala)! - Fix the bundled CLI resolution in the `create-runable` bin: it now resolves `@runablejs/cli` through the package's own export map instead of a hardcoded `dist/index.js` path, so it keeps working if that package's build output ever moves.
- Updated dependencies [[`8589e2c`](https://github.com/runablejs/runable/commit/8589e2c1ab0ccf785ed3df3b3b886d80ac4a70dc)]:
  - @runablejs/cli@1.0.0-alpha.5
