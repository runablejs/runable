import type { Arrayable } from "@/utils";

export type RouterOptions = {
  dynamic?: boolean;
  pages?: Arrayable<string>;
  exclude?: string[];
  extensions?: string[];
};

export type RouterOptionsRaw = string | RouterOptions;
