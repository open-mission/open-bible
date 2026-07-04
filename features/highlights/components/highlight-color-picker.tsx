"use client"

import { useState, useRef } from "react"
import { IconColorPicker } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { PREDEFINED_COLORS, getColorValue, isPredefinedColor, type HighlightColor } from "../utils/highlight-colors"

interface HighlightColorPickerProps {
  value: HighlightColor
  onChange: (color: HighlightColor) => void
  showCustom?: boolean
}

export function HighlightColorPicker({
  value,
  onChange,
  showCustom = true,
}: HighlightColorPickerProps) {
  const [customColor, setCustomColor] = useState(
    isPredefinedColor(value) ? "#000000" : value
  )
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex items-center gap-2">
      {PREDEFINED_COLORS.map((colorKey) => (
        <button
          key={colorKey}
          type="button"
          onClick={() => onChange(colorKey)}
          className={cn(
            "size-6 rounded-full border border-border transition-all focus:outline-none",
            value === colorKey
              ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110"
              : "hover:scale-105"
          )}
          style={{ backgroundColor: getColorValue(colorKey) }}
          aria-label={`Cor: ${colorKey}`}
        />
      ))}
      {showCustom && (
        <div className="relative">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "size-6 rounded-full border border-border transition-all focus:outline-none flex items-center justify-center text-muted-foreground hover:text-foreground",
              !isPredefinedColor(value) && value
                ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110 text-foreground"
                : "bg-muted hover:scale-105"
            )}
            style={!isPredefinedColor(value) && value ? { backgroundColor: value } : undefined}
            aria-label="Cor personalizada"
          >
            <IconColorPicker className="size-3.5 pointer-events-none" />
          </button>
          <input
            ref={inputRef}
            type="color"
            value={customColor}
            onChange={(e) => {
              setCustomColor(e.target.value)
              onChange(e.target.value)
            }}
            className="sr-only"
          />
        </div>
      )}
    </div>
  )
}
