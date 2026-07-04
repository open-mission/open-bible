export const HIGHLIGHT_COLORS = {
  amber: "var(--highlight-amber)",
  green: "var(--highlight-green)",
  blue: "var(--highlight-blue)",
  rose: "var(--highlight-rose)",
} as const

export type HighlightColorKey = keyof typeof HIGHLIGHT_COLORS
export type HighlightColor = HighlightColorKey | string

export const PREDEFINED_COLORS: HighlightColorKey[] = ["amber", "green", "blue", "rose"]

export function getColorValue(color: HighlightColor): string {
  if (color in HIGHLIGHT_COLORS) {
    return HIGHLIGHT_COLORS[color as HighlightColorKey]
  }
  // Custom hex color — validate and return
  if (/^#[0-9a-fA-F]{3,8}$/.test(color)) {
    return color
  }
  return HIGHLIGHT_COLORS.amber
}

export function isPredefinedColor(color: string): color is HighlightColorKey {
  return color in HIGHLIGHT_COLORS
}
