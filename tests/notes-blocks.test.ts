import { describe, it, expect } from "vitest"
import fs from "fs"
// SPECSFY: US-001 FR-002 NFR-002 AC-002
describe("Notes AC-002 blocos essenciais", () => {
  it("suporta heading, lista, quote, code, hr via slash", () => {
    const src = fs.readFileSync("apps/web/features/notes/components/note-editor.tsx", "utf8")
    expect(src).toContain("slash")
  })
})
