import { beforeEach, describe, expect, it, vi } from "vitest"

const storage = new Map<string, string>()

vi.stubGlobal("localStorage", {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
})

describe("theme slice", () => {
  beforeEach(() => {
    storage.clear()
    vi.resetModules()
  })

  it("defaults to system when nothing is stored", async () => {
    const { themeReducer } = await import("@ocra/ui")
    expect(themeReducer(undefined, { type: "init" }).mode).toBe("system")
  })

  it("restores a stored mode", async () => {
    storage.set("ocra-theme", "dark")
    const { themeReducer } = await import("@ocra/ui")
    expect(themeReducer(undefined, { type: "init" }).mode).toBe("dark")
  })

  it("falls back to system on an unknown stored value", async () => {
    storage.set("ocra-theme", "hotdog")
    const { themeReducer } = await import("@ocra/ui")
    expect(themeReducer(undefined, { type: "init" }).mode).toBe("system")
  })

  it("sets the mode", async () => {
    const { themeReducer, setMode } = await import("@ocra/ui")
    const state = themeReducer(undefined, { type: "init" })
    expect(themeReducer(state, setMode("light")).mode).toBe("light")
  })
})
