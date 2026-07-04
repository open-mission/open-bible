# Mobile UI Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add bottom sheets for mobile (version selectors + note editor), full-screen mobile sidebar, resizable desktop sidebar, and unify note creation into a single dialog/bottom-sheet component.

**Architecture:** Lift note editor state to `page.tsx`, pass callbacks to `Reader` and `Sidebar`. Create reusable `BottomSheet` component that renders differently on mobile vs desktop. Remove inline note views from sidebar. Use `useIsMobile()` hook for conditional rendering of bottom sheet vs dropdown.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, `tw-animate-css`, Lucide icons.

## Global Constraints

- All new components use `"use client"` directive
- Use `@/` path alias for all imports
- Portuguese UI strings
- No external dependencies beyond what's already in package.json
- Tailwind CSS v4 utilities only (no CSS modules)

---

### Task 1: `useIsMobile` hook

**Files:**
- Create: `lib/use-media-query.ts`

**Interfaces:**
- Produces: `useIsMobile(): boolean` — returns true when viewport ≤ 767px, handles SSR by defaulting to `false`

- [ ] **Step 1: Create the hook**

```ts
"use client"

import { useState, useEffect } from "react"

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    setIsMobile(mq.matches)
    function handler(e: MediaQueryListEvent) {
      setIsMobile(e.matches)
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  return isMobile
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/use-media-query.ts
git commit -m "feat: add useIsMobile hook"
```

---

### Task 2: `BottomSheet` component

**Files:**
- Create: `components/ui/bottom-sheet.tsx`

**Interfaces:**
- Consumes: `useIsMobile()` from `@/lib/use-media-query`
- Produces: `<BottomSheet open onClose fullScreen? children />` — renders slide-up panel on mobile, centered dialog on desktop

- [ ] **Step 1: Create BottomSheet component**

```tsx
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

  // Mobile bottom sheet
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
          {/* Handle bar */}
          <div className="flex justify-center pt-2 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {children}
          </div>
        </div>
      </div>
    )
  }

  // Desktop dialog
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
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/bottom-sheet.tsx
git commit -m "feat: add BottomSheet component"
```

---

### Task 3: `NoteEditorDialog` component

**Files:**
- Create: `components/note-editor-dialog.tsx`
- Delete: `components/notes-panel.tsx` (replaced)

**Interfaces:**
- Consumes: `BottomSheet` from `@/components/ui/bottom-sheet`, `useIsMobile` from `@/lib/use-media-query`
- Produces: `<NoteEditorDialog verseIds noteId onSave onDelete onClose />`

- [ ] **Step 1: Create NoteEditorDialog component**

```tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { X, Trash2, Link2, Link2Off } from "lucide-react"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { useIsMobile } from "@/lib/use-media-query"
import { getBook, getVerses } from "@/lib/bible-data"
import type { Note } from "@/lib/types"

interface NoteEditorDialogProps {
  verseIds: string[]
  noteId: string | null
  existingNote?: Note
  onSave: (noteId: string | null, content: string, verseIds: string[]) => void
  onDelete: (noteId: string) => void
  onClose: () => void
}

function parseVerseId(verseId: string) {
  const match = verseId.match(/^(.+)-(\d+)-(\d+)$/)
  if (!match) return null
  const [, bookId, chapterStr, verseStr] = match
  const book = getBook(bookId)
  if (!book) return null
  const chapter = parseInt(chapterStr, 10)
  const verse = parseInt(verseStr, 10)
  const verseData = getVerses(bookId, chapter).find((v) => v.verse === verse)
  return { bookId, book, chapter, verse, text: verseData?.text ?? "" }
}

export function NoteEditorDialog({
  verseIds: initialVerseIds,
  noteId,
  existingNote,
  onSave,
  onDelete,
  onClose,
}: NoteEditorDialogProps) {
  const [content, setContent] = useState(existingNote?.content ?? "")
  const [linkedVerseIds, setLinkedVerseIds] = useState<string[]>(
    existingNote?.verseIds ?? initialVerseIds
  )
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    setContent(existingNote?.content ?? "")
    setLinkedVerseIds(existingNote?.verseIds ?? initialVerseIds)
  }, [noteId, existingNote, initialVerseIds.join(",")])

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const isDirty =
    content !== (existingNote?.content ?? "") ||
    JSON.stringify(linkedVerseIds) !== JSON.stringify(existingNote?.verseIds ?? initialVerseIds)
  const isEmpty = content.trim() === ""

  function handleSave() {
    if (isEmpty) return
    onSave(noteId, content.trim(), linkedVerseIds)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault()
      handleSave()
    }
  }

  function removeVerseLink(verseId: string) {
    setLinkedVerseIds((prev) => prev.filter((id) => id !== verseId))
  }

  const open = true

  return (
    <BottomSheet open={open} onClose={onClose} fullScreen={isMobile}>
      {isMobile && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <p className="text-sm font-medium text-foreground">
            {noteId ? "Editar nota" : "Nova nota"}
          </p>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Linked verses */}
      {linkedVerseIds.length > 0 && (
        <div className="shrink-0 border-b border-border px-4 py-2.5 space-y-1.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
            <Link2 className="h-3 w-3" />
            Versículos vinculados
          </p>
          {linkedVerseIds.map((vId) => {
            const meta = parseVerseId(vId)
            if (!meta) return null
            const ref = `${meta.book.abbreviation} ${meta.chapter}:${meta.verse}`
            return (
              <div
                key={vId}
                className="flex items-start gap-2 rounded-md bg-secondary/60 px-2.5 py-1.5"
              >
                <span className="font-mono text-xs text-primary shrink-0 mt-0.5">{ref}</span>
                <p className="flex-1 font-serif text-xs text-muted-foreground line-clamp-2 leading-snug">
                  {meta.text}
                </p>
                <button
                  onClick={() => removeVerseLink(vId)}
                  aria-label={`Remover vínculo com ${ref}`}
                  className="shrink-0 mt-0.5 text-muted-foreground/50 hover:text-destructive transition-colors"
                >
                  <Link2Off className="h-3 w-3" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {linkedVerseIds.length === 0 && (
        <div className="shrink-0 border-b border-border px-4 py-2.5">
          <p className="text-xs text-muted-foreground/60 italic">
            Nenhum versículo vinculado. Selecione versículos no leitor para vincular.
          </p>
        </div>
      )}

      {/* Textarea */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <label htmlFor="note-textarea" className="sr-only">Nota</label>
        <textarea
          id="note-textarea"
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escreva sua nota aqui..."
          className="w-full h-full min-h-32 resize-none bg-transparent font-serif text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          spellCheck
        />
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-between shrink-0 ${isMobile ? "border-t border-border px-4 py-3" : "border-t border-border px-4 py-3"}`}>
        <div className="flex items-center gap-2">
          {noteId && (
            <button
              onClick={() => { onDelete(noteId); onClose() }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Excluir nota"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground/50 hidden sm:inline">Ctrl+S</span>
          <button
            onClick={handleSave}
            disabled={isEmpty || !isDirty}
            className="rounded-md px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Salvar
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
```

Note: Need to add `X` import. Let me fix that — the `BottomSheet` desktop variant already has the close button, but mobile uses a separate header. Let me ensure `X` is imported in `NoteEditorDialog`.

Actually, looking at the code: the BottomSheet desktop variant has its own header with X button. For mobile, the NoteEditorDialog renders its own header with X. And the BottomSheet mobile only shows a handle bar. So the imports are fine.

But wait, NoteEditorDialog needs `X` from lucide-react for the mobile header. Let me add the import.

Actually I already have it in the code above.

- [ ] **Step 2: Commit**

```bash
git add components/note-editor-dialog.tsx
git rm components/notes-panel.tsx
git commit -m "feat: add NoteEditorDialog, remove NotesPanel"
```

---

### Task 4: Sidebar — remove new/detail views, full-screen mobile, resize handle

**Files:**
- Modify: `components/sidebar.tsx`

- [ ] **Step 1: Remove the "new" and "detail" notes views from sidebar**

Replace the entire NOTES tab section. Keep only the "list" view. The "Nova nota" button and clicking on a note both call a new `onOpenNoteEditor` prop instead of switching to inline views.

Changes:
1. Add `onOpenNoteEditor?: (verseIds: string[], noteId: string | null) => void` to `SidebarProps`
2. Remove `notesView`, `activeNoteId`, `newNoteContent`, `editNoteContent`, `setEditNoteContent` state
3. Remove `openNewNote`, `handleSaveNewNote`, `handleSaveEdit`, `handleDeleteNote` functions
4. Simplify `openNoteDetail` to call `onOpenNoteEditor(note.verseIds, note.id)`
5. Remove the NOTES tab `notesView === "detail"` and `notesView === "new"` conditional renders
6. The "Nova nota" button calls `onOpenNoteEditor([], null)`

- [ ] **Step 2: Apply sidebar full-screen mobile change**

In the mobile drawer section, change:
```tsx
<div className="relative z-50 w-72 h-full flex flex-col shadow-xl">
```
to:
```tsx
<div className="relative z-50 w-full max-w-sm h-full flex flex-col shadow-xl">
```

- [ ] **Step 3: Add resize handle to desktop sidebar**

Add a 4px-wide drag handle on the right edge of the `<aside>` element. Use `useState` for width, `useEffect` for `localStorage` sync.

Key additions in the sidebar component:
```tsx
// State (inside component):
const [sidebarWidth, setSidebarWidth] = useState(256)
const isResizing = useRef(false)

useEffect(() => {
  try {
    const saved = localStorage.getItem("openbible:sidebar-width")
    if (saved) setSidebarWidth(Number(saved))
  } catch {}
}, [])

// Resize handlers:
function handleMouseDown(e: React.MouseEvent) {
  e.preventDefault()
  isResizing.current = true
  document.body.style.cursor = "col-resize"
  document.body.style.userSelect = "none"
}

useEffect(() => {
  function handleMouseMove(e: MouseEvent) {
    if (!isResizing.current) return
    const newWidth = Math.min(480, Math.max(240, e.clientX))
    setSidebarWidth(newWidth)
  }
  function handleMouseUp() {
    if (isResizing.current) {
      isResizing.current = false
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
      try { localStorage.setItem("openbible:sidebar-width", String(sidebarWidth)) } catch {}
    }
  }
  document.addEventListener("mousemove", handleMouseMove)
  document.addEventListener("mouseup", handleMouseUp)
  return () => {
    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("mouseup", handleMouseUp)
  }
}, [sidebarWidth])
```

Apply inline width to the desktop `<aside>`:
```tsx
<aside
  className={`hidden md:flex shrink-0 border-r border-border h-full flex-col overflow-hidden transition-[width] duration-100 ${sidebarCollapsed ? "w-0 border-0 overflow-hidden" : ""}`}
  style={sidebarCollapsed ? undefined : { width: sidebarWidth }}
>
```

Add the resize handle inside the `<aside>`:
```tsx
{!sidebarCollapsed && (
  <div
    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/30 active:bg-primary/50 transition-colors z-10 hidden md:block"
    onMouseDown={handleMouseDown}
  />
)}
```

Important: The `<aside>` needs `relative` positioning for the handle.

The sidebar content needs `w-full` to fill the width.

Full sidebar width persistence fix: the `handleMouseUp` closure captures stale `sidebarWidth`. Use a ref instead:

```tsx
const sidebarWidthRef = useRef(sidebarWidth)
sidebarWidthRef.current = sidebarWidth

function handleMouseUp() {
  if (isResizing.current) {
    isResizing.current = false
    document.body.style.cursor = ""
    document.body.style.userSelect = ""
    try { localStorage.setItem("openbible:sidebar-width", String(sidebarWidthRef.current)) } catch {}
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add components/sidebar.tsx
git commit -m "feat: simplify sidebar notes tab, full-screen mobile, resize handle"
```

---

### Task 5: Reader — replace NotesPanel with NoteEditorDialog callback

**Files:**
- Modify: `components/reader.tsx`

- [ ] **Step 1: Replace NotesPanel with callback prop**

Changes:
1. Add `onOpenNoteEditor?: (verseIds: string[], noteId: string | null) => void` to `ReaderProps`
2. Remove `noteVerseIds`, `editNoteId` state
3. Remove `NotesPanel` import
4. Change `handleOpenNote` to call `onOpenNoteEditor(verseIds, null)` instead of setting state
5. Remove `handleCloseNote` function
6. Remove the `notePanelOpen` check and the `<NotesPanel>` render at the bottom
7. Keep `NotesPanel` import removal, add nothing in its place

The rendering changes:
- Remove lines 266-278 (the NotesPanel conditional render)
- Change `handleOpenNote`:
```tsx
function handleOpenNote() {
  const ids = multiSelectMode
    ? Array.from(selectedVerseIds)
    : activeVerseId
    ? [activeVerseId]
    : []
  if (ids.length === 0) return
  onOpenNoteEditor?.(ids, null)
  setActiveVerseId(null)
}
```

- Remove `noteVerseIds`, `setEditNoteId`, `editNoteId` from state
- Remove `const [noteVerseIds, setNoteVerseIds] = useState<string[]>([])` and `const [editNoteId, setEditNoteId] = useState<string | null>(null)`
- In the `useEffect` cleanup for chapter change, remove references to these states
- Remove the `const notePanelOpen = noteVerseIds.length > 0` line

Cleanup the import:
```tsx
// Remove:
import { NotesPanel } from "./notes-panel"
```

- [ ] **Step 2: Commit**

```bash
git add components/reader.tsx
git commit -m "feat: replace NotesPanel with onOpenNoteEditor callback"
```

---

### Task 6: `ReaderVersionBadge` — bottom sheet on mobile

**Files:**
- Modify: `components/reader-version-badge.tsx`

- [ ] **Step 1: Add bottom sheet support**

Import `useIsMobile` and `BottomSheet`:
```tsx
import { useIsMobile } from "@/lib/use-media-query"
import { BottomSheet } from "@/components/ui/bottom-sheet"
```

Add state: `const isMobile = useIsMobile()`

Conditionally render:
- Mobile: wrap the options list in `<BottomSheet>`, show a trigger button that opens the sheet
- Desktop: keep existing dropdown behavior

```tsx
export function ReaderVersionBadge() {
  const { versionId, setVersionId, installedVersions } = useBibleVersion()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open && !isMobile) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open, isMobile])

  const currentAbbr = versionId === "default" ? "Padrão" : versionId.toUpperCase()
  const currentFullName = versionId === "default" ? "Versão padrão" : installedVersions.find((v) => v.id === versionId)?.name ?? versionId.toUpperCase()

  const allOptions = [
    { id: "default", name: "Versão padrão" },
    ...installedVersions.map((v) => ({ id: v.id, name: v.name })),
  ]

  const optionsList = (
    <div className="p-1 space-y-0.5">
      {allOptions.map((opt) => (
        <button
          key={opt.id}
          onClick={() => { setVersionId(opt.id); setOpen(false) }}
          className={`w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
            versionId === opt.id
              ? "bg-accent text-accent-foreground"
              : "hover:bg-secondary text-foreground"
          }`}
        >
          <Check className={`h-3 w-3 shrink-0 ${versionId === opt.id ? "opacity-100" : "opacity-0"}`} />
          <span className="font-medium truncate">{opt.name}</span>
        </button>
      ))}
    </div>
  )

  return (
    <div ref={!isMobile ? ref : undefined} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        aria-label="Selecionar versão da Bíblia"
        title={currentFullName}
      >
        <Book className="h-3.5 w-3.5 shrink-0" />
        <span>{currentAbbr}</span>
        <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
      </button>

      {open && !isMobile && (
        <div className="absolute right-0 top-full mt-1 min-w-40 rounded-lg border border-border bg-card shadow-lg z-50">
          {optionsList}
        </div>
      )}

      {open && isMobile && (
        <BottomSheet open={open} onClose={() => setOpen(false)}>
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-foreground">Selecionar versão</p>
          </div>
          {optionsList}
        </BottomSheet>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/reader-version-badge.tsx
git commit -m "feat: add bottom sheet to ReaderVersionBadge on mobile"
```

---

### Task 7: `BibleVersionSelector` — bottom sheet on mobile

**Files:**
- Modify: `components/bible-version-selector.tsx`

- [ ] **Step 1: Add bottom sheet support**

Same pattern as ReaderVersionBadge but with the full selector (install/uninstall, progress bar).

Import `useIsMobile` and `BottomSheet`. Extract the options content into a variable. Render:
- Mobile: trigger button + `<BottomSheet>` with options content
- Desktop: existing dropdown

Key structural changes:
```tsx
const [open, setOpen] = useState(false)
const menuRef = useRef<HTMLDivElement>(null)
const isMobile = useIsMobile()

// Only attach click-outside on desktop
useEffect(() => {
  function handleClickOutside(e: MouseEvent) {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setOpen(false)
    }
  }
  if (open && !isMobile) document.addEventListener("mousedown", handleClickOutside)
  return () => document.removeEventListener("mousedown", handleClickOutside)
}, [open, isMobile])
```

Extract the version list content into a variable `optionsPanel` (the entire dropdown content div, minus the outer container).

Then:
```tsx
return (
  <div ref={!isMobile ? menuRef : undefined} className="relative">
    {/* Trigger button (same for both) */}
    <button onClick={() => setOpen((v) => !v)} className="...">...</button>

    {/* Desktop dropdown */}
    {open && !isMobile && (
      <div className="absolute bottom-full left-0 right-0 mb-1 ...">
        {optionsPanel}
      </div>
    )}

    {/* Mobile bottom sheet */}
    {open && isMobile && (
      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-medium text-foreground">Selecionar versão</p>
        </div>
        {optionsPanel}
      </BottomSheet>
    )}
  </div>
)
```

- [ ] **Step 2: Commit**

```bash
git add components/bible-version-selector.tsx
git commit -m "feat: add bottom sheet to BibleVersionSelector on mobile"
```

---

### Task 8: `page.tsx` — lift note dialog state, render NoteEditorDialog

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/reader.tsx` (ReaderProps update)
- Modify: `components/sidebar.tsx` (SidebarProps update)

- [ ] **Step 1: Update page.tsx**

Add state for note dialog:
```tsx
const [noteDialog, setNoteDialog] = useState<{
  verseIds: string[]
  noteId: string | null
} | null>(null)
```

Import NoteEditorDialog:
```tsx
import { NoteEditorDialog } from "@/components/note-editor-dialog"
```

Pass callbacks to Sidebar and Reader:
```tsx
<Sidebar
  ...
  onOpenNoteEditor={(verseIds, noteId) => setNoteDialog({ verseIds, noteId })}
/>

<Reader
  ...
  onOpenNoteEditor={(verseIds, noteId) => setNoteDialog({ verseIds, noteId })}
/>
```

Render NoteEditorDialog at the end of the main div:
```tsx
{noteDialog && (
  <NoteEditorDialog
    verseIds={noteDialog.verseIds}
    noteId={noteDialog.noteId}
    existingNote={noteDialog.noteId ? notes.find((n) => n.id === noteDialog.noteId) : undefined}
    onSave={(noteId, content, verseIds) => {
      upsertNote(noteId, content, verseIds)
      setNoteDialog(null)
    }}
    onDelete={(noteId) => {
      deleteNote(noteId)
      setNoteDialog(null)
    }}
    onClose={() => setNoteDialog(null)}
  />
)}
```

We need `notes`, `upsertNote`, `deleteNote` from `useNotes()` in page.tsx:
```tsx
import { useNotes } from "@/lib/store"
// Inside component:
const { notes, upsertNote, deleteNote } = useNotes()
```

- [ ] **Step 2: Commit**

```bash
git add app/page.tsx components/reader.tsx components/sidebar.tsx
git commit -m "feat: lift note dialog state to page level"
```

---

### Task 9: Remove unused NotesPanel file

**Files:**
- Delete: `components/notes-panel.tsx`

- [ ] **Step 1: Delete file and verify no remaining references**

```bash
git rm components/notes-panel.tsx
```

- [ ] **Step 2: Ensure no remaining imports of NotesPanel anywhere**

```bash
rg "notes-panel" --type tsx
```

Should return zero results.

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: remove unused NotesPanel component"
```

---

### Task 10: Build and verify

- [ ] **Step 1: Run the build**

```bash
pnpm build
```

Fix any errors.

- [ ] **Step 2: Verify manual checklist**
- Build succeeds with no errors
- Mobile: version selectors open as bottom sheets (test in browser dev tools responsive mode)
- Mobile: note editor opens as full-screen bottom sheet
- Mobile: sidebar fills the whole screen
- Desktop: version selectors remain dropdowns
- Desktop: note editor opens as centered dialog
- Desktop: sidebar is resizable via drag handle (240-480px)
- No duplicate notes created from any flow
