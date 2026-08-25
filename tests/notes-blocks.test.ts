import { describe, it, expect } from "vitest"
import { getSlashItems } from "@/features/notes/lib/note-document"
// SPECSFY: US-001 FR-002 NFR-002 AC-002
describe("Notes AC-002 blocos essenciais", () => {
  it("oferece os blocos essenciais no menu slash", () => {
    const ids = getSlashItems("").map((item) => item.id)
    expect(ids).toEqual([
      "paragraph",
      "heading",
      "bulletList",
      "orderedList",
      "blockquote",
      "codeBlock",
      "horizontalRule",
      "bibleReference",
    ])
  })
})
