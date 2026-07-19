"use client"

import * as React from "react"
import { Popover } from "@base-ui/react/popover"
import type { HighlightData } from "../context/highlights-context"
import { getNeonStyle } from "../utils/highlight-colors"
import { HighlightPopover } from "./highlight-popover"

interface GutterIndicatorProps {
  highlight: HighlightData
  position: "single" | "top" | "middle" | "bottom"
  lane: number
  isActive: boolean
  onActivate: (highlightId: string) => void
  onDeactivate: () => void
  verseReference: string
  onEdit: (highlightId: string) => void
  onDelete: (highlightId: string) => void
  showDot: boolean
  verseSpacing: "small" | "medium" | "large"
}

function getBracketStyles(
  position: string,
  colorHex: string,
  verseSpacing: "small" | "medium" | "large"
): React.CSSProperties {
  const borderColor = `${colorHex}66` // 40% opacity
  const borderStyle = `1.5px solid ${borderColor}`

  const spacingConfig = {
    small: { paddingTop: "6px", paddingBottom: "6px", gap: "4px" },
    medium: { paddingTop: "10px", paddingBottom: "10px", gap: "8px" },
    large: { paddingTop: "16px", paddingBottom: "16px", gap: "16px" },
  }

  const { paddingTop, paddingBottom, gap } = spacingConfig[verseSpacing] || spacingConfig.medium

  switch (position) {
    case "top":
      return {
        borderLeft: borderStyle,
        borderTop: borderStyle,
        borderTopLeftRadius: "3px",
        top: paddingTop,
        bottom: `-${gap}`,
        left: "4px",
        width: "6px",
        position: "absolute",
      }
    case "middle":
      return {
        borderLeft: borderStyle,
        top: 0,
        bottom: `-${gap}`,
        left: "4px",
        width: "0px",
        position: "absolute",
      }
    case "bottom":
      return {
        borderLeft: borderStyle,
        borderBottom: borderStyle,
        borderBottomLeftRadius: "3px",
        top: 0,
        bottom: paddingBottom,
        left: "4px",
        width: "6px",
        position: "absolute",
      }
    default:
      return {}
  }
}

export function GutterIndicator({
  highlight,
  position,
  lane,
  isActive,
  onActivate,
  onDeactivate,
  verseReference,
  onEdit,
  onDelete,
  showDot,
  verseSpacing,
}: GutterIndicatorProps) {
  const style = getNeonStyle(highlight.highlight.color)
  const leftPos = lane * 10

  return (
    <div
      className="absolute top-0 bottom-0"
      style={{ left: `${leftPos}px`, width: "16px" }}
    >
      {/* Bracket Line */}
      {position !== "single" && (
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={getBracketStyles(position, style.hex, verseSpacing)}
        />
      )}

      {/* Dot with Popover */}
      {showDot && (
        <Popover.Root
          open={isActive}
          onOpenChange={(open) => {
            if (!open) {
              onDeactivate()
            } else {
              onActivate(highlight.highlight.id)
            }
          }}
        >
          <Popover.Trigger
            render={<button type="button" />}
            className="absolute h-2 w-2 rounded-full cursor-pointer hover:scale-125 transition-transform"
            style={{
              top: "50%",
              transform: "translateY(-50%)",
              left: position === "single" ? "4px" : "12px",
              backgroundColor: style.hex,
              boxShadow: isActive ? `0 0 0 2px white, ${style.glow}` : style.glow,
              zIndex: isActive ? 10 : 1,
            }}
            aria-label={highlight.category?.name ?? "Destaque"}
          />
          <Popover.Portal>
            <Popover.Positioner side="right" alignment="center" sideOffset={8}>
              <Popover.Popup data-highlight-popover className="outline-none z-50">
                <HighlightPopover
                  highlight={highlight}
                  verseReference={verseReference}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onClose={onDeactivate}
                />
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      )}
    </div>
  )
}
