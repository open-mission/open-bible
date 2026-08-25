import {
  bibleReferenceLabel,
  extractBibleReferences,
  isNoteDocument,
  parseNoteContent,
  type NoteDocument,
  type NoteNode,
} from "./note-document"

export function exportMarkdown(json: unknown): string {
  const document = typeof json === "string" ? parseNoteContent(json) : json
  if (!isNoteDocument(document)) return ""
  return renderDocument(document).trim()
}

function renderDocument(document: NoteDocument): string {
  return document.content.map(renderNode).filter(Boolean).join("\n\n")
}

function renderNode(node: NoteNode): string {
  const children = node.content ?? []
  switch (node.type) {
    case "paragraph":
      return renderInline(children)
    case "heading": {
      const level = typeof node.attrs?.level === "number" ? node.attrs.level : 1
      return `${"#".repeat(Math.min(Math.max(level, 1), 6))} ${renderInline(children)}`
    }
    case "bulletList":
      return children.map((item) => `- ${renderListItem(item)}`).join("\n")
    case "orderedList":
      return children.map((item, index) => `${index + 1}. ${renderListItem(item)}`).join("\n")
    case "blockquote":
      return renderDocument({ type: "doc", content: children }).split("\n").map((line) => `> ${line}`).join("\n")
    case "codeBlock":
      return `\`\`\`\n${children.map((child) => child.text ?? "").join("")}\n\`\`\``
    case "horizontalRule":
      return "---"
    case "bibleReference":
      return renderBibleReference(node)
    case "hardBreak":
      return "  \n"
    default:
      return renderInline(children)
  }
}

function renderListItem(node: NoteNode): string {
  return node.content?.map(renderNode).filter(Boolean).join(" ") ?? ""
}

function renderInline(nodes: NoteNode[]): string {
  return nodes.map((node) => {
    if (node.type === "hardBreak") return "  \n"
    if (node.type === "bibleReference") return renderBibleReference(node)
    let text = node.text ?? renderInline(node.content ?? [])
    for (const mark of node.marks ?? []) {
      if (mark.type === "bold") text = `**${text}**`
      if (mark.type === "italic") text = `*${text}*`
      if (mark.type === "highlight") text = `==${text}==`
    }
    return text
  }).join("")
}

function renderBibleReference(node: NoteNode): string {
  const references = extractBibleReferences({ type: "doc", content: [node] })
  const reference = references[0]
  if (!reference) return ""
  const verse = reference.verseEnd && reference.verseEnd !== reference.verseStart
    ? `${reference.verseStart}-${reference.verseEnd}`
    : String(reference.verseStart)
  return `[${bibleReferenceLabel(reference)}](bible://${reference.bible}/${reference.book}/${reference.chapter}/${verse})`
}

export default exportMarkdown
