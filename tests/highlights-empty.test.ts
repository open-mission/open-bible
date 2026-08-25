import { describe, it, expect } from "vitest"
import { getHighlightEmptyState } from "@/features/highlights/components/all-highlights-browser"

describe("Highlights AC-008 vazio", () => {
  it("mostra CTA para criar no leitor quando não há filtros", () => {
    expect(getHighlightEmptyState(false)).toEqual({
      title: "Nenhum destaque ainda",
      description: "Crie seu primeiro destaque no leitor.",
      showCta: true,
    })
    expect(getHighlightEmptyState(true).showCta).toBe(false)
  })
})
