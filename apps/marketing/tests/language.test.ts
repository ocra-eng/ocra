import { describe, expect, it } from "vitest"
import {
  ALL_LANGUAGES,
  DEFAULT_LANGUAGE_CODE,
  RELEASED_LANGUAGE_CODES,
} from "../src/features/language/constants"

describe("language constants", () => {
  it("releases only languages that exist", () => {
    const known = ALL_LANGUAGES.map((language) => language.code)
    for (const code of RELEASED_LANGUAGE_CODES) {
      expect(known).toContain(code)
    }
  })

  it("has no duplicate released codes", () => {
    expect(new Set(RELEASED_LANGUAGE_CODES).size).toBe(
      RELEASED_LANGUAGE_CODES.length
    )
  })

  it("releases the default language", () => {
    expect(RELEASED_LANGUAGE_CODES).toContain(DEFAULT_LANGUAGE_CODE)
  })

  it("labels every language in its own tongue", () => {
    for (const language of ALL_LANGUAGES) {
      expect(language.label.trim()).not.toBe("")
    }
  })
})
