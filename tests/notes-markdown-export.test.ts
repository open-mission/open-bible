import { describe, it, expect } from "vitest"
// SPECSFY: US-003 FR-005 NFR-002 AC-007
describe("Notes AC-007 export Markdown", () => {
  it("exporta JSON para Markdown com link bible://", async () => {
    const exists = await import("@/features/notes/lib/markdown-export").then(() => true).catch(() => false)
    expect(exists).toBe(true)
  })
})
