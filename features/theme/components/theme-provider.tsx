"use client"

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import {
  type ThemeColor,
  type ThemeMode,
  type ThemePalette,
  COLOR_VARS,
  loadThemeConfig,
  saveThemeConfig,
} from "@/features/theme/utils/theme"

// ─── Theme mode context (replaces next-themes) ────────────────────────────────

const STORAGE_KEY = "openbible:mode"

interface ThemeModeContextValue {
  theme: string | undefined
  setTheme: (theme: string) => void
  resolvedTheme: string | undefined
}

const ThemeModeContext = createContext<ThemeModeContextValue>({
  theme: undefined,
  setTheme: () => {},
  resolvedTheme: undefined,
})

function getSystemTheme(): "dark" | "light" {
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

const LIGHT_VARS: Record<string, string> = {
  "--background": "oklch(1 0 0)",
  "--foreground": "oklch(0.145 0 0)",
  "--card": "oklch(1 0 0)",
  "--card-foreground": "oklch(0.145 0 0)",
  "--popover": "oklch(1 0 0)",
  "--popover-foreground": "oklch(0.145 0 0)",
  "--secondary": "oklch(0.97 0 0)",
  "--secondary-foreground": "oklch(0.205 0 0)",
  "--muted": "oklch(0.97 0 0)",
  "--muted-foreground": "oklch(0.556 0 0)",
  "--accent": "oklch(0.97 0 0)",
  "--accent-foreground": "oklch(0.205 0 0)",
  "--border": "oklch(0.922 0 0)",
  "--input": "oklch(0.922 0 0)",
  "--sidebar": "oklch(0.985 0 0)",
  "--sidebar-foreground": "oklch(0.145 0 0)",
  "--sidebar-accent": "oklch(0.97 0 0)",
  "--sidebar-accent-foreground": "oklch(0.205 0 0)",
  "--sidebar-border": "oklch(0.922 0 0)",
  "--sidebar-ring": "oklch(0.708 0 0)",
  "--highlight-amber": "oklch(0.88 0.12 80)",
  "--highlight-green": "oklch(0.87 0.1 150)",
  "--highlight-blue": "oklch(0.86 0.09 230)",
  "--highlight-rose": "oklch(0.88 0.1 10)",
}

const DARK_VARS: Record<string, string> = {
  "--background": "oklch(0.145 0 0)",
  "--foreground": "oklch(0.985 0 0)",
  "--card": "oklch(0.205 0 0)",
  "--card-foreground": "oklch(0.985 0 0)",
  "--popover": "oklch(0.205 0 0)",
  "--popover-foreground": "oklch(0.985 0 0)",
  "--secondary": "oklch(0.269 0 0)",
  "--secondary-foreground": "oklch(0.985 0 0)",
  "--muted": "oklch(0.269 0 0)",
  "--muted-foreground": "oklch(0.708 0 0)",
  "--accent": "oklch(0.269 0 0)",
  "--accent-foreground": "oklch(0.985 0 0)",
  "--border": "oklch(1 0 0 / 10%)",
  "--input": "oklch(1 0 0 / 15%)",
  "--sidebar": "oklch(0.205 0 0)",
  "--sidebar-foreground": "oklch(0.985 0 0)",
  "--sidebar-accent": "oklch(0.269 0 0)",
  "--sidebar-accent-foreground": "oklch(0.985 0 0)",
  "--sidebar-border": "oklch(1 0 0 / 10%)",
  "--sidebar-ring": "oklch(0.556 0 0)",
  "--highlight-amber": "oklch(0.70 0.12 75)",
  "--highlight-green": "oklch(0.65 0.1 145)",
  "--highlight-blue": "oklch(0.65 0.1 225)",
  "--highlight-rose": "oklch(0.68 0.1 15)",
}

const DRACULA_VARS: Record<string, string> = {
  "--background": "oklch(0.25 0.02 280)", // #282a36
  "--foreground": "oklch(0.97 0.01 100)", // #f8f8f2
  "--card": "oklch(0.21 0.02 280)", // #21222c
  "--card-foreground": "oklch(0.97 0.01 100)",
  "--popover": "oklch(0.21 0.02 280)", // #21222c
  "--popover-foreground": "oklch(0.97 0.01 100)",
  "--primary": "oklch(0.70 0.16 300)", // #bd93f9
  "--primary-foreground": "oklch(0.20 0.02 280)", // #282a36
  "--secondary": "oklch(0.35 0.03 280)", // #44475a
  "--secondary-foreground": "oklch(0.97 0.01 100)",
  "--muted": "oklch(0.28 0.02 280)", // #343746
  "--muted-foreground": "oklch(0.55 0.08 260)", // #6272a4
  "--accent": "oklch(0.35 0.03 280)", // #44475a
  "--accent-foreground": "oklch(0.97 0.01 100)",
  "--border": "oklch(0.35 0.03 280)", // #44475a
  "--input": "oklch(0.35 0.03 280)",
  "--ring": "oklch(0.70 0.16 300)",
  "--sidebar": "oklch(0.21 0.02 280)",
  "--sidebar-foreground": "oklch(0.97 0.01 100)",
  "--sidebar-accent": "oklch(0.35 0.03 280)",
  "--sidebar-accent-foreground": "oklch(0.97 0.01 100)",
  "--sidebar-border": "oklch(0.35 0.03 280)",
  "--sidebar-ring": "oklch(0.70 0.16 300)",
  "--highlight-amber": "oklch(0.85 0.15 80)",
  "--highlight-green": "oklch(0.85 0.15 140)",
  "--highlight-blue": "oklch(0.85 0.15 240)",
  "--highlight-rose": "oklch(0.85 0.15 15)",
}

const GRUVBOX_DARK_VARS: Record<string, string> = {
  "--background": "oklch(0.28 0.01 50)", // #282828
  "--foreground": "oklch(0.89 0.06 80)", // #ebdbb2
  "--card": "oklch(0.34 0.02 60)", // #3c3836
  "--card-foreground": "oklch(0.89 0.06 80)",
  "--popover": "oklch(0.34 0.02 60)", // #3c3836
  "--popover-foreground": "oklch(0.89 0.06 80)",
  "--primary": "oklch(0.79 0.14 85)", // #fabd2f (yellow)
  "--primary-foreground": "oklch(0.28 0.01 50)",
  "--secondary": "oklch(0.40 0.02 60)", // #504945
  "--secondary-foreground": "oklch(0.89 0.06 80)",
  "--muted": "oklch(0.31 0.01 50)", // #32302f
  "--muted-foreground": "oklch(0.70 0.04 70)", // #a89984
  "--accent": "oklch(0.40 0.02 60)", // #504945
  "--accent-foreground": "oklch(0.89 0.06 80)",
  "--border": "oklch(0.40 0.02 60)", // #504945
  "--input": "oklch(0.40 0.02 60)",
  "--ring": "oklch(0.79 0.14 85)",
  "--sidebar": "oklch(0.24 0.01 50)", // #1d2021
  "--sidebar-foreground": "oklch(0.89 0.06 80)",
  "--sidebar-accent": "oklch(0.34 0.02 60)",
  "--sidebar-accent-foreground": "oklch(0.89 0.06 80)",
  "--sidebar-border": "oklch(0.34 0.02 60)",
  "--sidebar-ring": "oklch(0.79 0.14 85)",
  "--highlight-amber": "oklch(0.80 0.10 80)",
  "--highlight-green": "oklch(0.75 0.10 145)",
  "--highlight-blue": "oklch(0.75 0.10 225)",
  "--highlight-rose": "oklch(0.75 0.10 15)",
}

const GRUVBOX_LIGHT_VARS: Record<string, string> = {
  "--background": "oklch(0.96 0.05 85)", // #fbf1c7
  "--foreground": "oklch(0.34 0.02 60)", // #3c3836
  "--card": "oklch(0.98 0.04 85)", // #f9f5d7
  "--card-foreground": "oklch(0.34 0.02 60)",
  "--popover": "oklch(0.98 0.04 85)", // #f9f5d7
  "--popover-foreground": "oklch(0.34 0.02 60)",
  "--primary": "oklch(0.55 0.13 80)", // #b57614 (gold)
  "--primary-foreground": "oklch(0.96 0.05 85)",
  "--secondary": "oklch(0.89 0.06 80)", // #ebdbb2
  "--secondary-foreground": "oklch(0.34 0.02 60)",
  "--muted": "oklch(0.92 0.05 85)", // #f2e5bc
  "--muted-foreground": "oklch(0.60 0.03 70)", // #928374
  "--accent": "oklch(0.89 0.06 80)",
  "--accent-foreground": "oklch(0.34 0.02 60)",
  "--border": "oklch(0.82 0.05 80)", // #d5c4a1
  "--input": "oklch(0.82 0.05 80)",
  "--ring": "oklch(0.55 0.13 80)",
  "--sidebar": "oklch(0.92 0.05 85)", // #f2e5bc
  "--sidebar-foreground": "oklch(0.34 0.02 60)",
  "--sidebar-accent": "oklch(0.89 0.06 80)",
  "--sidebar-accent-foreground": "oklch(0.34 0.02 60)",
  "--sidebar-border": "oklch(0.89 0.06 80)",
  "--sidebar-ring": "oklch(0.55 0.13 80)",
  "--highlight-amber": "oklch(0.90 0.08 80)",
  "--highlight-green": "oklch(0.90 0.08 140)",
  "--highlight-blue": "oklch(0.90 0.08 240)",
  "--highlight-rose": "oklch(0.90 0.08 15)",
}

function applyTheme(theme: string) {
  const resolved = theme === "system" ? getSystemTheme() : theme
  const isDark = resolved === "dark"
  const root = document.documentElement
  root.classList.toggle("dark", isDark)
  root.style.colorScheme = isDark ? "dark" : "light"
}

function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<string>("system")
  const [resolvedTheme, setResolvedTheme] = useState<string>("light")
  const initialized = useRef(false)

  // Initialize from localStorage + system preference on mount
  useEffect(() => {
    const stored = (() => {
      try { return localStorage.getItem(STORAGE_KEY) || "system" } catch { return "system" }
    })()
    setThemeState(stored)
    const resolved = stored === "system" ? getSystemTheme() : stored
    setResolvedTheme(resolved)
    applyTheme(stored)
    initialized.current = true
  }, [])

  // Re-apply when theme changes (after initial mount)
  useEffect(() => {
    if (!initialized.current) return
    applyTheme(theme)
  }, [theme])

  // Listen for system preference changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => {
      if (theme === "system") {
        setResolvedTheme(getSystemTheme())
        applyTheme("system")
      }
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [theme])

  const setTheme = useCallback((newTheme: string) => {
    setThemeState(newTheme)
    setResolvedTheme(newTheme === "system" ? getSystemTheme() : newTheme)
    try { localStorage.setItem(STORAGE_KEY, newTheme) } catch { /* ignore */ }
  }, [])

  return (
    <ThemeModeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeModeContext.Provider>
  )
}

function useThemeMode() {
  return useContext(ThemeModeContext)
}

// ─── Color Context ────────────────────────────────────────────────────────────

interface ColorContextValue {
  color: ThemeColor
  setColor: (c: ThemeColor) => void
}

const ColorContext = createContext<ColorContextValue>({
  color: "neutral",
  setColor: () => {},
})

export function useColor() {
  return useContext(ColorContext)
}

// ─── Palette Context ──────────────────────────────────────────────────────────

interface PaletteContextValue {
  palette: ThemePalette
  setPalette: (p: ThemePalette) => void
}

const PaletteContext = createContext<PaletteContextValue>({
  palette: "default",
  setPalette: () => {},
})

export function usePalette() {
  return useContext(PaletteContext)
}

// ─── Combined hook (mode + color + palette) ───────────────────────────────────

export function useAppTheme() {
  const { theme, setTheme, resolvedTheme } = useThemeMode()
  const { color, setColor } = useColor()
  const { palette, setPalette } = usePalette()

  const mode = (theme ?? "system") as ThemeMode
  const isDark = palette === "dracula" || resolvedTheme === "dark"

  return { mode, isDark, color, palette, setTheme, setColor, setPalette }
}

// ─── Palette + Color Provider (handles all CSS variables) ──────────────────────

function PaletteColorProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPaletteState] = useState<ThemePalette>("default")
  const [color, setColorState] = useState<ThemeColor>("neutral")
  const { resolvedTheme } = useThemeMode()

  // Load saved theme config on mount
  useEffect(() => {
    const saved = loadThemeConfig()
    setPaletteState(saved.palette)
    setColorState(saved.color)
  }, [])

  // Apply CSS vars to <html> whenever palette, color, or resolvedTheme changes
  useEffect(() => {
    const root = document.documentElement
    const isDracula = palette === "dracula"
    const isDark = isDracula || resolvedTheme === "dark"

    // Toggle dark class and style.colorScheme
    root.classList.toggle("dark", isDark)
    root.style.colorScheme = isDark ? "dark" : "light"

    // Apply variables based on active palette
    if (palette === "dracula") {
      Object.entries(DRACULA_VARS).forEach(([key, val]) => {
        root.style.setProperty(key, val)
      })
      root.setAttribute("data-color", "dracula")
    } else if (palette === "gruvbox") {
      const vars = isDark ? GRUVBOX_DARK_VARS : GRUVBOX_LIGHT_VARS
      Object.entries(vars).forEach(([key, val]) => {
        root.style.setProperty(key, val)
      })
      root.setAttribute("data-color", "gruvbox")
    } else {
      // Default theme: Apply base layout vars
      const baseVars = isDark ? DARK_VARS : LIGHT_VARS
      Object.entries(baseVars).forEach(([key, val]) => {
        root.style.setProperty(key, val)
      })
      // Apply accent color variables
      const colorVars = isDark ? COLOR_VARS[color].dark : COLOR_VARS[color].light
      Object.entries(colorVars).forEach(([key, val]) => {
        root.style.setProperty(key, val)
      })
      root.setAttribute("data-color", color)
    }
  }, [palette, color, resolvedTheme])

  const setPalette = useCallback((p: ThemePalette) => {
    setPaletteState(p)
    const saved = loadThemeConfig()
    saveThemeConfig({ ...saved, palette: p })
  }, [])

  const setColor = useCallback((c: ThemeColor) => {
    setColorState(c)
    const saved = loadThemeConfig()
    saveThemeConfig({ ...saved, color: c })
  }, [])

  return (
    <PaletteContext.Provider value={{ palette, setPalette }}>
      <ColorContext.Provider value={{ color, setColor }}>
        {children}
      </ColorContext.Provider>
    </PaletteContext.Provider>
  )
}

// ─── Public ThemeProvider (wraps everything) ──────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeModeProvider>
      <PaletteColorProvider>{children}</PaletteColorProvider>
    </ThemeModeProvider>
  )
}
