import { describe, expect, it } from "vitest"
import {
  buildBookFilterOptions,
  getBibleVersionName,
  getColorFilterAriaLabel,
} from "@/features/highlights/components/highlights-filter-bar"
import { getNeonStyle } from "@/features/highlights/utils/highlight-colors"

// SPECSFY: US-001 FR-002 NFR-002 AC-002 AC-010
describe("Highlights AC-002 filtro visual", () => {
  it("usa o nome completo do livro como rótulo visual do filtro", () => {
    expect(
      buildBookFilterOptions([
        { book: "joao" },
        { book: "gn" },
        { book: "joao" },
      ]),
    ).toEqual([
      { value: "gn", label: "Gênesis" },
      { value: "joao", label: "João" },
    ])
  })

  it("mantém o nome da cor somente como descrição acessível", () => {
    expect(getColorFilterAriaLabel("#eab308")).toBe("Cor amarela")
  })

  it("exibe nome completo da versão no lugar do ID", () => {
    expect(getBibleVersionName("ara")).toBe("Almeida Revista e Atualizada")
  })

  it("mantém a cor como marcador sem glow", () => {
    expect(getNeonStyle("#eab308").glow).toBe("none")
  })
})
