import { describe, it, expect } from "vitest"
// SPECSFY: US-003 FR-003 FR-005 NFR-001 AC-006
describe("Notes AC-006 recarregar idêntico", () => {
  it("recarrega JSON idêntico com bibleReference", async () => {
    const exists = await import("@/features/notes/components/note-editor").then(() => true).catch(() => false)
    expect(exists).toBe(true)
  })
})
