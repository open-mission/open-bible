"use client"

import { IconNotebook, IconHighlight } from "@tabler/icons-react"

interface BottomDockProps {
  activeTab: "notes" | "highlights" | null
  onSelect: (tab: "notes" | "highlights") => void
}

export function BottomDock({ activeTab, onSelect }: BottomDockProps) {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 hidden -translate-x-1/2 md:flex">
      <div className="flex items-center gap-1 rounded-full bg-background/85 backdrop-blur-lg border border-border/60 shadow-elevation px-2 py-1.5">
        <button
          type="button"
          onClick={() => onSelect("highlights")}
          data-active={activeTab === "highlights" || undefined}
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent/60 data-[active]:bg-accent data-[active]:text-foreground data-[active]:shadow-xs"
        >
          <IconHighlight className="size-3.5" />
          <span>Destaques</span>
        </button>
        <div className="h-5 w-px bg-border/40" />
        <button
          type="button"
          onClick={() => onSelect("notes")}
          data-active={activeTab === "notes" || undefined}
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent/60 data-[active]:bg-accent data-[active]:text-foreground data-[active]:shadow-xs"
        >
          <IconNotebook className="size-3.5" />
          <span>Notas</span>
        </button>
      </div>
    </div>
  )
}
