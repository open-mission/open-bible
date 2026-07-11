# Apple Notes–Style Notes UX — Design Spec

**Date:** 2026-07-11  
**Type:** improve  
**Status:** approved (design dialogue)

## Summary

Unify all note access points into a single Apple Notes–style experience:
list → read detail → edit only via explicit Edit action. The list always shows
formatted note content (TipTap HTML via `NoteRenderer`), never plain stripped
text as the primary UI. Dock, reader header, and mobile FAB open the same
shell; the per-verse notes panel uses the same navigation model.

## Goals

1. **Lista → detalhe → editar** — clicking a note opens a full read view;
   Edit opens the TipTap editor; Back returns to the list.
2. **Formatted list previews** — every list row renders rich text with
   line-clamp (no `stripHtml` for display; strip only for search filtering).
3. **Single entry experience** — header “Notas”, desktop bottom dock, and
   mobile notes FAB all open the same `NotesBrowser` in `mode="all"`.
4. **Aligned verse panel** — selecting “Nota” / verse note indicator uses
   the same list/detail/edit/compose model scoped to the verse target.
5. **shadcn/ui composition** — Sheet, BottomSheet, Button, Empty, Separator,
   InputGroup, ScrollArea as appropriate; Tabler icons with `data-icon`.

## Non-Goals

- URL / deep-link state for notes
- Cloud sync, folders, tags, pinning
- Schema migrations on `notes` / `note_references`
- Changing highlight UX (dock highlights remain separate)
- AI, collaboration, version history

## Current Problems

| Surface | Issue |
|---------|--------|
| `AllNotesSheet` | Collapsed preview is plain text (`stripHtml`); expand-in-card + inline edit |
| `FullScreenNotes` (dock) | Click opens **verse** notes panel, not the note detail |
| Dual open state in `reader.tsx` | `showAllNotes` vs `dockView === "notes"` diverge |
| `NoteCard` / verse panel | Edit/delete inline; no dedicated read → edit step |

## Navigation Model

```
list  ──click note──►  detail  ──Edit──►  edit
  ▲                      │                  │
  └──────── Back ────────┘                  │
  └──────── Save / Cancel ──────────────────┘
  └──────── New note (target mode only) ──► compose
```

| View | Content | Primary actions |
|------|---------|-----------------|
| `list` | Search + cards with formatted preview | Open detail; (target) New note → `compose` |
| `detail` | Full `NoteRenderer` + bible reference(s) | Back, Edit, Delete |
| `edit` | `NoteEditor` with draft | Cancel (discard draft), Save |
| `compose` | Empty `NoteEditor` (target mode) | Cancel, Save (create) |

Closing the shell (Sheet dismiss / dock close / panel close) resets to `list`
and clears selection.

## Architecture

### Core shell: `NotesBrowser`

```
features/notes/components/notes-browser.tsx
```

Props (conceptual):

```ts
type NotesBrowserMode = "all" | "target"

interface NotesBrowserProps {
  mode: NotesBrowserMode
  /** When mode === "target", filter + create against this range */
  target?: NoteTarget | null
  /** Optional: controlled open handled by parent wrappers */
  onRequestClose?: () => void
  /** Compact header when embedded in side panel */
  embedded?: boolean
  className?: string
}
```

Internal state:

- `view: "list" | "detail" | "edit" | "compose"`
- `selectedId: string | null`
- `draft: string` (edit/compose only)
- `query: string` (list search, mode `all` and optionally target)

Data:

- `mode === "all"` → `useAllNotes(true)` (or parent-gated `enabled`)
- `mode === "target"` → `useNotes(target)` + reference header / verse preview
  (reuse existing `NotesPanel` load-preview logic)

Mutations: existing `useNoteMutations` (`createNote`, `updateNote`, `deleteNote`).

### Child components

| File | Responsibility |
|------|----------------|
| `note-list-item.tsx` | Card: reference label + `NoteRenderer` with `line-clamp-4` / max-height; click → detail |
| `note-detail.tsx` | Read-only full content; sticky action bar |
| `note-editor.tsx` | Unchanged TipTap editor (reuse) |
| `note-renderer.tsx` | Unchanged read-only TipTap |
| `notes-browser.tsx` | View state machine + layout chrome |
| `all-notes-sheet.tsx` | Thin shell: mobile `BottomSheet` / desktop `Sheet` wrapping `NotesBrowser mode="all"` |
| `notes-panel.tsx` | Desktop right panel: `NotesBrowser mode="target" embedded` |
| `note-sheet.tsx` | Mobile bottom sheet: `NotesBrowser mode="target" embedded` |

### Removed / deprecated

- `features/dock/full-screen-notes.tsx` — delete; dock uses the same
  full-screen presentation as header (see Entry Points).
- Inline expand/edit paths inside `AllNotesSheet` `NoteSummaryCard` — gone.
- `NoteCard` inline edit as the primary path — either remove or reimplement
  as a thin list-item used only if still needed; prefer `note-list-item` +
  browser navigation.

### Shared helpers

- Keep a private `stripHtml` (or extract to `features/notes/utils/html.ts`)
  **only** for search filtering and empty checks.
- `referenceLabel(entry)` shared for list + detail headers.

## Entry Points (single experience)

| Entry | Opens |
|-------|--------|
| Reader header “Notas” | `NotesBrowser` `mode="all"` (responsive shell) |
| Desktop bottom dock “Notas” | **Same** shell as header (full-screen overlay on desktop) |
| Mobile FAB notes (if present) | Same as header |
| Verse selection “Nota” / verse note badge | `NotesBrowser` `mode="target"` (desktop right panel / mobile sheet) |

### Reader wiring (`reader.tsx`)

Replace dual state:

```ts
// remove: showAllNotes + dockView === "notes" split for notes
const [allNotesOpen, setAllNotesOpen] = useState(false)
// dock for highlights may remain separate
const [dockView, setDockView] = useState<"highlights" | null>(null)
```

- Header `onShowAllNotes` → `setAllNotesOpen(true)`
- Dock “notes” → `setAllNotesOpen(true)` (not a second UI)
- One mounted shell for all notes (full-screen on desktop when desired,
  Sheet/BottomSheet on mobile — match existing responsive patterns of
  `AllNotesSheet` but with browser inside)

Optional: desktop “full-screen” vs right `Sheet` — pick **one** presentation
for `mode="all"` on desktop:

- **Preferred:** full-screen overlay (current dock feel) for both header and
  dock, so the two entries feel identical.
- Mobile: full-height `BottomSheet` (current `AllNotesSheet` mobile path).

## List UI (formatted previews)

```tsx
// note-list-item — conceptual
<button type="button" onClick={onOpen} className="... text-left">
  <span className="text-xs font-semibold text-muted-foreground">
    {referenceLabel(entry)}
  </span>
  <div className="mt-2 line-clamp-4 overflow-hidden">
    <NoteRenderer html={entry.note.content} />
  </div>
</button>
```

- Empty content → muted italic “Nota sem texto”.
- Multi-reference → small secondary line (`Vinculada a N referências`).
- No edit controls on the list row (Apple Notes: open first, then edit).
- Empty list → shadcn `Empty` (or existing empty copy if `Empty` not wired yet).

## Detail & Edit UI

**Detail**

- Header: Back, title = reference label, Edit + Delete icon buttons.
- Body: scrollable `NoteRenderer` full content.
- Delete: confirm (`window.confirm` OK for parity, or `AlertDialog` if already
  used nearby) → `deleteNote` → back to list + reload.

**Edit**

- Same header chrome with Cancel / Save.
- `NoteEditor` bound to `draft`; init from `note.content` when entering edit.
- Save → `updateNote` → `detail` with refreshed content.
- Cancel → discard draft → `detail`.

**Compose** (target mode only)

- Enter from list “Adicionar nota”.
- Save → `createNote({ target, content })` → list (or detail of new note).
- Reject empty HTML (`<p></p>`) with sonner toast (existing behavior).

## Verse panel specifics (`mode="target"`)

- Header shows book/chapter/verse label + optional verse text preview
  (logic already in `notes-panel.tsx`).
- List shows only notes for that target range.
- No global search required (optional local filter is fine to skip).
- Close via existing `closeNotePanel`.

## shadcn / UI rules (project)

- Icons: `@tabler/icons-react`; in `Button`, use `data-icon="inline-start"` /
  `inline-end`; no manual `size-*` on icons inside buttons when the component
  handles sizing (match existing notes files that already use size classes if
  needed for consistency with current notes UI — prefer project button
  conventions).
- Spacing: `flex` + `gap-*`, never `space-y-*`.
- Semantic colors only (`bg-background`, `text-muted-foreground`, etc.).
- Overlays: `Sheet` / `BottomSheet` / full-screen `fixed inset-0` without
  manual z-index fights; follow existing reader z-stack.

## Data layer

No schema changes. Reuse:

- `database.notes` / `database.noteReferences`
- `useAllNotes`, `useNotes`, `useNoteMutations`
- Types `AllNoteEntry`, `NoteWithRefs`, `NoteTarget`

## Testing / verification

Project has limited automated UI tests. Per task:

1. `pnpm lint`
2. Manual: open notes from header, dock, verse panel — same list→detail→edit
3. Manual: bold/italic/lists visible in list clamp and detail
4. Manual: create from verse panel, edit from detail, delete returns to list
5. `pnpm build` before PR

## Acceptance Criteria

1. Header “Notas” and desktop dock “Notas” open the **same** all-notes UI.
2. List rows show **formatted** content (not plain stripped text).
3. Clicking a list row opens **detail** (read-only), not the editor and not
   the verse panel alone.
4. Edit is only available from detail (or explicit Edit control), not from
   list click.
5. Save/Cancel from edit return to detail (or list after delete).
6. Verse notes panel uses the same list → detail → edit → compose model.
7. `FullScreenNotes` dual path removed; no divergent all-notes UIs remain.
8. No regressions to offline notes storage or TipTap toolbar features.

## File map (implementation)

| Action | Path |
|--------|------|
| Create | `features/notes/components/notes-browser.tsx` |
| Create | `features/notes/components/note-list-item.tsx` |
| Create | `features/notes/components/note-detail.tsx` |
| Create | `features/notes/utils/html.ts` (stripHtml / isEmptyHtml) |
| Rewrite | `features/notes/components/all-notes-sheet.tsx` |
| Rewrite | `features/notes/components/notes-panel.tsx` |
| Rewrite | `features/notes/components/note-sheet.tsx` (if needed) |
| Update | `features/notes/components/note-card.tsx` / `note-list.tsx` (slim or remove if unused) |
| Update | `features/bible-reader/components/reader.tsx` (unify open state) |
| Update | `features/dock/bottom-dock.tsx` (only if prop typing needs notes-only change) |
| Delete | `features/dock/full-screen-notes.tsx` |

## Risks

- **Many TipTap instances** in a long list: each `NoteRenderer` mounts an
  editor. Mitigate with line-clamp + lazy mount (render plain fallback only if
  perf issues) or a lightweight HTML sanitizer display later. Start with
  current `NoteRenderer`; optimize only if jank appears.
- **Focus / autofocus** when switching views — set `autoFocus` only on
  edit/compose.
- **Dock + sheet z-index** — keep one open notes surface at a time.
