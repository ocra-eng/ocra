declare module "virtual:doc-index" {
  import type { Root } from "hast"
  interface DocMeta {
    url: string
    title: string
    standfirst?: string
    description: string
    source: string
  }
  export const docIndex: {
    locale: string
    meta: DocMeta
    load: () => Promise<{ meta: DocMeta; tree: Root }>
  }[]
}
