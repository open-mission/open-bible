"use client"

import { X, Highlighter, FileText, Plus, ChevronRight } from "lucide-react"
import { useHighlights, useNotes } from "@/lib/store"
import { useBibleVersion } from "@/lib/bible-version-context"
import type { Note } from "@/lib/types"
import { HIGHLIGHT_HEX, resolveHighlightHex, parseVerseId } from "@/lib/verse-utils"

type SecondarySidebarTab = "highlights" | "notes"

interface SecondarySidebarProps {
  isOpen: boolean
  onClose: () => void
  activeTab: SecondarySidebarTab
  onJumpTo: (bookId: string, chapter: number) => void
  onOpenNoteEditor?: (verseIds: string[], noteId: string | null) => void
}

export function SecondarySidebar({
  isOpen,
  onClose,
  activeTab,
  onJumpTo,
  onOpenNoteEditor,
}: SecondarySidebarProps) {
  const { highlights } = useHighlights()
  const { notes } = useNotes()
  const { setVersionId, installedVersions } = useBibleVersion()

  const versionNameMap = (() => {
    const map: Record<string, string> = {}
    for (const v of installedVersions) map[v.id] = v.name
    return map
  })()

  const highlightsWithMeta = highlights
    .map((h) => {
      const meta = parseVerseId(h.verseId)
      if (!meta) return null
      return {
        highlight: h,
        ...meta,
        versionName: h.versionId ? versionNameMap[h.versionId] ?? h.versionId.toUpperCase() : undefined,
      }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b!.highlight.createdAt).getTime() - new Date(a!.highlight.createdAt).getTime())

  const notesWithMeta = notes
    .map((note) => {
      const firstMeta = note.verseIds.length > 0 ? parseVerseId(note.verseIds[0]) : null
      return { note, firstMeta }
    })
    .sort((a, b) => new Date(b.note.updatedAt).getTime() - new Date(a.note.updatedAt).getTime())

  if (!isOpen) return null

  return (
    <div className="h-full flex flex-col bg-sidebar border-r border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border shrink-0">
        <h2 className="text-sm font-semibold">
          {activeTab === "highlights" ? "Destaques" : "Notas"}
        </h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-sidebar-accent rounded-md text-muted-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === "highlights" ? (
          highlightsWithMeta.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-6 py-12">
              <Highlighter className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-center text-sm text-muted-foreground leading-relaxed">
                Nenhum destaque. Clique em um versículo para destacar.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {highlightsWithMeta.map((item) => {
                if (!item) return null
                const { highlight, book, chapter, verse, text, versionName } = item
                const hex = resolveHighlightHex(highlight)
                const ref = `${book.abbreviation} ${chapter}:${verse}`
                return (
                  <li key={highlight.id}>
                    <button
                      onClick={() => {
                        if (highlight.versionId) setVersionId(highlight.versionId)
                        onJumpTo(book.id, chapter)
                        onClose()
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-sidebar-accent transition-colors group"
                      style={{ borderLeft: `3px solid ${hex}` }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: hex }} />
                          <span className="text-xs font-mono font-medium text-primary">{ref}</span>
                        </div>
                        <ChevronRight className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {text && (
                        <p
                          className="text-xs text-muted-foreground line-clamp-2 font-serif leading-snug"
                          style={{ backgroundColor: `${hex}33`, borderRadius: 3, padding: "2px 4px" }}
                        >
                          {text}
                        </p>
                      )}
                      {versionName && (
                        <p className="mt-1 text-[10px] text-muted-foreground/50 font-mono">{versionName}</p>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )
        ) : notesWithMeta.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 px-6 py-12">
            <FileText className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-center text-sm text-muted-foreground leading-relaxed">
              Nenhuma nota ainda. Clique em um versículo para criar uma.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {notesWithMeta.map(({ note, firstMeta }) => {
              const verseHighlight = note.verseIds.length > 0 ? highlights.find((h) => h.verseId === note.verseIds[0]) : undefined
              const hlHex = verseHighlight ? resolveHighlightHex(verseHighlight) : undefined
              const date = new Date(note.updatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
              return (
                <li key={note.id}>
                  <button
                    onClick={() => onOpenNoteEditor?.(note.verseIds, note.id)}
                    className="w-full text-left px-4 py-3 hover:bg-sidebar-accent transition-colors group"
                    style={hlHex ? { borderLeft: `3px solid ${hlHex}` } : undefined}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {hlHex && <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: hlHex }} />}
                        {firstMeta ? (
                          <span className="text-xs font-mono font-medium text-primary shrink-0">
                            {firstMeta.book.abbreviation} {firstMeta.chapter}:{firstMeta.verse}
                            {note.verseIds.length > 1 && (
                              <span className="ml-1 text-muted-foreground font-sans">+{note.verseIds.length - 1}</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Sem versículo</span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground/60">{date}</span>
                    </div>
                    <p className="text-xs text-foreground line-clamp-2 leading-relaxed">
                      {note.content.replace(/<[^>]+>/g, "")}
                    </p>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Footer action for notes */}
      {activeTab === "notes" && (
        <div className="shrink-0 px-3 py-2 border-t border-border">
          <button
            onClick={() => onOpenNoteEditor?.([], null)}
            className="w-full flex items-center justify-center gap-1.5 rounded-md border border-dashed border-border py-2 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-secondary/40 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Nova nota
          </button>
        </div>
      )}
    </div>
  )
}
