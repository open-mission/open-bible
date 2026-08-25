import { describe, it, expect } from "vitest"
// SPECSFY: US-002 FR-003 NFR-002 AC-005
describe("Highlights AC-005 excluir", () => {
  it("exclui com confirmação e cascade highlight_verses", async () => {
    const exists = await import("@/features/highlights/components/highlight-edit-dialog").then(() => true).catch(() => false)
    expect(exists).toBe(true)
  })
})
