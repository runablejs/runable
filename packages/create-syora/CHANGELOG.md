# create-runable

## 1.0.0-alpha.8

### Patch Changes

- Updated dependencies []:
  - @runablejs/cli@1.0.0-alpha.8

## 1.0.0-alpha.7

### Patch Changes

- Updated dependencies [[`1e2cf51`](https://github.com/runablejs/runable/commit/1e2cf51ccf01f2f8053428bed50659e6af2682f3), [`d289327`](https://github.com/runablejs/runable/commit/d2893277bfbe653243564ede6f810c89e6e158b1)]:
  - @runablejs/cli@1.0.0-alpha.7

## 1.0.0-alpha.6

### Patch Changes

- Updated dependencies [[`8ea56a0`](https://github.com/runablejs/runable/commit/8ea56a0eabf34859434651acf7840f1de9af7baf)]:
  - @runablejs/cli@1.0.0-alpha.6

## 1.0.0-alpha.2

### Patch Changes

- [#42](https://github.com/runablejs/runable/pull/42) [`8589e2c`](https://github.com/runablejs/runable/commit/8589e2c1ab0ccf785ed3df3b3b886d80ac4a70dc) Thanks [@domutala](https://github.com/domutala)! - Fix the bundled CLI resolution in the `create-runable` bin: it now resolves `@runablejs/cli` through the package's own export map instead of a hardcoded `dist/index.js` path, so it keeps working if that package's build output ever moves.
- Updated dependencies [[`8589e2c`](https://github.com/runablejs/runable/commit/8589e2c1ab0ccf785ed3df3b3b886d80ac4a70dc)]:
  - @runablejs/cli@1.0.0-alpha.5
