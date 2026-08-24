import type { Book } from "@/lib/types"
import { parseReference } from "@open-bible/domain-bible"
import { BOOKS } from "./bible-data"

export interface BibleRefResult {
  book: Book
  chapter: number
}

export function parseBibleRef(query: string): BibleRefResult | null {
  return parseReference(query, BOOKS)
}
