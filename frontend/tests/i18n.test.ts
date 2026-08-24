import { describe, expect, it } from "vitest"
import { aboutResources } from "../src/features/about/i18n"
import { coachingResources } from "../src/features/coaching/i18n"
import { getInvolvedResources } from "../src/features/get-involved/i18n"
import { governanceResources } from "../src/features/governance/i18n"
import { homeResources } from "../src/features/home/i18n"
import { membershipResources } from "../src/features/membership/i18n"
import { raceOrganisersResources } from "../src/features/race-organisers/i18n"
import { themeResources } from "../src/features/theme/i18n"

const keyTree = (value: unknown, prefix = ""): string[] => {
  if (typeof value !== "object" || value === null) return [prefix]
  return Object.entries(value).flatMap(([key, child]) =>
    keyTree(child, prefix ? `${prefix}.${key}` : key)
  )
}

const NAMESPACES = [
  ["home", homeResources],
  ["theme", themeResources],
  ["about", aboutResources],
  ["coaching", coachingResources],
  ["getInvolved", getInvolvedResources],
  ["membership", membershipResources],
  ["raceOrganisers", raceOrganisersResources],
  ["governance", governanceResources],
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
