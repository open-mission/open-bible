/** Strip HTML tags for search/empty checks only — never for display. */
export function stripHtml(html?: string | null): string {
  if (!html) return ""
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function isEmptyHtml(html?: string | null): boolean {
  return stripHtml(html).length === 0
}
