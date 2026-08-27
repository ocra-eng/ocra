import type { Root } from "hast"
// Built by the markdown-docs Vite plugin from docs/content/*.md frontmatter.
import { docIndex } from "virtual:doc-index"

import { DEFAULT_LANGUAGE_CODE } from "@/features/language/constants"

/** Pages are authored as markdown in docs/content. Each file's frontmatter
 *  declares the URL it is served at, so the route table is derived from the
 *  documents themselves — change a document's url and the page moves.
 *
 *  A file may have locale variants: `hub-governance.ga.md` serves the Irish
 *  version of whatever `hub-governance.md` serves. Where no variant exists the
 *  English document is served, so a missing translation degrades to readable
 *  rather than to nothing.
 *
 *  Metadata is available synchronously because routing needs it. Content trees
 *  sit behind lazy imports, so a visitor downloads the page they asked for. */

export interface DocMeta {
  url: string
  title: string
  standfirst?: string
  description: string
  /** Source filename, for error messages and tests. */
  source: string
}

export interface Doc extends DocMeta {
  locale: string
  load: () => Promise<{ meta: DocMeta; tree: Root }>
}

const all: Doc[] = docIndex.map(({ locale, meta, load }) => ({
  ...meta,
  locale,
  load,
}))

/** url -> locale -> document */
const byUrl = new Map<string, Map<string, Doc>>()
for (const doc of all) {
  if (doc.url === "/") {
    throw new Error(
      `${doc.source}: "/" is the home page and is not served from docs/content`
    )
  }
  const locales = byUrl.get(doc.url) ?? new Map<string, Doc>()
  const clash = locales.get(doc.locale)
  if (clash) {
    throw new Error(
      `${doc.source} and ${clash.source} both claim ${doc.url} (${doc.locale})`
    )
  }
  locales.set(doc.locale, doc)
  byUrl.set(doc.url, locales)
}

for (const [url, locales] of byUrl) {
  if (!locales.has(DEFAULT_LANGUAGE_CODE)) {
    const any = [...locales.values()][0]
    throw new Error(
      `${any.source}: ${url} has a translation but no English original`
    )
  }
}

/** Every page, once, in its English form — for routing, tests and the sitemap. */
export const allDocs: Doc[] = [...byUrl.values()]
  .map((locales) => locales.get(DEFAULT_LANGUAGE_CODE)!)
  .sort((a, b) => a.url.localeCompare(b.url))

/** The document for a path in the requested locale, falling back to English. */
export const docFor = (url: string, locale = DEFAULT_LANGUAGE_CODE) => {
  const locales = byUrl.get(url)
  return locales?.get(locale) ?? locales?.get(DEFAULT_LANGUAGE_CODE)
}

/** Locales a page is actually translated into, for hreflang. */
export const localesFor = (url: string): string[] => [
  ...(byUrl.get(url)?.keys() ?? []),
]
