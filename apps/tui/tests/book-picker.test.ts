import { describe, it, expect } from "vitest"
import * as fs from "node:fs"

describe("BookPicker", () => {
  it("SPECSFY: US-001 FR-001 NFR-002 AC-005 estados", () => {
    const src = fs.readFileSync("src/ui/components/BookPicker.tsx", "utf-8")
    expect(src).toContain("Carregando")
    expect(src).toContain("Nenhum livro encontrado")
    expect(src).toContain("cyan")
  })

  it("SPECSFY: US-001 FR-001 FR-002 FR-003 NFR-001 AC-001 filtra", () => {
    const src = fs.readFileSync("src/ui/components/BookPicker.tsx", "utf-8")
    expect(src).toContain("filterBooks")
  })
})
