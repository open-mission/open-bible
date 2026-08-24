const HTML_ENTITY_REPLACEMENTS: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
}

export function normalizeReleaseNotes(notes: string): string {
  if (!notes || !/<\/?[a-z][^>]*>/i.test(notes)) {
    return notes
  }

  return notes
    .replace(/<h[1-6]\b[^>]*>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "\n- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(?:ul|ol|p|div|section|article)\b[^>]*>/gi, "\n")
    .replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&(?:amp|lt|gt|quot|#39|nbsp);/gi, (entity) => {
      return HTML_ENTITY_REPLACEMENTS[entity.toLowerCase()] ?? entity
    })
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim()
}
