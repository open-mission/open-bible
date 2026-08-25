import { describe, it, expect } from "vitest"
import { buildHighlightNavigation } from "@/features/highlights/components/all-highlights-browser"

describe("Highlights AC-007 navegar", () => {
  it("gera a rota do leitor com livro, capítulo e versículo", () => {
    expect(buildHighlightNavigation({ id: "v1", highlightId: "h1", book: "joao", chapter: 3, verse: 16, bible: "ara" })).toEqual({
      book: "joao",
      chapter: 3,
      version: "ara",
      href: "/?book=joao&chapter=3&verse=16",
    })
  })
})
