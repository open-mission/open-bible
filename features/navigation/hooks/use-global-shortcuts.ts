"use client"

import { useEffect, useRef } from "react"
import type { ShortcutDefinition } from "../types"

function isInputFocused(): boolean {
  const el = document.activeElement as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable
}

function matchesKey(e: KeyboardEvent, keys: string): boolean {
  const parts = keys.toLowerCase().split("+").map((s) => s.trim())
  const isMac = navigator.platform.toUpperCase().includes("MAC")

  for (const part of parts) {
    switch (part) {
      case "mod":
        if (isMac ? !e.metaKey : !e.ctrlKey) return false
        break
      case "ctrl":
        if (!e.ctrlKey) return false
        break
      case "meta":
        if (!e.metaKey) return false
        break
      case "shift":
        if (!e.shiftKey) return false
        break
      case "alt":
        if (!e.altKey) return false
        break
      default:
        if (e.key.toLowerCase() !== part) return false
        break
    }
  }
  return true
}

export function useGlobalShortcuts(shortcuts: ShortcutDefinition[]) {
  const shortcutsRef = useRef(shortcuts)

  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (isInputFocused()) return

      for (const shortcut of shortcutsRef.current) {
        if (shortcut.enabled === false) continue
        if (matchesKey(e, shortcut.keys)) {
          e.preventDefault()
          e.stopPropagation()
          shortcut.action()
          return
        }
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])
}

export function formatShortcutDisplay(keys: string): string {
  const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().includes("MAC")
  return keys
    .split("+")
    .map((k) => {
      const key = k.trim().toLowerCase()
      switch (key) {
        case "mod": return isMac ? "⌘" : "Ctrl"
        case "ctrl": return "Ctrl"
        case "meta": return "⌘"
        case "shift": return "⇧"
        case "alt": return isMac ? "⌥" : "Alt"
        case "backspace": return "⌫"
        case "enter": return "↵"
        case "tab": return "⇥"
        case "escape": return "Esc"
        case "\\": return "\\"
        default: return key.toUpperCase()
      }
    })
    .join("")
}
