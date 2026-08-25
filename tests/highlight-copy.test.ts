import { describe, it, expect } from "vitest"
import { formatHighlightReference } from "@/features/highlights/lib/copy"

describe("Highlights AC-006 copiar", () => {
  it("formata referência com Bíblia, intervalo e conteúdo", () => {
    expect(formatHighlightReference({
      verses: [
        { book: "joao", chapter: 3, verse: 16, bible: "ara" },
        { book: "joao", chapter: 3, verse: 17, bible: "ara" },
      ],
      content: "amor",
    })).toBe("João 3:16-17 (ARA) - amor")
  })
})
