import type { ResolvedScanDirFile, ScanDir } from "@/utils/dir/scan.js";
import type { RouteMeta } from "vue-router";

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
