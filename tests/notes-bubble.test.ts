import { describe, it, expect } from "vitest"
import { BUBBLE_ACTIONS } from "@/features/notes/lib/note-document"
// SPECSFY: US-001 FR-001 FR-002 NFR-002 AC-008
describe("Notes AC-008 bubble menu", () => {
  it("expõe apenas ações de formatação contextual", () => {
    expect(BUBBLE_ACTIONS).toEqual(["bold", "italic", "highlight"])
  })
})
