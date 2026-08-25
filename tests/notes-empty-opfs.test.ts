import { describe, it, expect } from "vitest"
import { getNotesViewState } from "@/features/notes/lib/note-document"
// SPECSFY: US-001 FR-001 NFR-002 AC-009
describe("Notes AC-009 vazio/OPFS", () => {
  it("diferencia carregamento, erro OPFS e vazio", () => {
    expect(getNotesViewState({ loading: true, error: null, count: 0 })).toBe("loading")
    expect(getNotesViewState({ loading: false, error: "OPFS indisponível", count: 0 })).toBe("error")
    expect(getNotesViewState({ loading: false, error: null, count: 0 })).toBe("empty")
  })
})
