import { BOOK_META, BOOK_ID_TO_INT } from "./book-meta.js"

function normalize(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
}

export interface ParsedRef {
  bookId: string
  chapter: number
  verse?: number
}

const ABBR_TO_ID: Record<string, string> = (() => {
  const m: Record<string, string> = {}
  for (const b of BOOK_META) {
    if (!b) continue
    m[normalize(b.id)] = b.id
    m[normalize(b.abbreviation)] = b.id
    // also add without numbers? already
  }
  // manual alias for jo -> jhn (João) to pass test, but already via abbreviation
  return m
})()

export function parseReference(input: string): ParsedRef | null {
  const norm = normalize(input)
  if (!norm) return null
  // Try to extract book and rest
  // Book can be like "1jo", "gen", "jo", "1 jo" with space? Handle "1 jo 3:16" -> tokens ["1","jo","3:16"]
  // First, try to match longest prefix that is a known book
  const tokens = norm.split(/\s+/)
  // Try joining first 1 or 2 tokens as book
  let bookId: string | null = null
  let restTokens: string[] = []
  for (let i = Math.min(2, tokens.length); i >= 1; i--) {
    const candidate = tokens.slice(0, i).join("")
    // also try with space removed? e.g., "1 jo" -> "1jo"
    const candidateNoSpace = candidate.replace(/\s/g, "")
    const candidate2 = tokens.slice(0, i).join(" ")
    const id1 = ABBR_TO_ID[normalize(candidateNoSpace)]
    const id2 = ABBR_TO_ID[normalize(candidate2)]
    const id = id1 ?? id2
    if (id) {
      bookId = id
      restTokens = tokens.slice(i)
      break
    }
  }
  // If not found, try single token with possible chapter attached like "gn1:1"? unlikely
  // For "gn1:1" split book+chapter without space: try to separate leading letters+digits
  if (!bookId) {
    // Try to match pattern: ^([123]?[a-z]+)(\d.*)$ e.g., "gn1:1" -> book "gn", rest "1:1"
    const m = norm.match(/^([123]?[a-z]+)\s*(\d.*)$/)
    if (m) {
      const cand = normalize(m[1])
      const id = ABBR_TO_ID[cand]
      if (id) {
        bookId = id
        restTokens = [m[2]]
      }
    }
  }
  if (!bookId) return null
  const rest = restTokens.join(" ").trim()
  if (!rest) {
    // No chapter, e.g., just "gen"
    return { bookId, chapter: 1 }
  }
  // rest should be like "1:15", "1 15", "1", "3:16", "3 16"
  const parts = rest.split(/[:\s]+/).filter(Boolean)
  if (parts.length === 0) return null
  const chapter = parseInt(parts[0], 10)
  if (Number.isNaN(chapter) || chapter < 1) return null
  if (parts.length >= 2) {
    const verse = parseInt(parts[1], 10)
    if (Number.isNaN(verse) || verse < 1) return { bookId, chapter }
    return { bookId, chapter, verse }
  }
  return { bookId, chapter }
}
