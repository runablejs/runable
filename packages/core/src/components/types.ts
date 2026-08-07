import type {
  Arrayable,
  Fallback,
  ResolvedScanDir,
  ResolvedScanDirFile,
  ScanDir,
} from "@/utils";

/**
 * Component-specific scan options, on top of the shared `ScanDir` base.
 */
export type ComponentScanExtra = {
  /**
   * When `true`, the component name is prefixed with its folder path
   * (e.g. `base/Button.vue` -> `BaseButton`). When `false`, only the
   * file name is used (e.g. `Button.vue` -> `Button`).
   * @default true
   */
  pathPrefix?: boolean;

  prefix?: string;

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
};

/**
 * @default dirs: 'src/components'
 * @default extensions: ['vue']
 */
export type ComponentDir = ScanDir<ComponentScanExtra>;

export interface AutoComponentOptions {
  /**
   * Directory(ies) to scan for local components.
   * Resolved relative to the project root (Vite's `root`).
   * @default 'src/components'
   */
  // dirs?: Arrayable<ComponentDir>;
  dirs?: Arrayable<ResolvedComponentDir>;

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
   * When `true`, the component name is prefixed with its folder path.
   * @default true
   */
  pathPrefix?: boolean;

  prefix?: string;

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

export type ResolvedComponentDir = ResolvedScanDirFile<ComponentScanExtra>;

/** Fully resolved plugin options. */
export interface ResolvedOptions {
  root: string;
  dirs: ResolvedComponentDir[];
  dts: string | false;
  verbose: boolean;
}

/** Metadata about a single discovered component. */
export interface ComponentInfo {
  name: string;
  /** Absolute path to the component file. */
  path: string;
  /** File extension, without the leading dot. */
  ext: string;
}

export type ComponentFallback = Fallback<
  ComponentScanExtra & Required<Pick<ComponentScanExtra, "pathPrefix">>
>;
