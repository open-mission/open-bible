# Notes Feature — Rich-Text Side-Panel Editor — Design Spec

## Summary
Allow users to create standalone, rich-text notes attached to one or more
Bible verses (references), edited with TipTap inside the existing side-panel
layout so the reader text stays visible while annotating. Desktop opens the
note workspace in the right `InspectorPanel` slot; mobile opens a `BottomSheet`.

## Goals
- Independent notes stored in `notes` + `note_references` (decoupled from highlights).
- Rich text: bold, italic, highlight, bullet list, ordered list (TipTap).
- Storage format: TipTap HTML in `notes.content`.
- Side-panel UX: see verse text + annotate simultaneously.
- Optional link: a highlight may point to a note via `highlights.noteId` (out of scope for v1 UI).

## Non-Goals
- Global "all notes" management tab / search (deferred).
- Collaboration, AI, version history.
- Linking a note to an existing highlight from the v1 UI.

## Data Layer (no schema migration)
- `notes.content` = HTML string (text column already exists). `title` optional.
- New `noteReferencesRepository`: `add`, `listByNote`, `listForRange({bible,book,chapter,verseStart,verseEnd})`, `deleteByNote`.
- Expose `database.noteReferences` in `lib/database/database.ts`.
- Optional composite index on `(bible, book, chapter, verse_start, verse_end)`.

## Components (new `features/notes/`)
- `context/notes-context.tsx` — active note target `{bible,book,chapter,verseStart,verseEnd}` + open state; `openNotePanel(target)` / `closeNotePanel()`.
- `hooks/use-notes.ts` — loads notes for active range via repo.
- `hooks/use-note-mutations.ts` — create/update/delete note + references (split per-chapter if range spans chapters).
- `components/note-editor.tsx` — TipTap editor (StarterKit + Highlight, `immediatelyRender:false`) + inline toolbar (Negrito, Itálico, Destaque, Lista, Lista ordenada). Emits HTML on change.
- `components/note-renderer.tsx` — read-only TipTap instance reusing same extensions (safe HTML rendering).
- `components/note-card.tsx` — single note: renderer + edit/delete.
- `components/note-list.tsx` — notes for active range.
- `components/notes-panel.tsx` — workspace: header (reference) + editor + list.
- `components/note-sheet.tsx` — mobile `BottomSheet` wrapper around `NotesPanel`.

## Wiring / Entry Points
- `app/page.tsx`: render `<NotesPanel>` in right `InspectorPanel` slot (desktop); `<NoteSheet>` (mobile, via `useIsMobile`).
- `lib/hooks/use-is-mobile.ts` — `matchMedia('(max-width: 767px)')`.
- `verse-selection-popover.tsx`: add "Nota" action → `openNotePanel(target)`.
- `verse-row.tsx`: note indicator icon (reuse highlights pattern) → opens panel for that verse.
- `reader.tsx` (optional): toolbar "Nota" button.

## Dependencies
- `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-highlight` — all pinned to same Tiptap 3 version. Set `immediatelyRender:false` for Next.js SSR (per TipTap skill).

## Testing
- Vitest: `noteReferencesRepository` (`listForRange`, create+reference, deleteByNote).
- Component test: editor toolbar toggles (bold/italic/highlight/lists) produce expected HTML.

## Acceptance Criteria
1. User selects verse(s) → "Nota" → side panel (desktop) / bottom sheet (mobile) opens with the reference shown.
2. Typing with bold/italic/highlight/lists persists as HTML; reopening renders formatting correctly.
3. A note is linked to the exact verse range; multiple notes per verse are listed.
4. Edit/delete works; deleting a note removes its references.
5. No regressions to highlights, theme, or offline reading.
