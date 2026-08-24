import { describe, expect, it } from "vitest"
import { authResources } from "../src/features/auth/i18n"
import { membershipResources } from "../src/features/membership/i18n"
import { shellResources } from "../src/features/shell/i18n"
import { LANGUAGE_CODES } from "../src/i18n"

const keyTree = (value: unknown, prefix = ""): string[] => {
  if (typeof value !== "object" || value === null) return [prefix]
  return Object.entries(value).flatMap(([key, child]) =>
    keyTree(child, prefix ? `${prefix}.${key}` : key)
  )
}

const NAMESPACES = [
  ["auth", authResources],
  ["membership", membershipResources],
  ["shell", shellResources],
] as const

describe.each(NAMESPACES)("%s resources", (_ns, resources) => {
  const reference = keyTree(resources.en).sort()
  const locales = Object.keys(resources) as (keyof typeof resources)[]

  it("covers every released language", () => {
    expect(locales.sort()).toEqual([...LANGUAGE_CODES].sort())
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
