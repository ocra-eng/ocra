import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import type { Element, Root, RootContent } from "hast"

import { allDocs, docFor } from "../src/features/doc"

// Pages are authored as markdown in docs/content and declare their own URL.
// These checks exist to stop the things that make content untrustworthy: a
// link that goes nowhere, an image that does not ship, and two pages claiming
// the same address.

const NON_PAGE_ROUTES = [
  "/",
  "/assets",
  "/get-involved",
  "/governance",
  "/race-organisers",
]

const PUBLIC_DIR = fileURLToPath(new URL("../public", import.meta.url))

const attributeIn = (tree: Root, name: "href" | "src"): string[] => {
  const found: string[] = []
  const walk = (nodes: RootContent[] | Element["children"]) => {
    for (const node of nodes) {
      if (node.type !== "element") continue
      const el = node as Element
      const value = el.properties?.[name]
      if (typeof value === "string") found.push(value)
      if (el.children) walk(el.children)
    }
  }
  walk(tree.children)
  return found
}

const hrefsIn = (tree: Root) => attributeIn(tree, "href")
const srcsIn = (tree: Root) => attributeIn(tree, "src")

describe("authored documents", () => {
  it("resolves every document at its declared path", () => {
    expect(allDocs.length).toBeGreaterThan(0)
    for (const doc of allDocs) {
      // REST: a path names a resource — lowercase, no verbs, no extension
      expect(doc.url, doc.source).toMatch(/^\/[a-z0-9]+(?:[/-][a-z0-9]+)*$/)
      expect(docFor(doc.url)?.source).toBe(doc.source)
    }
  })

  it("gives every document a title and a usable meta description", () => {
    for (const doc of allDocs) {
      expect(doc.title.trim(), doc.source).not.toBe("")
      expect(doc.description.trim(), doc.source).not.toBe("")
      expect(doc.description.length, doc.source).toBeLessThanOrEqual(170)
      // markdown wraps lines; a description with newlines in it is a bug
      expect(doc.description, doc.source).not.toMatch(/\s{2,}|\n/)
    }
  })

  it("points every internal link at a path something serves", async () => {
    const known = new Set([...NON_PAGE_ROUTES, ...allDocs.map((d) => d.url)])
    for (const doc of allDocs) {
      const { tree } = await doc.load()
      for (const href of hrefsIn(tree)) {
        if (!href.startsWith("/")) continue
        expect(known, `${doc.source} links to unknown ${href}`).toContain(href)
      }
    }
  })

  it("ships every image the content shows", async () => {
    for (const doc of allDocs) {
      const { tree } = await doc.load()
      for (const src of srcsIn(tree)) {
        // Content images are root-relative and live in public/.
        expect(src, doc.source).toMatch(/^\/img\//)
        expect(
          existsSync(`${PUBLIC_DIR}${src}`),
          `${doc.source} shows ${src}, which is not in public/`
        ).toBe(true)
      }
    }
  })
})
