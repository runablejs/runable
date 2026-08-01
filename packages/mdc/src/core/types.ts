import { TocItem } from "remark-flexible-toc";
import remarkFrontmatter from "remark-frontmatter";

declare module "unist" {
  export interface Node {
    //   name?: string
    //   attributes?: Record<string, any>
    //   fmAttributes?: Record<string, any>
    //   rawData?: string
    children?: Node[];
  }
}

declare module "vfile" {
  export interface DataMap {
    toc: TocItem;
  }
}
