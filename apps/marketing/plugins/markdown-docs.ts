import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join, resolve } from "node:path"
import type { Plugin } from "vite"
import type { Element, Root } from "hast"

import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import remarkDirective from "remark-directive"
import remarkRehype from "remark-rehype"
import rehypeSlug from "rehype-slug"
import remarkDefinitionList, {
  defListHastHandlers,
} from "remark-definition-list"
import { visit } from "unist-util-visit"

/** ::include{from="_partials/x.md"} splices another markdown file in at build
 *  time, so a fact that must be word-identical in several places has one source.
 *
 *  Use it for short invariant blocks — an escalation route, a definitions table.
 *  Not for whole explanations: repeating those still makes the reader wade
 *  through the same text on every page, and the fix for that is one canonical
 *  page and a link, not transclusion. */
const resolveIncludes =
  (docsDir: string, parse: (source: string) => Root) =>
  (tree: Root, file: { path?: string }) => {
    const seen = new Set<string>()

    const expand = (node: { children?: unknown[] }, depth: number): void => {
      if (!node.children) return
      const out: unknown[] = []
      for (const child of node.children) {
        const c = child as {
          type: string
          name?: string
          attributes?: Record<string, string | null | undefined>
          children?: unknown[]
        }
        if (c.type === "leafDirective" && c.name === "include") {
          const from = c.attributes?.from
          if (!from) {
            throw new Error(`${file.path}: ::include needs a "from" attribute`)
          }
          const target = resolve(docsDir, from)
          if (seen.has(target) || depth > 4) {
            throw new Error(
              `${file.path}: ::include cycle or nesting too deep at "${from}"`
            )
          }
          if (!existsSync(target)) {
            throw new Error(`${file.path}: ::include cannot find "${from}"`)
          }
          seen.add(target)
          const partial = parse(readFileSync(target, "utf8"))
          expand(partial as { children?: unknown[] }, depth + 1)
          out.push(...(partial.children as unknown[]))
          seen.delete(target)
          continue
        }
        expand(c, depth)
        out.push(child)
      }
      node.children = out
    }

    expand(tree as { children?: unknown[] }, 0)
  }

/** Callout types the content actually needs. Each maps to a React component;
 *  anything else is a mistake in the source and fails the build. */
const CALLOUTS = new Set([
  "not-live",
  "before-you-rely-on-this",
  "escalate",
])

/** Blocks whose h3 sections become a grid of cards.
 *
 *  :::cards turns the h3 links inside it into a card grid. Hub pages are
 *  documents like any other; this is the one block that makes them look like a
 *  hub rather than a list of links.
 *
 *  :::partners does the same for partner offers: one h3 section per partner,
 *  holding the partner's logo and the offer. */
const GRIDS = {
  cards: { hName: "nav", grid: "data-cards", item: "data-card" },
  partners: { hName: "div", grid: "data-partners", item: "data-partner" },
} as const

type GridName = keyof typeof GRIDS

const gridFor = (node: Element) =>
  Object.values(GRIDS).find(
    (g) => g.hName === node.tagName && g.grid in (node.properties ?? {})
  )

/** :::name … ::: becomes <aside data-callout="name">, which the components map
 *  turns into a React component. The name is domain vocabulary, not severity. */
const calloutDirectives = () => (tree: unknown, file: { path?: string }) => {
  visit(tree as never, (node: never) => {
    const n = node as {
      type: string
      name?: string
      data?: Record<string, unknown>
      attributes?: Record<string, string>
    }
    if (n.type !== "containerDirective") return
    if (n.name && n.name in GRIDS) {
      const grid = GRIDS[n.name as GridName]
      n.data = { hName: grid.hName, hProperties: { [grid.grid]: "" } }
      return
    }
    if (!n.name || !CALLOUTS.has(n.name)) {
      throw new Error(
        `${file.path}: unknown block ":::${n.name}". ` +
          `Known: ${[...CALLOUTS, ...Object.keys(GRIDS)].join(", ")}`
      )
    }
    n.data = {
      hName: "aside",
      hProperties: { "data-callout": n.name },
    }
  })
}

/** Group a heading level and the content beneath it into <section> elements,
 *  labelled by that heading. Applied to h2 then h3, so the document tree matches
 *  the heading tree and an on-page contents list can generate itself. */
const group = (
  children: Element["children"],
  tagName: "h2" | "h3"
): Element["children"] => {
  const out: Element["children"] = []
  let current: Element | null = null
  for (const child of children) {
    if (child.type === "element" && child.tagName === tagName) {
      const id = child.properties?.id
      current = {
        type: "element",
        tagName: "section",
        properties: typeof id === "string" ? { "aria-labelledby": id } : {},
        children: [child],
      }
      out.push(current)
      continue
    }
    if (current) current.children.push(child)
    else out.push(child)
  }
  return out
}

const sectionise = () => (tree: Root) => {
  const subsection = (node: Element) => {
    const [heading, ...rest] = node.children
    node.children = [heading, ...group(rest, "h3")]
  }
  const top = group(tree.children as Element["children"], "h2")
  for (const node of top) {
    if (node.type !== "element") continue
    if (node.tagName === "section") subsection(node)
  }
  tree.children = top as Root["children"]

  // A grid holds h3 sections directly, whether it sits at the top of the page
  // (a hub's :::cards) or inside an h2 section (a page's :::partners).
  visit(tree, "element", (node: Element) => {
    const grid = gridFor(node)
    if (!grid) return
    node.children = group(node.children, "h3")
    for (const item of node.children) {
      if (item.type === "element" && item.tagName === "section") {
        item.properties = { ...item.properties, [grid.item]: "" }
      }
    }
  })
}

interface Frontmatter {
  url: string
  title: string
  standfirst?: string
  description?: string
}

/** Frontmatter here is flat `key: value` only — no nesting, no lists — so it
 *  reads as a header rather than needing a YAML parser. */
const splitFrontmatter = (
  source: string,
  path: string
): { meta: Frontmatter; body: string } => {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) throw new Error(`${path}: missing frontmatter`)
  const meta: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue
    const at = line.indexOf(":")
    if (at < 0) throw new Error(`${path}: cannot read frontmatter line "${line}"`)
    meta[line.slice(0, at).trim()] = line
      .slice(at + 1)
      .trim()
      .replace(/^["']|["']$/g, "")
  }
  for (const key of ["url", "title"]) {
    if (!meta[key]) throw new Error(`${path}: frontmatter needs "${key}"`)
  }
  if (!meta.url.startsWith("/")) {
    throw new Error(`${path}: url must be an absolute path, got "${meta.url}"`)
  }
  return {
    meta: meta as unknown as Frontmatter,
    body: source.slice(match[0].length),
  }
}

/** Meta description: the frontmatter value if given, otherwise the first
 *  paragraph. Whitespace is collapsed because markdown wraps lines, and the cut
 *  lands on a word boundary rather than mid-word. */
const describe = (meta: Frontmatter, body: string): string => {
  const explicit = meta.description?.trim()
  if (explicit) return explicit
  const firstPara =
    body
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .find(
        (block) =>
          block &&
          !block.startsWith("#") &&
          !block.startsWith(":") &&
          !block.startsWith("|") &&
          !block.startsWith("-")
      ) ?? ""
  const flat = firstPara
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*`_]/g, "")
    .replace(/\s+/g, " ")
    .trim()
  if (flat.length <= 170) return flat
  return flat.slice(0, 167).replace(/\s+\S*$/, "") + "…"
}

/** Markdown to mdast only. Used for the page body and, recursively, for any
 *  partial it includes — the include pass runs before anything turns the tree
 *  into HTML, so a partial composes exactly as inline content would. */
const toMdast = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkDirective)
  .use(remarkDefinitionList)

const buildProcessor = (docsDir: string) =>
  unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(resolveIncludes, docsDir, (source: string) =>
      toMdast.parse(source) as never
    )
    .use(remarkDefinitionList)
    .use(calloutDirectives)
    .use(remarkRehype, { handlers: { ...defListHastHandlers } })
    .use(rehypeSlug)
    .use(sectionise)

/** Compiles docs/content/*.md to a module exporting the page's metadata and its
 *  content as a hast tree. The markdown parser runs here, at build time — the
 *  client receives the tree and a small renderer, never a parser. */
const INDEX_ID = "virtual:doc-index"
const LOCALES = ["en", "ga", "pl", "ru", "be"]

/** "hub-governance.ga.md" -> { base: "hub-governance", locale: "ga" }.
 *  A file with no locale suffix is the English original and the fallback for
 *  every locale that has no variant of its own. */
const localeOf = (file: string): { base: string; locale: string } => {
  const m = file.match(/^(.+)\.([a-z]{2})\.md$/)
  if (m && LOCALES.includes(m[2])) return { base: m[1], locale: m[2] }
  return { base: file.replace(/\.md$/, ""), locale: "en" }
}

export const markdownDocs = (docsDir: string): Plugin => {
  const processor = buildProcessor(docsDir)
  return {
  name: "ocra:markdown-docs",
  enforce: "pre",

  resolveId(id) {
    if (id === INDEX_ID) return "\0" + INDEX_ID
  },

  /** The index carries frontmatter only. Routing and the sitemap need every
   *  page's url and title up front; the content trees stay behind lazy imports
   *  so a visitor downloads one page, not thirty-three. */
  load(id) {
    if (id !== "\0" + INDEX_ID) return null
    const entries = readdirSync(docsDir)
      // "_" marks a partial — content composed into pages, not served as one.
      .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
      .sort()
      .map((file) => {
        const path = join(docsDir, file)
        const source = readFileSync(path, "utf8")
        const { meta, body } = splitFrontmatter(source, path)
        return {
          file,
          meta: { ...meta, description: describe(meta, body), source: file },
        }
      })
    const lines = entries.map(
      ({ file, meta }) =>
        `  { locale: ${JSON.stringify(localeOf(file).locale)}, ` +
        `meta: ${JSON.stringify(meta)}, ` +
        `load: () => import(${JSON.stringify(docsDir + "/" + file)}) }`
    )
    return `export const docIndex = [\n${lines.join(",\n")}\n]\n`
  },

  async transform(_code, id) {
    if (!id.endsWith(".md")) return null
    const source = readFileSync(id, "utf8")
    const { meta, body } = splitFrontmatter(source, id)
    const tree = await processor.run(processor.parse(body), { path: id } as never)

    return {
      code: `export const meta = ${JSON.stringify({
        ...meta,
        description: describe(meta, body),
        source: id.split("/").pop(),
      })}
export const tree = ${JSON.stringify(tree)}`,
      map: null,
    }
  },
  }
}
