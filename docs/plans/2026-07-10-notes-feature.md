# Notes Feature — Implementation Plan

## Step 1 — Dependencies & utilities
- Install: `@tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-highlight` (same v3).
- Clone tiptap-docs reference; confirm React Composable API + `immediatelyRender:false`.
- Add `lib/hooks/use-is-mobile.ts`.

## Step 2 — Data layer
- Create `lib/database/user/repositories/noteReferencesRepository.ts` (add/listByNote/listForRange/deleteByNote).
- Expose `database.noteReferences` in `lib/database/database.ts`.
- (Optional) composite index migration on note_references.
- Vitest tests for repo methods.

## Step 3 — Notes feature module
- `features/notes/context/notes-context.tsx` (target + open state).
- `features/notes/hooks/use-notes.ts`, `use-note-mutations.ts`.

## Step 4 — TipTap editor & renderer
- `note-editor.tsx` (StarterKit + Highlight + toolbar).
- `note-renderer.tsx` (read-only).
- Component test: toolbar toggles → expected HTML.

## Step 5 — Panel workspace
- `note-card.tsx`, `note-list.tsx`, `notes-panel.tsx`.

## Step 6 — Mobile sheet
- `note-sheet.tsx` (BottomSheet wrapper).

## Step 7 — Wiring & entry points
- `app/page.tsx`: NotesPanel in right slot (desktop) + NoteSheet (mobile).
- `verse-selection-popover.tsx`: "Nota" action.
- `verse-row.tsx`: note indicator + open panel.
- `reader.tsx`: optional toolbar "Nota" button.

## Step 8 — Provider & verification
- Wrap reader tree in `NotesProvider`.
- Run `pnpm lint`, `pnpm test`, `pnpm build`.
