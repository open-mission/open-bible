export interface NeonColor {
  name: string
  hex: string
}

export type HighlightColor = string

export const neonColors: NeonColor[] = [
  { name: "Emerald", hex: "#34d399" },
  { name: "Green", hex: "#22c55e" },
  { name: "Lime", hex: "#a3e635" },
  { name: "Chartreuse", hex: "#b6ff3d" },
  { name: "Spring", hex: "#3dff88" },
  { name: "Mint", hex: "#4ade80" },
  { name: "Seafoam", hex: "#5affc2" },
  { name: "Teal", hex: "#2dd4bf" },
  { name: "Turquoise", hex: "#14e0c2" },
  { name: "Aqua", hex: "#2ee6d6" },
  { name: "Cyan", hex: "#22d3ee" },
  { name: "Ice", hex: "#7fdcff" },
  { name: "Sky", hex: "#38bdf8" },
  { name: "Electric", hex: "#0ea5e9" },
  { name: "Azure", hex: "#4da3ff" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Cobalt", hex: "#4361ee" },
  { name: "Ultramarine", hex: "#5566ff" },
  { name: "Periwinkle", hex: "#8f9bff" },
  { name: "Indigo", hex: "#6366f1" },
  { name: "Lavender", hex: "#b39dff" },
  { name: "Violet", hex: "#8b5cf6" },
  { name: "Purple", hex: "#a855f7" },
  { name: "Fuchsia", hex: "#d946ef" },
  { name: "Magenta", hex: "#ff4dd8" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Hot Pink", hex: "#ff2d9b" },
  { name: "Rose", hex: "#fb7185" },
  { name: "Crimson", hex: "#ff3b5c" },
  { name: "Red", hex: "#ef4444" },
  { name: "Coral", hex: "#ff6b6b" },
  { name: "Orange", hex: "#f97316" },
  { name: "Tangerine", hex: "#ff8c42" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Gold", hex: "#ffd21f" },
  { name: "Yellow", hex: "#eab308" },
]

export const defaultNeonColors: NeonColor[] = [
  { name: "Emerald", hex: "#34d399" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Violet", hex: "#8b5cf6" },
  { name: "Rose", hex: "#fb7185" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Cyan", hex: "#22d3ee" },
]

export interface NeonStyle {
  hex: string
  glow: string
  pillBg: string
  pillText: string
  pillRing: string
}

export function getNeonStyle(hex: string): NeonStyle {
  // Validate format and fallback
  let cleanHex = hex.toLowerCase()
  if (!cleanHex.startsWith("#")) {
    // Check if it matches a named predefined color from old implementation
    if (cleanHex === "emerald" || cleanHex === "green") cleanHex = "#34d399"
    else if (cleanHex === "blue") cleanHex = "#3b82f6"
    else if (cleanHex === "violet" || cleanHex === "purple") cleanHex = "#8b5cf6"
    else if (cleanHex === "rose" || cleanHex === "red") cleanHex = "#fb7185"
    else if (cleanHex === "amber" || cleanHex === "yellow") cleanHex = "#f59e0b"
    else if (cleanHex === "cyan" || cleanHex === "sky") cleanHex = "#22d3ee"
    else cleanHex = "#34d399" // fallback to emerald
  }

  // Combine inset border shadow and outer glow shadow for the pill:
  // 1a = 10% alpha (background)
  // 33 = 20% alpha (inset border ring)
  // 40 = 25% alpha (glow shadow for pill)
  // 66 = 40% alpha (glow shadow for solid dot)
  return {
    hex: cleanHex,
    glow: `0 0 12px 2.5px ${cleanHex}66`,
    pillBg: `${cleanHex}1a`,
    pillText: cleanHex,
    pillRing: `inset 0 0 0 1px ${cleanHex}33, 0 0 8px 1px ${cleanHex}40`,
  }
}

export function getColorName(hex: string): string {
  const match = neonColors.find((c) => c.hex.toLowerCase() === hex.toLowerCase())
  return match ? match.name : "Destaque"
}

export function getContrastColor(hex: string): "#ffffff" | "#000000" {
  let cleanHex = hex.replace("#", "")
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map((c) => c + c).join("")
  }
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)
  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b))
  return hsp > 175 ? "#000000" : "#ffffff"
}
