import { describe, it, expect } from "vitest"
import { parseReference } from "../src/lib/parse-reference.js"

describe("parseReference", () => {
  it("SPECSFY: US-001 FR-002 FR-003 NFR-001 AC-002 Gn 1:15", () => {
    const r = parseReference("Gn 1:15")
    expect(r).toEqual({ bookId: "gen", chapter: 1, verse: 15 })
  })

  it("SPECSFY: US-002 FR-004 FR-005 NFR-002 AC-007 1Jo 3:16", () => {
    const r = parseReference("1Jo 3:16")
    expect(r).toEqual({ bookId: "1jo", chapter: 3, verse: 16 })
  })

  it("SPECSFY: US-002 FR-004 FR-005 NFR-002 AC-007 jo 3 16 lower", () => {
    const r = parseReference("jo 3 16")
    expect(r).toEqual({ bookId: "jhn", chapter: 3, verse: 16 })
  })

  it("SPECSFY: US-002 FR-004 FR-005 NFR-002 AC-007 amor not book", () => {
    const r = parseReference("amor")
    expect(r).toBeNull()
  })

  it("SPECSFY: US-001 FR-002 FR-003 NFR-001 AC-009 Gn 1", () => {
    const r = parseReference("Gn 1")
    expect(r).toEqual({ bookId: "gen", chapter: 1, verse: undefined })
  })
})
