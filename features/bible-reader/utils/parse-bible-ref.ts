import type { Book } from "@/lib/types"
import { BOOKS } from "./bible-data"

/**
 * Resultado do parsing de uma referência bíblica rápida.
 */
export interface BibleRefResult {
  book: Book
  chapter: number
}

/**
 * Remove acentos de uma string para comparação normalizada.
 * Ex: "Gênesis" → "genesis"
 */
function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

/**
 * Normaliza uma string para busca: lowercase + remove acentos.
 */
function normalize(str: string): string {
  return removeAccents(str.toLowerCase().trim())
}

/**
 * Regex para separar a parte textual (livro) da parte numérica (capítulo).
 *
 * Aceita:
 *  - "rt 3", "Rt 3", "RT 3"
 *  - "1co 13", "2pe 3" (livros com prefixo numérico)
 *  - "genesis 1", "rute 4" (nome parcial/completo)
 *  - "rt:3", "rt.3" (separadores alternativos)
 *
 * Captura groups:
 *  [1] = parte textual do livro (pode começar com dígito, ex: "1co")
 *  [2] = número do capítulo
 */
const REF_PATTERN = /^(\d?\s*[a-zA-ZÀ-ÿ]+)\s*[:\s.]\s*(\d+)$/

/**
 * Faz o parsing de uma query de busca bíblica e retorna o livro + capítulo
 * quando há um match único e o capítulo é válido.
 *
 * Retorna `null` quando:
 *  - A query não contém um padrão `<livro> <capítulo>`
 *  - A parte textual é ambígua (bate com mais de 1 livro)
 *  - O capítulo está fora do range do livro
 *
 * @example
 * parseBibleRef("rt 3")    // → { book: Rute, chapter: 3 }
 * parseBibleRef("gn 1")    // → { book: Gênesis, chapter: 1 }
 * parseBibleRef("1co 13")  // → { book: 1 Coríntios, chapter: 13 }
 * parseBibleRef("j 1")     // → null (ambíguo: João, Joel, Jonas, ...)
 * parseBibleRef("rt 99")   // → null (Rute só tem 4 capítulos)
 * parseBibleRef("rt")      // → null (sem capítulo)
 */
export function parseBibleRef(query: string): BibleRefResult | null {
  if (!query || !query.trim()) return null

  const match = query.trim().match(REF_PATTERN)
  if (!match) return null

  const textPart = normalize(match[1])
  const chapter = parseInt(match[2], 10)

  if (isNaN(chapter) || chapter < 1) return null

  // 1. Try exact abbreviation match (case-insensitive)
  const exactAbbrevMatches = BOOKS.filter(
    (b) => normalize(b.abbreviation) === textPart
  )
  if (exactAbbrevMatches.length === 1) {
    const book = exactAbbrevMatches[0]
    if (chapter > book.chapters) return null
    return { book, chapter }
  }

  // 2. Try exact name match (normalized, case-insensitive, accent-insensitive)
  const exactNameMatches = BOOKS.filter(
    (b) => normalize(b.name) === textPart
  )
  if (exactNameMatches.length === 1) {
    const book = exactNameMatches[0]
    if (chapter > book.chapters) return null
    return { book, chapter }
  }

  // 3. Try prefix match on abbreviation
  const prefixAbbrevMatches = BOOKS.filter(
    (b) => normalize(b.abbreviation).startsWith(textPart)
  )
  if (prefixAbbrevMatches.length === 1) {
    const book = prefixAbbrevMatches[0]
    if (chapter > book.chapters) return null
    return { book, chapter }
  }

  // 4. Try prefix match on name
  const prefixNameMatches = BOOKS.filter(
    (b) => normalize(b.name).startsWith(textPart)
  )
  if (prefixNameMatches.length === 1) {
    const book = prefixNameMatches[0]
    if (chapter > book.chapters) return null
    return { book, chapter }
  }

  return null
}
