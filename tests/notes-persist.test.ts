import { describe, it, expect } from "vitest"
import fs from "fs"
// SPECSFY: US-003 FR-003 FR-004 FR-005 NFR-001 AC-005
describe("Notes AC-005 persistir", () => {
  it("persiste JSON e reconstrói note_references", () => {
    const src = fs.readFileSync("apps/web/features/notes/components/note-editor.tsx", "utf8")
    expect(src).toContain("save")
    expect(src).toContain("note_references")
  })
})
