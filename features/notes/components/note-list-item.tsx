"use client"

import { NoteRenderer } from "./note-renderer"
import { isEmptyHtml } from "../utils/html"
import { referenceLabel } from "../utils/reference-label"
import { cn } from "@/lib/utils"
import type { NoteReference } from "@/lib/database/user/schema"
import type { Note } from "@/lib/database/user/schema"

export interface NoteListItemData {
  note: Note
  references: NoteReference[]
}

interface NoteListItemProps {
  entry: NoteListItemData
  onOpen: () => void
  className?: string
}

export function NoteListItem({ entry, onOpen, className }: NoteListItemProps) {
  const empty = isEmptyHtml(entry.note.content)

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group relative w-full rounded-2xl border border-border/60 bg-card/40 p-4.5 text-left shadow-xs transition-all duration-300 hover:border-border/80 hover:shadow-md",
        className,
      )}
    >
      <span className="text-xs font-semibold text-muted-foreground font-sans">
        {referenceLabel(entry.references)}
      </span>
      {empty ? (
        <p className="mt-2 text-sm italic text-muted-foreground/70">Nota sem texto</p>
      ) : (
        <div className="mt-2 line-clamp-4 max-h-24 overflow-hidden pointer-events-none">
          <NoteRenderer key={entry.note.id} html={entry.note.content} />
        </div>
      )}
      {entry.references.length > 1 && (
        <p className="mt-2 text-[10px] text-muted-foreground/70">
          Vinculada a {entry.references.length} referências
        </p>
      )}
    </button>
  )
}
