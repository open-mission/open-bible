import { describe, it, expect } from "vitest"
import {
  NOTE_PLACEHOLDER,
  createEmptyNoteDocument,
  getSlashItems,
} from "@/features/notes/lib/note-document"
// SPECSFY: US-001 FR-001 FR-002 NFR-002 AC-001
describe("Notes AC-001 canvas branco", () => {
  it("define um documento vazio e o comando slash inicial", () => {
    expect(createEmptyNoteDocument()).toEqual({
      type: "doc",
      content: [{ type: "paragraph" }],
    })
    expect(NOTE_PLACEHOLDER).toBe("Escreva / para comandos")
    expect(getSlashItems("")[0]).toMatchObject({ id: "paragraph", label: "Parágrafo" })
  })
})
