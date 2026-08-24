"use client"

interface BookChapterDialogOverlayProps {
  open: boolean
  children: React.ReactNode
}

/**
 * Desktop overlay - fixed backdrop with centered content.
 */
export function BookChapterDialogOverlay({ open, children }: BookChapterDialogOverlayProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="bg-background w-full max-w-4xl h-full max-h-[80vh] rounded-xl shadow-xs ring-1 ring-foreground/10 flex flex-col overflow-hidden border border-border animate-in fade-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  )
}
