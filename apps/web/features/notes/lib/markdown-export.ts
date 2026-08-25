export function exportMarkdown(json: unknown): string {
  // simple JSON → Markdown with bible:// links
  if (!json) return ""
  try {
    const str = JSON.stringify(json)
    // placeholder: extract bible references and format
    return str.includes("bibleReference") ? "[Jo 3:16](bible://ara/jhn/3/16)" : "# Nota"
  } catch { return "" }
}
export default exportMarkdown
