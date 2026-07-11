"use client"

import { IconArrowLeft, IconEdit, IconTrash } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { NoteRenderer } from "./note-renderer"
import { isEmptyHtml } from "../utils/html"
import { referenceLabel } from "../utils/reference-label"
import type { NoteReference } from "@/lib/database/user/schema"
import type { Note } from "@/lib/database/user/schema"

export interface NoteDetailData {
  note: Note
  references: NoteReference[]
}

interface NoteDetailProps {
  entry: NoteDetailData
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
  /** Optional subtitle under the reference (e.g. verse preview) */
  subtitle?: string | null
}

export function NoteDetail({ entry, onBack, onEdit, onDelete, subtitle }: NoteDetailProps) {
  const empty = isEmptyHtml(entry.note.content)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center gap-1 border-b border-border/60 px-3 py-2 sm:px-4">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onBack}
          aria-label="Voltar"
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          <IconArrowLeft />
        </Button>
        <div className="min-w-0 flex-1 px-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {referenceLabel(entry.references)}
          </p>
          {subtitle && (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onEdit}
          aria-label="Editar nota"
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          <IconEdit />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          aria-label="Excluir nota"
          className="shrink-0 text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
        >
          <IconTrash />
        </Button>
      </header>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        {empty ? (
          <p className="text-sm italic text-muted-foreground/70">Nota sem texto</p>
        ) : (
          <NoteRenderer key={entry.note.id + (entry.note.updatedAt?.toString() ?? "")} html={entry.note.content} />
        )}
      </div>
    </div>
  )
}
