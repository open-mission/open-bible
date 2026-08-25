export interface NoteNode {
  type: string
  attrs?: Record<string, unknown>
  content?: NoteNode[]
  text?: string
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>
}

export interface NoteDocument {
  type: "doc"
  content: NoteNode[]
}

export interface BibleReferenceAttributes {
  bible: string
  book: string
  chapter: number
  verseStart: number
  verseEnd: number | null
}

export interface SlashItem {
  id: string
  label: string
  description: string
}

export const NOTE_PLACEHOLDER = "Escreva / para comandos"

export const BUBBLE_ACTIONS = ["bold", "italic", "highlight"] as const

const SLASH_ITEMS: SlashItem[] = [
  { id: "paragraph", label: "Parágrafo", description: "Texto simples" },
  { id: "heading", label: "Título", description: "Título de seção" },
  { id: "bulletList", label: "Lista", description: "Lista com marcadores" },
  { id: "orderedList", label: "Lista numerada", description: "Lista ordenada" },
  { id: "blockquote", label: "Citação", description: "Citação em destaque" },
  { id: "codeBlock", label: "Código", description: "Bloco de código" },
  { id: "horizontalRule", label: "Divisor", description: "Linha horizontal" },
  { id: "bibleReference", label: "Referência bíblica", description: "Versículo com prévia" },
]

export function createEmptyNoteDocument(): NoteDocument {
  return { type: "doc", content: [{ type: "paragraph" }] }
}

export function isNoteDocument(value: unknown): value is NoteDocument {
  if (!isRecord(value) || value.type !== "doc" || !Array.isArray(value.content)) return false
  return value.content.every((node) => isRecord(node) && typeof node.type === "string")
}

export function parseNoteContent(content: string | null | undefined): NoteDocument | string {
  if (!content) return createEmptyNoteDocument()
  try {
    const parsed: unknown = JSON.parse(content)
    return isNoteDocument(parsed) ? parsed : content
  } catch {
    return content
  }
}

export function getSlashItems(query: string): SlashItem[] {
  const normalized = query.trim().toLocaleLowerCase("pt-BR")
  if (!normalized) return SLASH_ITEMS
  return SLASH_ITEMS.filter((item) =>
    `${item.label} ${item.description}`.toLocaleLowerCase("pt-BR").includes(normalized),
  )
}

export function buildBibleReferenceDocument(attributes: BibleReferenceAttributes): NoteDocument {
  return {
    type: "doc",
    content: [{ type: "bibleReference", attrs: { ...attributes } }],
  }
}

export function extractBibleReferences(document: unknown): BibleReferenceAttributes[] {
  const parsed = typeof document === "string" ? parseNoteContent(document) : document
  const nodes = isNoteDocument(parsed) ? parsed.content : []
  const references: BibleReferenceAttributes[] = []

  function visit(node: NoteNode) {
    if (node.type === "bibleReference" && isBibleReferenceAttributes(node.attrs)) {
      references.push(node.attrs)
    }
    node.content?.forEach(visit)
  }

  nodes.forEach(visit)
  return references
}

export function bibleReferenceHref(reference: BibleReferenceAttributes): string {
  const params = new URLSearchParams({
    book: reference.book,
    chapter: String(reference.chapter),
    verse: String(reference.verseStart),
  })
  return `/?${params.toString()}`
}

export function bibleReferenceLabel(reference: BibleReferenceAttributes): string {
  const book = BOOK_LABELS[reference.book] ?? reference.book.toUpperCase()
  const verse = reference.verseEnd && reference.verseEnd !== reference.verseStart
    ? `${reference.verseStart}-${reference.verseEnd}`
    : String(reference.verseStart)
  return `${book} ${reference.chapter}:${verse}`
}

export function formatMissingBibleMessage(bible: string): string {
  return `Instale ${bible.toUpperCase()} para ver o texto.`
}

export type NotesViewState = "loading" | "error" | "empty" | "ready"

export function getNotesViewState(input: {
  loading: boolean
  error: string | null
  count: number
}): NotesViewState {
  if (input.loading) return "loading"
  if (input.error) return "error"
  return input.count === 0 ? "empty" : "ready"
}

function isBibleReferenceAttributes(
  value: unknown,
): value is BibleReferenceAttributes {
  if (!isRecord(value)) return false
  return Boolean(
    value &&
    typeof value.bible === "string" &&
    typeof value.book === "string" &&
    typeof value.chapter === "number" &&
    typeof value.verseStart === "number" &&
    (value.verseEnd === null || typeof value.verseEnd === "number"),
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

const BOOK_LABELS: Record<string, string> = {
  gn: "Gn",
  ex: "Êx",
  sl: "Sl",
  pv: "Pv",
  is: "Is",
  mt: "Mt",
  mc: "Mc",
  lc: "Lc",
  jhn: "Jo",
  at: "At",
  rm: "Rm",
  rom: "Rm",
  "1co": "1Co",
  "2co": "2Co",
  gl: "Gl",
  ef: "Ef",
  fp: "Fp",
  cl: "Cl",
  hb: "Hb",
  tg: "Tg",
  ap: "Ap",
}
