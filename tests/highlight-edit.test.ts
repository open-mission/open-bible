import { describe, it, expect } from "vitest"
import { createHighlightPatch } from "@/features/highlights/components/highlight-edit-dialog"

describe("Highlights AC-004 editar", () => {
  it("normaliza o patch de cor, categoria e conteúdo", () => {
    expect(createHighlightPatch({ color: "#60a5fa", categoryId: "cat-1", content: "  estudo  " })).toEqual({
      color: "#60a5fa",
      categoryId: "cat-1",
      content: "estudo",
    })
  })
})
