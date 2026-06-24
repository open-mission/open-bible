"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { useIsMobile } from "@/lib/use-media-query"

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  fullScreen?: boolean
  children: React.ReactNode
}

export function BottomSheet({ open, onClose, fullScreen, children }: BottomSheetProps) {
  const isMobile = useIsMobile()
  const prevOpenRef = useRef(open)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else if (prevOpenRef.current) {
      document.body.style.overflow = ""
    }
    prevOpenRef.current = open
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    if (open) document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [open, onClose])

  if (!open) return null

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-end">
        <div
          className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          className={`relative z-10 flex flex-col bg-card rounded-t-xl shadow-xl animate-in slide-in-from-bottom duration-300 ${
            fullScreen ? "h-dvh rounded-t-none" : "max-h-[85dvh]"
          }`}
        >
          <div className="flex justify-center pt-2 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {children}
          </div>
          <div className="shrink-0" style={{ height: "env(safe-area-inset-bottom, 16px)" }} />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-col bg-card rounded-lg border border-border shadow-xl max-h-[85vh] w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <p className="text-sm font-medium text-foreground">Nota</p>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-0">
          {children}
        </div>
      </div>
    </div>
  )
}
