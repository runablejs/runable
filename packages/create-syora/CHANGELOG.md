# create-runable

## 1.0.0-alpha.2

### Patch Changes

- Fix the bundled CLI resolution in the `create-runable` bin: it now resolves `@runablejs/cli` through the package's own export map instead of a hardcoded `dist/index.js` path, so it keeps working if that package's build output ever moves.
- Updated dependencies []:
  - @runablejs/cli@1.0.0-alpha.5
