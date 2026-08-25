import { describe, it, expect } from "vitest"
import { formatMissingBibleMessage } from "@/features/notes/lib/note-document"
// SPECSFY: US-002 FR-003 NFR-001 AC-004
describe("Notes AC-004 fallback bibleReference", () => {
  it("mostra uma orientação quando a Bíblia não está instalada", () => {
    expect(formatMissingBibleMessage("ara")).toBe("Instale ARA para ver o texto.")
  })
})
