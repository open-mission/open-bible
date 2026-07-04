"use client"

import { useState, useRef } from "react"
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
  const [showPicker, setShowPicker] = useState(false)
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
              "size-6 rounded-full border border-border transition-all focus:outline-none",
              !isPredefinedColor(value) && value
                ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110"
                : "bg-gradient-to-br from-red-500 via-green-500 to-blue-500 hover:scale-105"
            )}
            style={!isPredefinedColor(value) && value ? { backgroundColor: value } : undefined}
            aria-label="Cor personalizada"
          />
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
