import { describe, it, expect } from "vitest"
import {
  buildNavigation,
  referenceLine,
} from "@/features/highlights/components/highlights-master-detail"
import type { AllHighlightEntry } from "@/features/highlights/hooks/use-all-highlights"

function makeEntry(verses: AllHighlightEntry["verses"]): AllHighlightEntry {
  return {
    highlight: {
      id: "h1",
      color: "#facc15",
      content: "Senhor me ensina.",
      categoryId: null,
      noteId: null,
      createdAt: new Date("2026-08-01"),
      updatedAt: new Date("2026-08-20"),
    },
    category: null,
    verses,
    verseItems: verses.map((v) => ({ reference: `${v.book} ${v.chapter}:${v.verse}`, text: "texto" })),
  }
}

const verse = (over: Partial<AllHighlightEntry["verses"][number]>) => ({
  id: "v1",
  highlightId: "h1",
  book: "joao",
  chapter: 3,
  verse: 16,
  bible: "ara",
  ...over,
})

describe("Highlights master-detail - AC-001/AC-007", () => {
  it("buildNavigation preserva livro, capítulo, versículo e versão", () => {
    const nav = buildNavigation(verse({}))
    expect(nav).toMatchObject({ book: "joao", chapter: 3, verse: 16, version: "ara" })
    expect(nav.href).toContain("book=joao&chapter=3&verse=16")
  })

  it("buildNavigation codifica o livro com espaços", () => {
    const nav = buildNavigation(verse({ book: "1 sm" }))
    expect(nav.href).toContain("book=1%20sm")
  })

  it("referenceLine formata intervalo de versículos do mesmo capítulo", () => {
    const entry = makeEntry([verse({ verse: 16 }), verse({ verse: 17 })])
    expect(referenceLine(entry)).toBe("João 3:16-17")
  })

  it("referenceLine formata versículo único", () => {
    const entry = makeEntry([verse({ verse: 16 })])
    expect(referenceLine(entry)).toBe("João 3:16")
  })

  it("referenceLine retorna vazio sem versículos", () => {
    expect(referenceLine(makeEntry([]))).toBe("")
  })

  it("referenceLine lista versículos em capítulos diferentes", () => {
    const entry = makeEntry([verse({ verse: 16 }), verse({ chapter: 4, verse: 1 })])
    expect(referenceLine(entry)).toBe("João 3:16, 4:1")
  })
})
