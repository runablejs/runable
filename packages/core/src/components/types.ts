import type { Arrayable } from "@/utils";

/** A side-effect-only import to inject alongside a resolved component (e.g. its CSS). */
export type SideEffectsInfo = string | string[];

/**
 * Describes how to import a single component.
 *
 * `from` is the import source: an absolute file path for components found
 * by scanning `dirs`, or a bare module specifier (e.g. `'my-ui-lib/es'`)
 * for components resolved via `resolvers`.
 *
 * `name` is the export to import: use the literal string `'default'` for a
 * default export, or the named export identifier otherwise.
 */
export interface ComponentInfo {
  from: string;
  name: string;
  /** Extra side-effect-only imports to inject alongside the component (e.g. a CSS file). */
  sideEffects?: SideEffectsInfo;
}

export type ComponentResolveResult =
  | ComponentInfo
  | string
  | null
  | undefined
  | void;

export type ComponentResolverFunction = (
  name: string,
) => ComponentResolveResult | Promise<ComponentResolveResult>;

export interface ComponentResolverObject {
  /** Only 'component' resolvers are used by this plugin; 'directive' entries are ignored. */
  type?: "component" | "directive";
  resolve: ComponentResolverFunction;
}

/** A resolver can be a plain function, or an object wrapping one. */
export type ComponentResolver =
  | ComponentResolverFunction
  | ComponentResolverObject;

export type ComponentDir =
  | string
  | {
      /**
       * Directory(ies) to scan for local components.
       * Resolved relative to the project root (Vite's `root`).
       * @default 'src/components'
       */
      dirs?: string | string[];

      /**
       * File extensions considered as components.
       * @default ['vue']
       */
      extensions?: string | string[];

      /**
       * Globs to exclude from the scan.
       * @default ['**\/node_modules/**', '**\/.git/**']
       */
      exclude?: string[];

      /**
       * Renaming function: receives the absolute path of the component file
       * and the default PascalCase name computed from that path, and must
       * return the final name to recognize in templates.
       *
       * - Return a string: use it as the final name.
       * - Return `undefined`: keep the default name.
       * - Return `false`: exclude this component from auto-import.
       *
       * @example
       * // Prefix every component under a "base" folder
       * componentName: (filePath, defaultName) =>
       *   filePath.includes('/base/') ? `Base${defaultName}` : defaultName
       *
       * @example
       * // Explicit rename for a specific component
       * componentName: (filePath, defaultName) => {
       *   const overrides = { MyButton: 'AppButton' }
       *   return overrides[defaultName] ?? defaultName
       * }
       */
      componentName?: (
        filePath: string,
        defaultName: string,
      ) => string | false | undefined;

      /**
       * Custom resolvers used to resolve components that are not found under
       * `dirs` — typically components published by third-party UI libraries.
       * Accepts a mix of single resolvers and arrays of resolvers, so that
       * community resolver packages exporting an array (e.g. one resolver per
       * icon set) can be spread in directly, matching the same shape as
       * `unplugin-vue-components`.
       *
       * @example
       * resolvers: [
       *   ElementPlusResolver(),
       *   [IconResolverA(), IconResolverB()],
       * ]
       */
      resolvers?: (ComponentResolver | ComponentResolver[])[];
    };

export interface Options {
  /**
   * Directory(ies) to scan for local components.
   * Resolved relative to the project root (Vite's `root`).
   * @default 'src/components'
   */
  dirs?: Arrayable<ComponentDir>;

  /**
   * File extensions considered as components.
   * @default ['vue']
   */
  extensions?: string | string[];

  /**
   * Globs to exclude from the scan.
   * @default ['**\/node_modules/**', '**\/.git/**']
   */
  exclude?: string[];

  /**
   * Renaming function: receives the absolute path of the component file
   * and the default PascalCase name computed from that path, and must
   * return the final name to recognize in templates.
   *
   * - Return a string: use it as the final name.
   * - Return `undefined`: keep the default name.
   * - Return `false`: exclude this component from auto-import.
   *
   * @example
   * // Prefix every component under a "base" folder
   * componentName: (filePath, defaultName) =>
   *   filePath.includes('/base/') ? `Base${defaultName}` : defaultName
   *
   * @example
   * // Explicit rename for a specific component
   * componentName: (filePath, defaultName) => {
   *   const overrides = { MyButton: 'AppButton' }
   *   return overrides[defaultName] ?? defaultName
   * }
   */
  componentName?: (
    filePath: string,
    defaultName: string,
  ) => string | false | undefined;

  /**
   * Custom resolvers used to resolve components that are not found under
   * `dirs` — typically components published by third-party UI libraries.
   * Accepts a mix of single resolvers and arrays of resolvers, so that
   * community resolver packages exporting an array (e.g. one resolver per
   * icon set) can be spread in directly, matching the same shape as
   * `unplugin-vue-components`.
   *
   * @example
   * resolvers: [
   *   ElementPlusResolver(),
   *   [IconResolverA(), IconResolverB()],
   * ]
   */
  resolvers?: (ComponentResolver | ComponentResolver[])[];

  /**
   * Generates a TypeScript declaration file listing the detected local
   * components (useful for template auto-completion). `true` writes to
   * 'components.d.ts' at the project root, or pass a custom path.
   * `false` disables it. Note: only locally scanned components are
   * included; components resolved via `resolvers` are not (they are
   * resolved lazily per-file, not known ahead of time).
   * @default 'components.d.ts'
   */
  dts?: boolean | string;

  /** Enables debug logging to the console. @default false */
  verbose?: boolean;
}

export type ResolvedOptions = Required<
  Pick<Options, "dirs" | "extensions" | "exclude" | "verbose">
> &
  Pick<Options, "componentName" | "dts" | "resolvers">;
