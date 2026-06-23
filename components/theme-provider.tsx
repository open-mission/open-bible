"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import {
  type ThemeColor,
  type ThemeMode,
  type ThemeConfig,
  COLOR_VARS,
  loadThemeConfig,
  saveThemeConfig,
} from "@/lib/theme"

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
  const { theme, setTheme, resolvedTheme } = useNextTheme()
  const { color, setColor } = useColor()

  const mode = (theme ?? "system") as ThemeMode
  const isDark = resolvedTheme === "dark"

  return { mode, isDark, color, setTheme, setColor }
}

// ─── Inner provider (needs next-themes context) ───────────────────────────────

function ColorProvider({ children }: { children: React.ReactNode }) {
  const [color, setColorState] = useState<ThemeColor>("neutral")
  const { resolvedTheme } = useNextTheme()

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
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="openbible:mode"
    >
      <ColorProvider>{children}</ColorProvider>
    </NextThemesProvider>
  )
}
