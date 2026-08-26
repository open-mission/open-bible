import { describe, it, expect } from "vitest"
import { getSaveStateLabel } from "@/features/notes/components/notes-workspace"

describe("Notes save state - AC-011/AC-012/AC-013", () => {
  it("mostra 'Salvando…' quando a nota existente está sendo salva", () => {
    expect(getSaveStateLabel("saving", true)).toBe("Salvando…")
  })

  it("mostra 'Salva neste dispositivo' quando a nota foi persistida", () => {
    expect(getSaveStateLabel("saved", true)).toBe("Salva neste dispositivo")
  })

  it("mostra 'Rascunho não salvo' para uma nota nova antes da persistência", () => {
    expect(getSaveStateLabel("draft", true)).toBe("Rascunho não salvo")
  })

  it("mostra 'Canvas de leitura' fora do modo de edição", () => {
    expect(getSaveStateLabel("idle", false)).toBe("Canvas de leitura")
  })
})
