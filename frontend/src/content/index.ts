import type { PageContent } from "./types"

const modules = import.meta.glob<{ content: PageContent }>("./pages/*/*.ts")

export const loadContent = (
  section: string,
  slug: string
): (() => Promise<{ content: PageContent }>) | undefined =>
  modules[`./pages/${section}/${slug}.ts`]

/** All registered content pages, for prerender lists and tests. */
export const contentEntries = Object.keys(modules).map((key) => {
  const [, , section, file] = key.split("/")
  return { section, slug: file.replace(/\.ts$/, "") }
})

export type { ContentBlock, PageContent, PageCta } from "./types"
