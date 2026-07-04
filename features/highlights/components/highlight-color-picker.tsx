"use client"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { PREDEFINED_COLORS, getColorValue, type HighlightColor } from "../utils/highlight-colors"

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
    PREDEFINED_COLORS.includes(value as any) ? "#000000" : value
  )
  const [showPicker, setShowPicker] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {PREDEFINED_COLORS.map((colorKey) => (
          <button
            key={colorKey}
            type="button"
            onClick={() => onChange(colorKey)}
            className={cn(
              "size-8 rounded-full border-2 transition-all",
              value === colorKey
                ? "border-foreground scale-110"
                : "border-transparent hover:scale-105"
            )}
            style={{ backgroundColor: getColorValue(colorKey) }}
            aria-label={`Cor: ${colorKey}`}
          />
        ))}
        {showCustom && (
          <button
            type="button"
            onClick={() => {
              setShowPicker(!showPicker)
              if (!PREDEFINED_COLORS.includes(value as any)) {
                setCustomColor(value)
              }
            }}
            className={cn(
              "size-8 rounded-full border-2 transition-all bg-gradient-to-br from-red-500 via-green-500 to-blue-500",
              !PREDEFINED_COLORS.includes(value as any)
                ? "border-foreground scale-110"
                : "border-transparent hover:scale-105"
            )}
            aria-label="Cor personalizada"
          />
        )}
      </div>
      {showPicker && showCustom && (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="color"
            value={customColor}
            onChange={(e) => {
              setCustomColor(e.target.value)
              onChange(e.target.value)
            }}
            className="size-8 cursor-pointer rounded border-0 p-0"
          />
          <span className="text-xs text-muted-foreground">{customColor}</span>
        </div>
      )}
    </div>
  )
}
