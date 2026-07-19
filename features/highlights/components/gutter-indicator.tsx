"use client"

import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import type { HighlightData } from "../context/highlights-context"
import { getNeonStyle } from "../utils/highlight-colors"
import { HighlightPopover } from "./highlight-popover"
import { useIsMobile } from "@/lib/use-media-query"
import { useHighlightsContext } from "../context/highlights-context"

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
  verseSpacing: "small" | "medium" | "large",
  gutterPosition: "left" | "right"
): React.CSSProperties {
  const borderColor = `${colorHex}66` // 40% opacity
  const borderStyle = `1.5px solid ${borderColor}`

  const spacingConfig = {
    small: { paddingTop: "0px", paddingBottom: "0px", gap: "4px" },
    medium: { paddingTop: "0px", paddingBottom: "0px", gap: "8px" },
    large: { paddingTop: "0px", paddingBottom: "0px", gap: "16px" },
  }

  const { paddingTop, paddingBottom, gap } = spacingConfig[verseSpacing] || spacingConfig.medium
  const isLeft = gutterPosition === "left"

  switch (position) {
    case "single":
      return {
        borderLeft: isLeft ? borderStyle : "none",
        borderRight: isLeft ? "none" : borderStyle,
        borderTop: borderStyle,
        borderBottom: borderStyle,
        borderTopLeftRadius: isLeft ? "3px" : "0px",
        borderTopRightRadius: isLeft ? "0px" : "3px",
        borderBottomLeftRadius: isLeft ? "3px" : "0px",
        borderBottomRightRadius: isLeft ? "0px" : "3px",
        top: 0,
        bottom: 0,
        left: isLeft ? "4px" : 0,
        right: isLeft ? 0 : "4px",
        position: "absolute",
      }
    case "top":
      return {
        borderLeft: isLeft ? borderStyle : "none",
        borderRight: isLeft ? "none" : borderStyle,
        borderTop: borderStyle,
        borderTopLeftRadius: isLeft ? "3px" : "0px",
        borderTopRightRadius: isLeft ? "0px" : "3px",
        top: paddingTop,
        bottom: `-${gap}`,
        left: isLeft ? "4px" : 0,
        right: isLeft ? 0 : "4px",
        position: "absolute",
      }
    case "middle":
      return {
        borderLeft: isLeft ? borderStyle : "none",
        borderRight: isLeft ? "none" : borderStyle,
        top: 0,
        bottom: `-${gap}`,
        left: isLeft ? "4px" : "auto",
        right: isLeft ? "auto" : "4px",
        width: "0px",
        position: "absolute",
      }
    case "bottom":
      return {
        borderLeft: isLeft ? borderStyle : "none",
        borderRight: isLeft ? "none" : borderStyle,
        borderBottom: borderStyle,
        borderBottomLeftRadius: isLeft ? "3px" : "0px",
        borderBottomRightRadius: isLeft ? "0px" : "3px",
        top: 0,
        bottom: paddingBottom,
        left: isLeft ? "4px" : 0,
        right: isLeft ? 0 : "4px",
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
  const offsetPos = lane * 10
  const isMobile = useIsMobile()
  const { gutterPosition, mobileInteraction, desktopInteraction } = useHighlightsContext()

  const isLeft = gutterPosition === "left"
  const useDrawer = isMobile 
    ? (mobileInteraction === "drawer") 
    : (desktopInteraction === "drawer")

  // Common styling for dot aligning to left/right center lane symmetrically
  const dotStyle: React.CSSProperties = {
    top: "50%",
    backgroundColor: style.hex,
    boxShadow: isActive ? `0 0 0 2px white, ${style.glow}` : style.glow,
    zIndex: isActive ? 10 : 1,
    position: "absolute",
    ...(isLeft 
      ? { left: "5px", transform: "translate(-50%, -50%)" } 
      : { right: "5px", transform: "translate(50%, -50%)" })
  }

  return (
    <div
      className="absolute top-0 bottom-0 pointer-events-none"
      style={isLeft ? { left: `${offsetPos}px`, right: 0 } : { right: `${offsetPos}px`, left: 0 }}
    >
      {/* Bracket Line */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={getBracketStyles(position, style.hex, verseSpacing, gutterPosition)}
      />

      {/* Mobile Interaction (Button + Bottom Sheet Drawer) */}
      {showDot && useDrawer && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onActivate(highlight.highlight.id)
            }}
            className="h-2 w-2 rounded-full cursor-pointer active:scale-95 transition-transform pointer-events-auto"
            style={dotStyle}
            aria-label={highlight.category?.name ?? "Destaque"}
          />
          <Drawer
            open={isActive}
            onOpenChange={(open) => {
              if (!open) {
                onDeactivate()
              }
            }}
          >
            <DrawerContent className="p-5 flex flex-col gap-4 bg-background">
              <div onClick={(e) => e.stopPropagation()} className="pointer-events-auto">
                <HighlightPopover
                  highlight={highlight}
                  verseReference={verseReference}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onClose={onDeactivate}
                />
              </div>
            </DrawerContent>
          </Drawer>
        </>
      )}

      {/* Desktop Interaction (Popover Primitive) */}
      {showDot && !useDrawer && (
        <Popover
          open={isActive}
          onOpenChange={(open) => {
            if (!open) {
              onDeactivate()
            } else {
              onActivate(highlight.highlight.id)
            }
          }}
        >
          <PopoverTrigger
            type="button"
            onClick={(e) => {
              e.stopPropagation()
            }}
            className="h-2 w-2 rounded-full cursor-pointer hover:scale-125 transition-transform pointer-events-auto"
            style={dotStyle}
            aria-label={highlight.category?.name ?? "Destaque"}
          />
          <PopoverContent 
            side={isLeft ? "left" : "right"} 
            align="center" 
            sideOffset={8}
            className="p-0 border-none bg-transparent shadow-none ring-0 w-auto pointer-events-auto"
          >
            <div onClick={(e) => e.stopPropagation()} className="pointer-events-auto">
              <HighlightPopover
                highlight={highlight}
                verseReference={verseReference}
                onEdit={onEdit}
                onDelete={onDelete}
                onClose={onDeactivate}
              />
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
