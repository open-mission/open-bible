import { describe, it, expect } from "vitest"
import { parseBibleRef } from "../features/bible-reader/utils/parse-bible-ref"

describe("parseBibleRef", () => {
  describe("returns null for invalid inputs", () => {
    it("returns null for empty string", () => {
      expect(parseBibleRef("")).toBeNull()
    })

    it("returns null for whitespace only", () => {
      expect(parseBibleRef("   ")).toBeNull()
    })

    it("returns null for query without chapter number", () => {
      expect(parseBibleRef("rt")).toBeNull()
    })

    it("returns null for only a number", () => {
      expect(parseBibleRef("3")).toBeNull()
    })
  })

  describe("exact abbreviation match", () => {
    it("matches 'rt 3' → Rute 3", () => {
      const result = parseBibleRef("rt 3")
      expect(result).not.toBeNull()
      expect(result!.book.id).toBe("rut")
      expect(result!.chapter).toBe(3)
    })

    it("matches 'gn 1' → Gênesis 1", () => {
      const result = parseBibleRef("gn 1")
      expect(result).not.toBeNull()
      expect(result!.book.id).toBe("gen")
      expect(result!.chapter).toBe(1)
    })

    it("matches 'sl 23' → Salmos 23", () => {
      const result = parseBibleRef("sl 23")
      expect(result).not.toBeNull()
      expect(result!.book.id).toBe("psa")
      expect(result!.chapter).toBe(23)
    })

    it("matches 'ap 22' → Apocalipse 22", () => {
      const result = parseBibleRef("ap 22")
      expect(result).not.toBeNull()
      expect(result!.book.id).toBe("rev")
      expect(result!.chapter).toBe(22)
    })
  })

  describe("case-insensitive matching", () => {
    it("matches 'RT 3' (uppercase)", () => {
      const result = parseBibleRef("RT 3")
      expect(result).not.toBeNull()
      expect(result!.book.id).toBe("rut")
      expect(result!.chapter).toBe(3)
    })

    it("matches 'Rt 3' (mixed case)", () => {
      const result = parseBibleRef("Rt 3")
      expect(result).not.toBeNull()
      expect(result!.book.id).toBe("rut")
      expect(result!.chapter).toBe(3)
    })

    it("matches 'GN 50' (uppercase)", () => {
      const result = parseBibleRef("GN 50")
      expect(result).not.toBeNull()
      expect(result!.book.id).toBe("gen")
      expect(result!.chapter).toBe(50)
    })
  })

  describe("books with numeric prefix", () => {
    it("matches '1co 13' → 1 Coríntios 13", () => {
      const result = parseBibleRef("1co 13")
      expect(result).not.toBeNull()
      expect(result!.book.id).toBe("1co")
      expect(result!.chapter).toBe(13)
    })

    it("matches '2pe 3' → 2 Pedro 3", () => {
      const result = parseBibleRef("2pe 3")
      expect(result).not.toBeNull()
      expect(result!.book.id).toBe("2pe")
      expect(result!.chapter).toBe(3)
    })

    it("matches '1sm 31' → 1 Samuel 31", () => {
      const result = parseBibleRef("1sm 31")
      expect(result).not.toBeNull()
      expect(result!.book.id).toBe("1sa")
      expect(result!.chapter).toBe(31)
    })

    it("matches '2rs 25' → 2 Reis 25", () => {
      const result = parseBibleRef("2rs 25")
      expect(result).not.toBeNull()
      expect(result!.book.id).toBe("2ki")
      expect(result!.chapter).toBe(25)
    })

    it("matches '1jo 5' → 1 João 5", () => {
      const result = parseBibleRef("1jo 5")
      expect(result).not.toBeNull()
      expect(result!.book.id).toBe("1jo")
      expect(result!.chapter).toBe(5)
    })
  })

  describe("name matching (accent-insensitive)", () => {
    it("matches 'genesis 1' → Gênesis 1 (no accent)", () => {
      const result = parseBibleRef("genesis 1")
      expect(result).not.toBeNull()
      expect(result!.book.id).toBe("gen")
      expect(result!.chapter).toBe(1)
    })

    it("matches 'rute 4' → Rute 4 (full name)", () => {
      const result = parseBibleRef("rute 4")
      expect(result).not.toBeNull()
      expect(result!.book.id).toBe("rut")
      expect(result!.chapter).toBe(4)
    })

    it("matches 'Gênesis 50' → Gênesis 50 (with accent)", () => {
      const result = parseBibleRef("Gênesis 50")
      expect(result).not.toBeNull()
      expect(result!.book.id).toBe("gen")
      expect(result!.chapter).toBe(50)
    })

    it("matches 'apocalipse 1' → Apocalipse 1", () => {
      const result = parseBibleRef("apocalipse 1")
      expect(result).not.toBeNull()
      expect(result!.book.id).toBe("rev")
      expect(result!.chapter).toBe(1)
    })
  })

  describe("alternative separators", () => {
    it("matches 'rt:3' (colon)", () => {
      const result = parseBibleRef("rt:3")
      expect(result).not.toBeNull()
      expect(result!.book.id).toBe("rut")
      expect(result!.chapter).toBe(3)
    })

    it("matches 'rt.3' (dot)", () => {
      const result = parseBibleRef("rt.3")
      expect(result).not.toBeNull()
      expect(result!.book.id).toBe("rut")
      expect(result!.chapter).toBe(3)
    })

    it("matches 'gn:1' (colon)", () => {
      const result = parseBibleRef("gn:1")
      expect(result).not.toBeNull()
      expect(result!.book.id).toBe("gen")
      expect(result!.chapter).toBe(1)
    })

    it("matches 'sl.23' (dot)", () => {
      const result = parseBibleRef("sl.23")
      expect(result).not.toBeNull()
      expect(result!.book.id).toBe("psa")
      expect(result!.chapter).toBe(23)
    })
  })

  describe("invalid chapter numbers", () => {
    it("returns null for chapter exceeding book total ('rt 99')", () => {
      expect(parseBibleRef("rt 99")).toBeNull()
    })

    it("returns null for chapter 0", () => {
      expect(parseBibleRef("rt 0")).toBeNull()
    })

    it("returns null for Gênesis chapter 51 (max is 50)", () => {
      expect(parseBibleRef("gn 51")).toBeNull()
    })
  })

  describe("ambiguous queries", () => {
    it("returns null for 'j 1' (João, Joel, Jonas, Josué, Juízes, Judas)", () => {
      expect(parseBibleRef("j 1")).toBeNull()
    })

    it("returns null when text matches multiple books by name prefix", () => {
      // "e" could match Êxodo, Esdras, Ester, Eclesiastes, Ezequiel, Efésios
      expect(parseBibleRef("e 1")).toBeNull()
    })
  })

  describe("edge cases", () => {
    it("handles extra whitespace", () => {
      const result = parseBibleRef("  rt   3  ")
      expect(result).not.toBeNull()
      expect(result!.book.id).toBe("rut")
      expect(result!.chapter).toBe(3)
    })

    it("matches single-chapter book ('ob 1' → Obadias 1)", () => {
      const result = parseBibleRef("ob 1")
      expect(result).not.toBeNull()
      expect(result!.book.id).toBe("oba")
      expect(result!.chapter).toBe(1)
    })

    it("rejects single-chapter book with chapter 2 ('ob 2')", () => {
      expect(parseBibleRef("ob 2")).toBeNull()
    })

    it("matches 'dt 34' → Deuteronômio 34 (last chapter)", () => {
      const result = parseBibleRef("dt 34")
      expect(result).not.toBeNull()
      expect(result!.book.id).toBe("deu")
      expect(result!.chapter).toBe(34)
    })

    it("matches 'sl 150' → Salmos 150 (max chapters)", () => {
      const result = parseBibleRef("sl 150")
      expect(result).not.toBeNull()
      expect(result!.book.id).toBe("psa")
      expect(result!.chapter).toBe(150)
    })
  })
})
