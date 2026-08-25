import { describe, it, expect } from "vitest"
import { parseNoteContent } from "@/features/notes/lib/note-document"
// SPECSFY: US-003 FR-003 FR-005 NFR-001 AC-006
describe("Notes AC-006 recarregar idêntico", () => {
  it("recarrega o documento JSON sem alterar seus blocos", () => {
    const document = {
      type: "doc",
      content: [{ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Título" }] }],
    }
    expect(parseNoteContent(JSON.stringify(document))).toEqual(document)
  })
})
