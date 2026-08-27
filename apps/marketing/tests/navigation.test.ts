import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import type { NavItem } from "@ocra/shared"

import { allDocs } from "../src/features/doc"
import {
  FOOTER_META_LINKS,
  FOOTER_SITEMAP,
  NAV_ITEMS,
} from "../src/features/home/constants"
import { en as homeEn } from "../src/features/home/i18n/en"

// Hubs are documents too; their cards are links inside those documents.
const HUB_ROUTES = ["/get-involved", "/governance", "/race-organisers"]
// Reachable without a nav entry: the asset pages hang off their own footer
// sub-navigation, and the home route is the site root.
const NON_NAV_ROUTES = new Set(["/", "/assets"])

const flatten = (items: NavItem[]): NavItem[] =>
  items.flatMap((item) => [item, ...flatten(item.children ?? [])])

const navItems = [
  ...flatten(NAV_ITEMS),
  ...FOOTER_SITEMAP.flatMap((column) => flatten(column.items)),
  ...FOOTER_META_LINKS,
]
const navHrefs = navItems
  .map((item) => item.href)
  .filter((href): href is string => Boolean(href) && href.startsWith("/"))

describe("navigation", () => {
  const docRoutes = allDocs.map((d) => d.url)
  const allRoutes = new Set([...docRoutes, ...HUB_ROUTES, ...NON_NAV_ROUTES])

  it("points every nav and footer link at a page that exists", () => {
    for (const href of navHrefs) {
      expect(allRoutes, `nav links to unknown ${href}`).toContain(href)
    }
  })

  it("makes every published page reachable from nav, footer or a hub", async () => {
    const hubHrefs: string[] = []
    for (const url of HUB_ROUTES) {
      const hub = allDocs.find((d) => d.url === url)
      expect(hub, `no document serves the hub ${url}`).toBeTruthy()
      const { tree } = await hub!.load()
      hubHrefs.push(
        ...[...JSON.stringify(tree).matchAll(/"href":"(\/[^"]*)"/g)].map((m) => m[1])
      )
    }
    const reachable = new Set([...navHrefs, ...hubHrefs])
    const orphans = docRoutes.filter(
      (route) => !reachable.has(route) && !NON_NAV_ROUTES.has(route)
    )
    expect(orphans, `unreachable: ${orphans.join(", ")}`).toEqual([])
  })

  it("gives every nav key a label", () => {
    const labels = homeEn.nav as Record<string, string>
    const keys = [
      ...navItems.map((i) => i.key),
      ...FOOTER_SITEMAP.map((c) => c.key),
    ]
    for (const key of keys) {
      expect(labels[key]?.trim(), `no nav label for "${key}"`).toBeTruthy()
    }
  })

  it("keeps the static index.html description in step with the home meta", () => {
    // index.html is the pre-hydration fallback; useSeo sets the real one from
    // this same string. Two copies that cannot be reduced to one, so they get
    // locked together here.
    const html = readFileSync(resolve(import.meta.dirname, "../index.html"), "utf8")
    const match = html.match(/<meta\s+name="description"\s+content="([^"]+)"/s)
    expect(match, "no description meta in index.html").toBeTruthy()
    expect(match?.[1]).toBe(homeEn.meta.description)
  })
})
