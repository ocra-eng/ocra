import { describe, expect, it } from "vitest"
import type { Element, Root, RootContent } from "hast"

import { allDocs, docFor } from "../src/features/doc"

// Pages are authored as markdown in docs/content and declare their own URL.
// These checks exist to stop the two things that make content untrustworthy: a
// link that goes nowhere, and two pages claiming the same address.

const NON_PAGE_ROUTES = [
  "/",
  "/assets",
  "/get-involved",
  "/governance",
  "/race-organisers",
]

const hrefsIn = (tree: Root): string[] => {
  const found: string[] = []
  const walk = (nodes: RootContent[] | Element["children"]) => {
    for (const node of nodes) {
      if (node.type !== "element") continue
      const el = node as Element
      const href = el.properties?.href
      if (typeof href === "string") found.push(href)
      if (el.children) walk(el.children)
    }
  }
  walk(tree.children)
  return found
}

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
})
