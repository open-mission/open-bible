import { describe, it, expect } from "vitest"
import fs from "fs"
// SPECSFY: US-001 FR-001 FR-002 NFR-002 AC-001
describe("Notes AC-001 canvas branco", () => {
  it("canvas sem borda com placeholder e slash menu", () => {
    const src = fs.readFileSync("apps/web/features/notes/components/note-editor.tsx", "utf8")
    expect(src).toContain("Escreva / para comandos")
    expect(src).toContain("slash")
    expect(src).not.toContain("rounded-xl border") // canvas branco sem borda de formulário
  })
})
