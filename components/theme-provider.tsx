"use client"

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import {
  type ThemeColor,
  type ThemeMode,
  COLOR_VARS,
  loadThemeConfig,
  saveThemeConfig,
} from "@/lib/theme"

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

function applyTheme(theme: string) {
  const resolved = theme === "system" ? getSystemTheme() : theme
  const isDark = resolved === "dark"
  const root = document.documentElement
  root.classList.toggle("dark", isDark)
  root.style.colorScheme = isDark ? "dark" : "light"

  // Override base CSS vars so explicit preference beats @media (prefers-color-scheme)
  const vars = isDark ? DARK_VARS : LIGHT_VARS
  Object.entries(vars).forEach(([key, val]) => {
    root.style.setProperty(key, val)
  })
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

// ─── Combined hook (mode + color) ─────────────────────────────────────────────

export function useAppTheme() {
  const { theme, setTheme, resolvedTheme } = useThemeMode()
  const { color, setColor } = useColor()

  const mode = (theme ?? "system") as ThemeMode
  const isDark = resolvedTheme === "dark"

  return { mode, isDark, color, setTheme, setColor }
}

// ─── Color Provider ───────────────────────────────────────────────────────────

function ColorProvider({ children }: { children: React.ReactNode }) {
  const [color, setColorState] = useState<ThemeColor>("neutral")
  const { resolvedTheme } = useThemeMode()

  // Load saved color on mount
  useEffect(() => {
    const saved = loadThemeConfig()
    setColorState(saved.color)
  }, [])

  // Apply CSS vars to <html> whenever color or mode changes
  useEffect(() => {
    const isDark = resolvedTheme === "dark"
    const vars = isDark ? COLOR_VARS[color].dark : COLOR_VARS[color].light
    const root = document.documentElement
    Object.entries(vars).forEach(([key, val]) => {
      root.style.setProperty(key, val)
    })
    root.setAttribute("data-color", color)
  }, [color, resolvedTheme])

  const setColor = useCallback((c: ThemeColor) => {
    setColorState(c)
    const saved = loadThemeConfig()
    saveThemeConfig({ ...saved, color: c })
  }, [])

  return (
    <ColorContext.Provider value={{ color, setColor }}>
      {children}
    </ColorContext.Provider>
  )
}

// ─── Public ThemeProvider (wraps everything) ──────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeModeProvider>
      <ColorProvider>{children}</ColorProvider>
    </ThemeModeProvider>
  )
}
