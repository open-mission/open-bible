import { describe, expect, it } from "vitest"
import {
  buildBookFilterOptions,
  getColorFilterAriaLabel,
} from "@/features/highlights/components/highlights-filter-bar"

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
})
