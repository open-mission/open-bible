# Mobile UI Improvements — Design Spec

## Summary

Improve the mobile experience of the Open Bible web app by adding bottom sheets for version selectors and note editing, making the sidebar full-screen on mobile, adding sidebar resize (desktop), fixing a duplicate-note bug, and unifying note create/edit into a single dialog/bottom-sheet component.

## Components

### 1. `BottomSheet` (`components/ui/bottom-sheet.tsx`)

Reusable wrapper that renders a slide-up panel on mobile (`< md`) and a dialog overlay on desktop (`≥ md`).

**Props:**
- `open: boolean`
- `onClose: () => void`
- `children: React.ReactNode`
- `fullScreen?: boolean` — if true, the sheet fills the viewport height (used for note editor on mobile)

**Behavior (mobile):**
- Fixed position at bottom of screen
- Slide-up animation via `tw-animate-css` (`animate-in slide-in-from-bottom`)
- Backdrop with `bg-foreground/20 backdrop-blur-sm`
- `overscroll-behavior: contain`
- Close on backdrop click

**Behavior (desktop):**
- Renders a centered dialog overlay (similar to shadcn Dialog)
- Used by NoteEditorDialog only
- For version selectors, desktop mode renders nothing (original dropdown stays)

### 2. `NoteEditorDialog` (`components/note-editor-dialog.tsx`)

Replaces `NotesPanel` entirely and replaces the "new"/"detail" views in the sidebar's Notes tab.

**Props:**
- `verseIds: string[]`
- `noteId: string | null`
- `onSave: (noteId, content, verseIds) => void`
- `onDelete: (noteId) => void`
- `onClose: () => void`

**Behavior:**
- Uses `BottomSheet` internally (mobile = bottom sheet fullScreen, desktop = dialog)
- All create/edit note actions go through this one component — there is no other code path
- Sidebar Notes tab: becomes a list-only view; "Nova nota" button opens NoteEditorDialog
- Reader toolbar "Nota" button opens NoteEditorDialog

### 3. Sidebar Resize Handle

**Implementation:**
- A 4px-wide `<div>` handle on the right edge of `<aside>` (desktop only)
- `onMouseDown` → attach `onMouseMove` on `document` → `onMouseUp` detaches
- Min width: 240px, max width: 480px
- Width persisted to `localStorage('openbible:sidebar-width')`
- The `<aside>` uses inline style `width: ${sidebarWidth}px`
- Only visible/enabled on `md:` breakpoint

### 4. Mobile Sidebar Full-screen

- Change `<div className="relative z-50 w-72 ...">` to `<div className="relative z-50 w-full max-w-sm ...">` in sidebar.tsx mobile drawer

### 5. Version Selectors → Bottom Sheet (mobile)

- `ReaderVersionBadge`:
  - Mobile: wrap the dropdown options inside `<BottomSheet>`
  - Desktop: keep existing dropdown intact
- `BibleVersionSelector`:
  - Mobile: wrap the list of options inside `<BottomSheet>`
  - Desktop: keep existing dropdown

Both use a `useMediaQuery` check (`matches`) to decide at render time, or use CSS-based conditional rendering (`hidden md:block` / `block md:hidden`). Prefer the CSS approach to avoid hydration mismatch.

## Data Flow — Note Creation

1. User clicks "Nota" on toolbar OR "Nova nota" in sidebar
2. `reader.tsx` / `sidebar.tsx` calls `setNoteDialog({ verseIds, noteId })`
3. `<NoteEditorDialog>` renders at app level (or in page.tsx)
4. User types content, clicks Save
5. Calls `upsertNote(noteId, content, verseIds)` — always the same function
6. Dialog closes

## Media Query Hook

A small `useIsMobile()` hook is needed so that `BottomSheet` and the version selectors can conditionally render different JSX trees. Implementation: `lib/use-media-query.ts` using `window.matchMedia('(max-width: 767px)')`.

## Bug Fix — Duplicate Notes

Root cause: Two independent `useNotes()` hook instances (sidebar + reader) each calling `saveToStorage` + dispatching cross-instance sync events could produce duplicates.

Fix: The unification eliminates the duplicate code path. `NoteEditorDialog` is the sole entry point for note creation/editing.

## Files Changed

| File | Change |
|------|--------|
| `components/ui/bottom-sheet.tsx` | **NEW** — reusable BottomSheet component |
| `components/note-editor-dialog.tsx` | **NEW** — unified note editor |
| `components/reader-version-badge.tsx` | Modify — use BottomSheet for mobile |
| `components/bible-version-selector.tsx` | Modify — use BottomSheet for mobile |
| `components/sidebar.tsx` | Modify — remove new/detail views, add list-only; full-screen mobile; resize handle |
| `components/reader.tsx` | Modify — replace NotesPanel with NoteEditorDialog |
| `lib/store.ts` | Review — confirm no duplicate-save edge case remains |
| `lib/use-media-query.ts` | **NEW** — `useIsMobile()` hook |
| `app/page.tsx` | Lifts note dialog state to page level; renders `<NoteEditorDialog>` |

## Acceptance Criteria

1. On mobile (`< 768px`):
   - Version selectors open as bottom sheets
   - Note editor opens as full-screen bottom sheet
   - Sidebar fills the whole screen (w-full max-w-sm instead of w-72)
2. On desktop (`≥ 768px`):
   - Version selectors remain dropdowns
   - Note editor opens as a centered dialog
   - Sidebar is resizable via drag handle (240-480px range)
3. No duplicate notes are created regardless of how the user enters the note flow
4. All existing functionality (highlighting, note linking, theme toggling) remains intact
