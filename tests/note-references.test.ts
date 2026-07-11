import { describe, it, expect } from "vitest"
import { rangesOverlap } from "../lib/database/user/repositories/noteReferencesRepository"

describe("rangesOverlap", () => {
  it("matches a single verse against a single-verse reference", () => {
    expect(rangesOverlap(16, 16, 16, 16)).toBe(true)
    expect(rangesOverlap(16, 16, 17, 17)).toBe(false)
  })

  it("matches a query range contained within a reference range", () => {
    expect(rangesOverlap(17, 18, 16, 20)).toBe(true)
  })

  it("matches a reference range contained within a query range", () => {
    expect(rangesOverlap(10, 30, 14, 15)).toBe(true)
  })

  it("matches at the boundaries", () => {
    expect(rangesOverlap(10, 12, 12, 14)).toBe(true)
    expect(rangesOverlap(10, 12, 13, 14)).toBe(false)
  })

  it("treats a null reference end as a single verse", () => {
    expect(rangesOverlap(16, 16, 16, null)).toBe(true)
    expect(rangesOverlap(17, 17, 16, null)).toBe(false)
  })
})
