import { describe, expect, it } from "vitest"
import { homeResources } from "../src/features/home/i18n"
import { themeResources } from "@ocra/ui"

const keyTree = (value: unknown, prefix = ""): string[] => {
  if (typeof value !== "object" || value === null) return [prefix]
  return Object.entries(value).flatMap(([key, child]) =>
    keyTree(child, prefix ? `${prefix}.${key}` : key)
  )
}

// Page copy is translated as sibling markdown files in docs/content (see the
// documents test); what remains here is the site chrome.
const NAMESPACES = [
  ["home", homeResources],
  ["theme", themeResources],
] as const

describe.each(NAMESPACES)("%s resources", (_ns, resources) => {
  const reference = keyTree(resources.en).sort()
  const locales = Object.keys(resources) as (keyof typeof resources)[]

  it("covers en, ga, pl, ru, be", () => {
    expect(locales.sort()).toEqual(["be", "en", "ga", "pl", "ru"])
  })

  it.each(locales)("%s has the same key tree as en", (locale) => {
    expect(keyTree(resources[locale]).sort()).toEqual(reference)
  })

  it.each(locales)("%s has no empty values", (locale) => {
    const walk = (value: unknown): void => {
      if (typeof value === "string") {
        expect(value.trim()).not.toBe("")
        return
      }
      Object.values(value as Record<string, unknown>).forEach(walk)
    }
    walk(resources[locale])
  })
})
