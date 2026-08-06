import { ResolvedScanDirFile, ScanDir } from "@/utils";

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
