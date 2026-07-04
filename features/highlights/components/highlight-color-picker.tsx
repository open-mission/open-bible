"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { defaultNeonColors, neonColors, type HighlightColor } from "../utils/highlight-colors"

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
  // Check if current value is one of the default 6 colors
  const isDefaultColor = defaultNeonColors.some(
    (c) => c.hex.toLowerCase() === value.toLowerCase()
  )
  const isExtraColorSelected = !isDefaultColor && value

  return (
    <div className="flex items-center gap-2">
      {defaultNeonColors.map((color) => {
        const isSelected = value.toLowerCase() === color.hex.toLowerCase()
        return (
          <button
            key={color.hex}
            type="button"
            onClick={() => onChange(color.hex)}
            className={cn(
              "size-6 rounded-full border border-border/10 transition-all focus:outline-none cursor-pointer",
              isSelected
                ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110"
                : "hover:scale-105 active:scale-95"
            )}
            style={{
              backgroundColor: color.hex,
              boxShadow: isSelected ? `0 0 12px 3px ${color.hex}66` : undefined,
            }}
            title={color.name}
            aria-label={`Cor: ${color.name}`}
          />
        )
      })}
      
      {showCustom && (
        <Popover>
          <PopoverTrigger
            render={
              <button
                type="button"
                className={cn(
                  "size-6 rounded-full border border-dashed border-muted-foreground/60 transition-all focus:outline-none flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground hover:scale-105 active:scale-95 bg-muted/20 cursor-pointer",
                  isExtraColorSelected && "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110 border-solid"
                )}
                style={isExtraColorSelected ? {
                  backgroundColor: value,
                  boxShadow: `0 0 12px 3px ${value}66`,
                } : undefined}
                title="Mais cores"
                aria-label="Mais cores"
              />
            }
          >
            {isExtraColorSelected ? (
              <span className="size-1.5 rounded-full bg-foreground" />
            ) : (
              <span className="text-xs font-bold leading-none -mt-0.5">+</span>
            )}
          </PopoverTrigger>
          <PopoverContent align="center" side="top" className="w-[280px] p-3 flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-muted-foreground pl-1 py-1">Selecione uma cor neon</h4>
            <div className="grid grid-cols-6 gap-2">
              {neonColors.map((color) => {
                const isSelected = value.toLowerCase() === color.hex.toLowerCase()
                return (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => {
                      onChange(color.hex)
                    }}
                    className={cn(
                      "size-8 rounded-full border border-border/10 transition-all focus:outline-none cursor-pointer flex items-center justify-center",
                      isSelected
                        ? "ring-2 ring-foreground ring-offset-1 ring-offset-background scale-105"
                        : "hover:scale-105 active:scale-95"
                    )}
                    style={{
                      backgroundColor: color.hex,
                      boxShadow: isSelected ? `0 0 10px 2px ${color.hex}55` : undefined,
                    }}
                    title={color.name}
                    aria-label={`Cor: ${color.name}`}
                  />
                )
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
