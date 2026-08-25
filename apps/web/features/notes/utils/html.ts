import { bibleReferenceLabel, extractBibleReferences, parseNoteContent, type NoteNode } from "../lib/note-document"

/** Strip HTML tags for search/empty checks only — never for display. */
export function stripHtml(html?: string | null): string {
  if (!html) return ""
  const document = parseNoteContent(html)
  if (typeof document !== "string") return stripDocument(document.content)
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function stripDocument(nodes: NoteNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === "bibleReference") {
        const reference = extractBibleReferences({ type: "doc", content: [node] })[0]
        return reference ? bibleReferenceLabel(reference) : ""
      }
      return node.text ?? stripDocument(node.content ?? [])
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
}

export function isEmptyHtml(html?: string | null): boolean {
  return stripHtml(html).length === 0
}
