import type { ComponentInfo, ResolvedOptions } from "./types";
import { writeDts } from "./dts";
import { scanComponents } from "./scan";
import { isSubPath, slash } from "./utils";

export class AutoImportContext {
  options: ResolvedOptions;
  components: Map<string, ComponentInfo> = new Map();
  private scanning: Promise<void> | null = null;

  constructor(options: ResolvedOptions) {
    this.options = options;
  }

  get root(): string {
    return this.options.root;
  }

  log(msg: string): void {
    if (this.options.verbose) console.log(msg);
  }

  async init(): Promise<void> {
    await this.rescan();
  }

  /** Re-scans every configured directory and regenerates the `.d.ts` file. Safe to call concurrently. */
  async rescan(): Promise<void> {
    if (this.scanning) return this.scanning;

    this.scanning = (async () => {
      this.components = await scanComponents(this.options, (m) => this.log(m));
      this.log(
        `[unplugin-auto-components] scanned ${this.components.size} component(s)`,
      );
      await writeDts(this.components, this.options.dts, this.root);
    })();

    try {
      await this.scanning;
    } finally {
      this.scanning = null;
    }
  }

  /** True if `filePath` lives inside one of the configured scan directories. */
  isWatchedDir(filePath: string): boolean {
    const p = slash(filePath);
    return this.options.dirs.some((d) =>
      d.dirs.some((dir) => isSubPath(dir, p)),
    );
  }

  /** True if `filePath`'s extension is one of the configured component extensions. */
  matchesExtension(filePath: string): boolean {
    const ext = filePath.split(".").pop() ?? "";
    return this.options.dirs.some((d) => d.extensions.includes(ext));
  }

  /** Called by the `watchChange` unplugin hook. Only file creation/deletion can change the name -> path map. */
  async handleWatchChange(
    id: string,
    event: "create" | "update" | "delete",
  ): Promise<void> {
    if (event === "update") return;
    if (!this.isWatchedDir(id) || !this.matchesExtension(id)) return;

    this.log(
      `[unplugin-auto-components] ${event} detected for "${id}", rescanning components`,
    );
    await this.rescan();
  }
}
