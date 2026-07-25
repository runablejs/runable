/// <reference types="vite/client" />

/**
 * @fileoverview Type augmentation for the custom `import.meta.*` shorthands
 * introduced by the `syora:import-meta` Vite plugin.
 *
 * This declaration merges additional properties into the global
 * `ImportMeta` interface so the IDE and the TypeScript compiler recognize
 * `import.meta.server`, `import.meta.client`, `import.meta.development`,
 * `import.meta.production`, and `import.meta.baseUrl` as valid,
 * strongly-typed properties.
 *
 * @remarks
 * These properties don't exist at runtime as-is — they are statically
 * rewritten at build time by the `syora:import-meta` plugin into their
 * corresponding `import.meta.env.*` expression. This file only exists to
 * satisfy the type checker; the plugin handles the actual code transform.
 */
declare global {
  interface ImportMeta {
    /**
     * `true` when the current module is evaluated on the server (SSR).
     * Statically replaced with `import.meta.env.SSR` at build time.
     */
    readonly server: boolean;

    /**
     * `true` when the current module is evaluated on the client.
     * Statically replaced with `!import.meta.env.SSR` at build time.
     */
    readonly client: boolean;

    /**
     * `true` when running in development mode.
     * Statically replaced with `import.meta.env.DEV` at build time.
     */
    readonly development: boolean;

    /**
     * `true` when running in production mode.
     * Statically replaced with `import.meta.env.PROD` at build time.
     */
    readonly production: boolean;

    /**
     * The base public path from which the app is served, as configured via
     * `base` in `vite.config.ts` (defaults to `"/"`).
     * Statically replaced with `import.meta.env.BASE_URL` at build time.
     */
    readonly baseUrl: string;
  }
}

// Ensures this file is treated as a module, which is required for
// `declare global` to work correctly.
export {};
