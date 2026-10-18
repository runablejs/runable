import type { ResolveScanDir, ScanDir } from "@/utils/dir-scan.js";

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
   * File extensions considered as components.
   * @default ['.vue']
   */
  extensions?: string | string[];

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
 * @default folder: 'src/components'
 * @default extensions: ['vue']
 */
export type ComponentDir = ScanDir<ComponentScanExtra>;

export type ComponentDirResolved = ResolveScanDir<ComponentScanExtra>;

/** Metadata about a single discovered component. */
export interface ComponentInfo {
  /** Explicit SFC name when declared, otherwise the name inferred from the file path. */
  name: string;
  /** Absolute path to the component file. */
  path: string;
  /** File extension, without the leading dot. */
  ext: string;
}
