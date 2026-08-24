import { describe, expect, it } from "vitest"
import { contentEntries, loadContent } from "../src/content"
import type { PageContent } from "../src/content"

// Routes that exist outside the content registry (hubs, home).
const NON_CONTENT_ROUTES = new Set([
  "/",
  "/get-involved",
  "/governance",
  "/race-organisers",
])

// Content pages whose route differs from /<section>/<slug>.
const ROUTE_OVERRIDES: Record<string, string> = {
  "about/index": "/about",
  "education/coaching": "/coaching",
  "get-involved/membership": "/membership",
}

const routeFor = (section: string, slug: string) =>
  ROUTE_OVERRIDES[`${section}/${slug}`] ?? `/${section}/${slug}`

const loadAll = async (): Promise<PageContent[]> =>
  Promise.all(
    contentEntries.map(async ({ section, slug }) => {
      const loader = loadContent(section, slug)
      if (!loader) throw new Error(`no loader for ${section}/${slug}`)
      return (await loader()).content
    })
  )

describe("content registry", () => {
  it("has every expected section", () => {
    const sections = new Set(contentEntries.map((e) => e.section))
    expect([...sections].sort()).toEqual([
      "about",
      "clubs",
      "compete",
      "education",
      "get-involved",
      "governance",
      "race-organisers",
    ])
    expect(contentEntries.length).toBeGreaterThanOrEqual(30)
  })

  it("every page has valid meta and matching path", async () => {
    for (const content of await loadAll()) {
      expect(content.meta.title.trim()).not.toBe("")
      expect(content.meta.description.trim()).not.toBe("")
      expect(content.meta.description.length).toBeLessThanOrEqual(170)
      expect(content.path).toBe(routeFor(content.section, content.slug))
      expect(content.blocks.length).toBeGreaterThan(0)
    }
  })

  it("every internal link and CTA resolves to a real route", async () => {
    const pages = await loadAll()
    const known = new Set([
      ...NON_CONTENT_ROUTES,
      ...pages.map((c) => c.path),
    ])
    for (const content of pages) {
      const hrefs = [
        ...content.ctas.map((c) => c.href),
        ...content.blocks.flatMap((b) => (b.type === "link" ? [b.href] : [])),
      ]
      for (const href of hrefs) {
        if (!href.startsWith("/")) continue
        expect(known, `${content.path} links to unknown ${href}`).toContain(href)
      }
    }
  })
})
