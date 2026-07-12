"use client"

import { IconNotebook } from "@tabler/icons-react"

/**
 * Placeholder pane for sermons (future feature). Shows a friendly "coming
 * soon" state so users can see that sermon panes will be supported.
 */
export function SermonPaneView() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted/60">
        <IconNotebook className="size-8 text-muted-foreground/50" />
      </div>
      <div className="space-y-1">
        <p className="font-serif text-lg text-muted-foreground/70">
          Sermões em breve
        </p>
        <p className="text-xs text-muted-foreground/50 max-w-xs text-balance">
          Esta aba será usada para visualizar e escrever sermões vinculados
          às passagens bíblicas.
        </p>
      </div>
    </div>
  )
}