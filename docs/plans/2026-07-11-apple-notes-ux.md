# Apple Notes–Style Notes UX — Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify notes into an Apple Notes–style list → detail → edit flow with formatted previews and a single entry experience for dock, header, and verse panel.

**Architecture:** A `NotesBrowser` shell owns view state (`list` | `detail` | `edit` | `compose`). Entry points only open/close the shell. `mode="all"` loads via `useAllNotes`; `mode="target"` via `useNotes`. List rows use `NoteRenderer` with line-clamp; click never opens the editor.

**Tech Stack:** Next.js client components, TipTap (`NoteRenderer` / `NoteEditor`), shadcn Sheet/BottomSheet/Button/Empty/InputGroup, Tabler icons.

**Spec:** `docs/specs/2026-07-11-apple-notes-ux-design.md`

---

## File map

| Action | Path |
|--------|------|
| Create | `features/notes/utils/html.ts` |
| Create | `features/notes/utils/reference-label.ts` |
| Create | `features/notes/components/note-list-item.tsx` |
| Create | `features/notes/components/note-detail.tsx` |
| Create | `features/notes/components/notes-browser.tsx` |
| Rewrite | `features/notes/components/all-notes-sheet.tsx` |
| Rewrite | `features/notes/components/notes-panel.tsx` |
| Rewrite | `features/notes/components/note-sheet.tsx` (if needed) |
| Update | `features/bible-reader/components/reader.tsx` |
| Delete | `features/dock/full-screen-notes.tsx` |
| Remove or slim | `note-card.tsx` / `note-list.tsx` if unused |

---

### Task 1: Shared utils

- [ ] Create `features/notes/utils/html.ts` with `stripHtml` and `isEmptyHtml`
- [ ] Create `features/notes/utils/reference-label.ts` for `AllNoteEntry` and `NoteWithRefs`
- [ ] Commit: `improve(notes): extract html and reference label helpers`

### Task 2: NoteListItem + NoteDetail

- [ ] Create `note-list-item.tsx` — formatted preview, click → open
- [ ] Create `note-detail.tsx` — full renderer, back / edit / delete
- [ ] Commit: `improve(notes): add list item and detail read views`

### Task 3: NotesBrowser shell

- [ ] Create `notes-browser.tsx` with view state machine for `all` and `target` modes
- [ ] Wire list search, compose, edit save/cancel, delete → list
- [ ] Commit: `improve(notes): add NotesBrowser list-detail-edit shell`

### Task 4: Wire all-notes + verse panel entry points

- [ ] Rewrite `all-notes-sheet.tsx` as shell around `NotesBrowser mode="all"` (full-screen desktop, BottomSheet mobile)
- [ ] Rewrite `notes-panel.tsx` / `note-sheet.tsx` to embed `NotesBrowser mode="target"`
- [ ] Commit: `improve(notes): wire browser into all-notes and verse panel`

### Task 5: Unify reader entry points, remove FullScreenNotes

- [ ] `reader.tsx`: single `allNotesOpen` for header + dock; remove `FullScreenNotes` and `dockOpenNote`
- [ ] Delete `features/dock/full-screen-notes.tsx`
- [ ] Remove dead `note-card` / `note-list` if unused
- [ ] Commit: `improve(notes): unify dock and header all-notes entry`

### Task 6: Verify

- [ ] `pnpm lint`
- [ ] `pnpm build`
- [ ] Manual checklist from spec acceptance criteria

---

## Acceptance (from spec)

1. Header and dock open the same all-notes UI  
2. List shows formatted content  
3. List click → detail only  
4. Edit only from detail  
5. Verse panel same model  
6. No dual FullScreenNotes path  
