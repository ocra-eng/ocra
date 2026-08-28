import { describe, expect, it } from "vitest"
import { loadConfig } from "../src/config.js"

const BASE = {
  DATABASE_URL: "pglite://memory",
  SUPABASE_URL: "https://test.supabase.co",
  MEMBERS_APP_URL: "http://localhost:5174",
}

const OFFER = {
  key: "shop-a",
  name: "Shop A",
  percent: 10,
  shopUrl: "https://shop-a.example",
  code: "CODE10",
}

describe("PARTNER_OFFERS", () => {
  it("defaults to no offers", () => {
    expect(loadConfig(BASE).partnerOffers).toEqual([])
  })

  it("parses a valid list", () => {
    const config = loadConfig({ ...BASE, PARTNER_OFFERS: JSON.stringify([OFFER]) })
    expect(config.partnerOffers).toEqual([OFFER])
  })

  it("refuses to boot on malformed JSON", () => {
    expect(() => loadConfig({ ...BASE, PARTNER_OFFERS: "[{oops" })).toThrow(
      /PARTNER_OFFERS: not valid JSON/
    )
  })

  it("refuses to boot on an invalid offer", () => {
    const bad = JSON.stringify([{ ...OFFER, percent: 0 }])
    expect(() => loadConfig({ ...BASE, PARTNER_OFFERS: bad })).toThrow(
      /PARTNER_OFFERS\.0\.percent/
    )
  })
})
