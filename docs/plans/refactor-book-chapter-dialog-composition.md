# Refactoring Plan: BookChapterDialog Composition Pattern

**Date:** 2026-07-02
**File:** `features/bible-reader/components/book-chapter-dialog.tsx`
**Pattern Reference:** `features/bible-reader/components/version-picker/version-picker-dialog.tsx`

## Goal

Refactor the monolithic `BookChapterDialog` component (349 lines) into composable sub-components following the same pattern used in `VersionPickerDialog` (lines 173-177).

## Current Structure

The current component has:
- All state management in one place
- Internal sub-components (`BookSection`, `BookButton`, `DesktopDialog`) not exported
- Mixed concerns: search, book selection, chapter selection, version switching

## Target Structure

Extract into composable sub-components with static property attachment:

```
BookChapterDialog (main orchestrator)
├── BookChapterDialog.Overlay (desktop overlay)
├── BookChapterDialog.SearchHeader (search + version dropdown)
├── BookChapterDialog.BookList (book grid with sections)
└── BookChapterDialog.ChapterGrid (chapter bingo card)
```

## Sub-Components to Extract

### 1. `BookChapterDialogOverlay` (replaces `DesktopDialog`)
- **Lines:** 335-349
- **Props:** `{ open: boolean, onClose: () => void, children: React.ReactNode }`
- **Behavior:** Renders fixed overlay with backdrop blur for desktop
- **Reference:** `VersionPickerOverlay` (version-picker-dialog.tsx:21-27)

### 2. `BookChapterDialogSearchHeader`
- **Lines:** 106-173
- **Props:** `{ query: string, onQueryChange: (q: string) => void, versionAbbreviation?: string, onClose: () => void }`
- **Behavior:** Search input + version dropdown popover + close button
- **Internal state:** `versionDropdownOpen` (local to this sub-component)

### 3. `BookChapterDialogBookList`
- **Lines:** 184-212
- **Props:** `{ books: Book[] | null, selectedBookId: string | null, onSelectBook: (id: string) => void }`
- **Behavior:** Renders book grid (filtered or by testament sections)
- **Internal components:** `BookSection`, `BookButton` (stay internal)

### 4. `BookChapterDialogChapterGrid`
- **Lines:** 216-257
- **Props:** `{ book: Book, selectedChapter: number | null, selectedBookId: string | null, onSelectChapter: (ch: number) => void, onBack: () => void }`
- **Behavior:** Chapter bingo card grid with back button

## Backward Compatibility

- Public API (props interface) remains identical
- No changes needed in `app/page.tsx` (lines 169-177)
- Visual output and interaction flow unchanged

## Implementation Steps

1. Extract `BookChapterDialogOverlay` as named function
2. Extract `BookChapterDialogSearchHeader` as named function
3. Extract `BookChapterDialogBookList` as named function
4. Extract `BookChapterDialogChapterGrid` as named function
5. Refactor main `BookChapterDialog` to use sub-components
6. Add static property attachment at end of file
7. Verify usage in `app/page.tsx` unchanged

## Files to Modify

- `features/bible-reader/components/book-chapter-dialog.tsx` (single file refactoring)

## Verification

- Visual output unchanged
- Interaction flow unchanged
- Responsive behavior (mobile/desktop) unchanged
- No changes to `app/page.tsx` usage
