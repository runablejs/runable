import type { ResolvedScanDirFile, ScanDir } from "@/utils/dir/scan.js";
import type { RouteMeta } from "vue-router";

/**
 * Editable file-based route node exposed to `extendRoutes`.
 *
 * This mirrors Vue Router's route-tree API without exposing its bundler
 * plugin types through Runable's public configuration declarations.
 */
export interface EditableRouteTreeNode extends Iterable<EditableRouteTreeNode> {
  delete(): void;
  insert(path: string, filePath: string): EditableRouteTreeNode;
  readonly parent: EditableRouteTreeNode | undefined;
  readonly components: Map<string, string>;
  readonly component: string | undefined;
  get name(): string | false;
  set name(value: string | undefined);
  readonly isPassThrough: boolean;
  get meta(): Readonly<RouteMeta>;
  set meta(value: RouteMeta);
  addToMeta(meta: Partial<RouteMeta>): void;
  get path(): string;
  set path(value: string);
  readonly alias: string[] | undefined;
  addAlias(alias: string | string[]): void;
  readonly params: readonly unknown[];
  readonly fullPath: string;
  readonly children: EditableRouteTreeNode[];
  traverseDFS(): Generator<EditableRouteTreeNode, void, unknown>;
  traverseBFS(): Generator<EditableRouteTreeNode, void, unknown>;
  [Symbol.iterator](): Generator<EditableRouteTreeNode, void, unknown>;
}

/**
 * Router-specific scan options, on top of the shared `ScanDir` base.
 */
type RouterScanExtra = {
  dynamic?: boolean;
};

/**
 * @default dirs: 'src/pages'
 */
export type RouterOptionsRaw = ScanDir<RouterScanExtra>;

export type RouterOptionsRawResolved = ResolvedScanDirFile<RouterScanExtra>;

export interface PageMeta extends RouteMeta {
  name?: string;
  path?: string;
  alias?: string[];
  middleware?: string[];
}
