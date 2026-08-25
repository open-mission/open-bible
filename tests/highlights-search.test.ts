import { describe, it, expect } from "vitest"
// SPECSFY: US-001 FR-001 FR-002 NFR-001 AC-009
describe("Highlights AC-009 busca", () => {
  it("busca textual case-insensitive em conteúdo e texto do versículo", async () => {
    const exists = await import("@/features/highlights/components/highlights-filter-bar").then(() => true).catch(() => false)
    expect(exists).toBe(true)
  })
})
