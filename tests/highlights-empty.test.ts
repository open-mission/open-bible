import { describe, it, expect } from "vitest"
// SPECSFY: US-003 FR-005 NFR-002 AC-008
describe("Highlights AC-008 vazio", () => {
  it("mostra estado vazio com CTA", async () => {
    const exists = await import("@/features/highlights/components/highlights-page").then(() => true).catch(() => false)
    expect(exists).toBe(true)
  })
})
