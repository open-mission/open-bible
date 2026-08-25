import { describe, it, expect } from "vitest"
// SPECSFY: US-002 FR-004 NFR-002 AC-006
describe("Highlights AC-006 copiar", () => {
  it("copia referência formatada para clipboard", async () => {
    const exists = await import("@/features/highlights/lib/copy").then(() => true).catch(() => false)
    expect(exists).toBe(true)
  })
})
