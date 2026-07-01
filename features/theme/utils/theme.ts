// All shadcn/ui named color presets mapped to their CSS custom property overrides.
// Only --primary, --primary-foreground, --ring, and --chart-1 change per color;
// the rest of the palette comes from the neutral base defined in globals.css.
// Values sourced from the official shadcn/ui themes registry.

export type ThemeColor =
  | "neutral"
  | "amber"
  | "blue"
  | "cyan"
  | "emerald"
  | "fuchsia"
  | "green"
  | "indigo"
  | "lime"
  | "orange"
  | "pink"
  | "rose"
  | "violet"
  | "yellow"
  | "zinc"

export type ThemeMode = "light" | "dark" | "system"
export type ThemePalette = "default" | "dracula" | "gruvbox"

export interface ThemeConfig {
  palette: ThemePalette
  color: ThemeColor
  mode: ThemeMode
}

// Human-readable label for each color
export const COLOR_LABELS: Record<ThemeColor, string> = {
  neutral:  "Neutral",
  amber:    "Amber",
  blue:     "Blue",
  cyan:     "Cyan",
  emerald:  "Emerald",
  fuchsia:  "Fuchsia",
  green:    "Green",
  indigo:   "Indigo",
  lime:     "Lime",
  orange:   "Orange",
  pink:     "Pink",
  rose:     "Rose",
  violet:   "Violet",
  yellow:   "Yellow",
  zinc:     "Zinc",
}

// Swatch hex previews (approximate, for the color picker UI)
export const COLOR_SWATCHES: Record<ThemeColor, string> = {
  neutral:  "#737373",
  amber:    "#f59e0b",
  blue:     "#3b82f6",
  cyan:     "#06b6d4",
  emerald:  "#10b981",
  fuchsia:  "#d946ef",
  green:    "#22c55e",
  indigo:   "#6366f1",
  lime:     "#84cc16",
  orange:   "#f97316",
  pink:     "#ec4899",
  rose:     "#f43f5e",
  violet:   "#8b5cf6",
  yellow:   "#eab308",
  zinc:     "#71717a",
}

// CSS variable overrides applied as [data-color="..."] on <html>
// These only patch the color-sensitive tokens; everything else inherits the base.
export const COLOR_VARS: Record<ThemeColor, { light: Record<string, string>; dark: Record<string, string> }> = {
  neutral: {
    light: {
      "--primary": "oklch(0.205 0 0)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.708 0 0)",
    },
    dark: {
      "--primary": "oklch(0.922 0 0)",
      "--primary-foreground": "oklch(0.205 0 0)",
      "--ring": "oklch(0.556 0 0)",
    },
  },
  amber: {
    light: {
      "--primary": "oklch(0.769 0.188 70.08)",
      "--primary-foreground": "oklch(0.145 0 0)",
      "--ring": "oklch(0.769 0.188 70.08)",
    },
    dark: {
      "--primary": "oklch(0.769 0.188 70.08)",
      "--primary-foreground": "oklch(0.145 0 0)",
      "--ring": "oklch(0.769 0.188 70.08)",
    },
  },
  blue: {
    light: {
      "--primary": "oklch(0.546 0.245 264.376)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.546 0.245 264.376)",
    },
    dark: {
      "--primary": "oklch(0.546 0.245 264.376)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.546 0.245 264.376)",
    },
  },
  cyan: {
    light: {
      "--primary": "oklch(0.609 0.149 212.574)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.609 0.149 212.574)",
    },
    dark: {
      "--primary": "oklch(0.609 0.149 212.574)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.609 0.149 212.574)",
    },
  },
  emerald: {
    light: {
      "--primary": "oklch(0.535 0.154 150.069)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.535 0.154 150.069)",
    },
    dark: {
      "--primary": "oklch(0.535 0.154 150.069)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.535 0.154 150.069)",
    },
  },
  fuchsia: {
    light: {
      "--primary": "oklch(0.667 0.295 322.15)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.667 0.295 322.15)",
    },
    dark: {
      "--primary": "oklch(0.667 0.295 322.15)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.667 0.295 322.15)",
    },
  },
  green: {
    light: {
      "--primary": "oklch(0.527 0.154 150.069)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.527 0.154 150.069)",
    },
    dark: {
      "--primary": "oklch(0.696 0.17 162.48)",
      "--primary-foreground": "oklch(0.145 0 0)",
      "--ring": "oklch(0.527 0.154 150.069)",
    },
  },
  indigo: {
    light: {
      "--primary": "oklch(0.585 0.233 277.117)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.585 0.233 277.117)",
    },
    dark: {
      "--primary": "oklch(0.585 0.233 277.117)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.585 0.233 277.117)",
    },
  },
  lime: {
    light: {
      "--primary": "oklch(0.768 0.233 130.85)",
      "--primary-foreground": "oklch(0.145 0 0)",
      "--ring": "oklch(0.768 0.233 130.85)",
    },
    dark: {
      "--primary": "oklch(0.768 0.233 130.85)",
      "--primary-foreground": "oklch(0.145 0 0)",
      "--ring": "oklch(0.768 0.233 130.85)",
    },
  },
  orange: {
    light: {
      "--primary": "oklch(0.646 0.222 41.116)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.646 0.222 41.116)",
    },
    dark: {
      "--primary": "oklch(0.646 0.222 41.116)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.646 0.222 41.116)",
    },
  },
  pink: {
    light: {
      "--primary": "oklch(0.656 0.241 354.308)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.656 0.241 354.308)",
    },
    dark: {
      "--primary": "oklch(0.656 0.241 354.308)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.656 0.241 354.308)",
    },
  },
  rose: {
    light: {
      "--primary": "oklch(0.645 0.246 16.439)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.645 0.246 16.439)",
    },
    dark: {
      "--primary": "oklch(0.645 0.246 16.439)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.645 0.246 16.439)",
    },
  },
  violet: {
    light: {
      "--primary": "oklch(0.606 0.25 292.717)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.606 0.25 292.717)",
    },
    dark: {
      "--primary": "oklch(0.606 0.25 292.717)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.606 0.25 292.717)",
    },
  },
  yellow: {
    light: {
      "--primary": "oklch(0.795 0.184 86.047)",
      "--primary-foreground": "oklch(0.145 0 0)",
      "--ring": "oklch(0.795 0.184 86.047)",
    },
    dark: {
      "--primary": "oklch(0.795 0.184 86.047)",
      "--primary-foreground": "oklch(0.145 0 0)",
      "--ring": "oklch(0.795 0.184 86.047)",
    },
  },
  zinc: {
    light: {
      "--primary": "oklch(0.442 0.017 285.786)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--ring": "oklch(0.442 0.017 285.786)",
    },
    dark: {
      "--primary": "oklch(0.985 0 0)",
      "--primary-foreground": "oklch(0.145 0 0)",
      "--ring": "oklch(0.708 0 0)",
    },
  },
}

export const THEME_STORAGE_KEY = "openbible:theme"

export function loadThemeConfig(): ThemeConfig {
  if (typeof window === "undefined") return { palette: "default", color: "neutral", mode: "system" }
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        palette: parsed.palette || "default",
        color: parsed.color || "neutral",
        mode: parsed.mode || "system"
      }
    }
  } catch { /* ignore */ }
  return { palette: "default", color: "neutral", mode: "system" }
}

export function saveThemeConfig(config: ThemeConfig): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config))
  } catch { /* ignore */ }
}
