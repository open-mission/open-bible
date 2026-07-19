# Highlight Gutter Indicators — Implementation Plan

**Date:** 2026-07-19
**Spec:** [2026-07-19-highlight-gutter-indicators-design.md](../specs/2026-07-19-highlight-gutter-indicators-design.md)
**Goal:** Replace inline highlight dots (`HighlightSidebar`) with a left-side gutter showing bracket lines, colored dots, and a detail popover — activating highlights colors the verse text.
**Architecture:** 3 new components + context expansion + VerseRow layout change. No DB migrations.
**Tech Stack:** React 19, Tailwind v4, @base-ui/react Popover, existing highlight neon color utils.

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `features/highlights/context/highlights-context.tsx` | Modify | Add `activeHighlightId` + `setActiveHighlightId` to context |
| `features/highlights/components/highlight-popover.tsx` | Create | Popover with highlight details + edit/delete |
| `features/highlights/components/gutter-indicator.tsx` | Create | Single bracket line + dot for one highlight |
| `features/highlights/components/highlight-gutter.tsx` | Create | Container that renders GutterIndicators for a verse |
| `features/bible-reader/components/verse-row.tsx` | Modify | Replace HighlightSidebar with HighlightGutter, apply active text color |
| `features/bible-reader/components/reader.tsx` | Modify | Wire deactivation on outside click, remove HighlightSidebar import |
| `features/highlights/components/highlight-sidebar.tsx` | Delete | Replaced by gutter system |

## Tasks

### Task 1 — Expand HighlightsContext with active highlight state

**File:** `features/highlights/context/highlights-context.tsx`

- [ ] Add `activeHighlightId: string | null` state (default `null`)
- [ ] Add `setActiveHighlightId` setter to context value
- [ ] Update `HighlightsContextValue` interface
- [ ] Update `DEFAULT_CONTEXT` with `activeHighlightId: null, setActiveHighlightId: () => {}`
- [ ] Reset `activeHighlightId` to `null` when `bookId`, `chapter`, or `versionId` change (inside `loadHighlights`)

**Verify:** `pnpm lint`

---

### Task 2 — Create HighlightPopover component

**File:** `features/highlights/components/highlight-popover.tsx`

- [ ] Create component with props: `highlight: HighlightData`, `anchorEl: HTMLElement | null`, `open: boolean`, `onClose: () => void`, `onEdit: (highlightId: string) => void`, `onDelete: (highlightId: string) => void`, `verseReference: string`
- [ ] Use `@base-ui/react` Popover (same pattern as `HighlightColorPicker`)
- [ ] Layout:
  - Color dot (12px) + category pill (if set)
  - Verse reference text (e.g. "Salmos 118:1-2")
  - Content/annotation paragraph (if `highlight.content` is non-empty)
  - Footer row: "Editar" button + "Excluir" button
- [ ] "Excluir" calls `onDelete(highlight.highlight.id)` then `onClose()`
- [ ] "Editar" calls `onEdit(highlight.highlight.id)` then `onClose()`
- [ ] Styled with `bg-popover border border-border rounded-lg shadow-lg p-3` 
- [ ] Close on Escape and click outside

**Verify:** `pnpm lint`

---

### Task 3 — Create GutterIndicator component

**File:** `features/highlights/components/gutter-indicator.tsx`

- [ ] Props: `highlight: HighlightData`, `position: "single" | "top" | "middle" | "bottom"`, `lane: number` (0-based horizontal offset), `isActive: boolean`, `onActivate: (highlightId: string, anchorEl: HTMLElement) => void`
- [ ] Renders a `<div>` column with:
  - Vertical line segment based on `position`:
    - `single`: no vertical line, just the dot
    - `top`: line from dot center to bottom edge (with top-left border-radius corner)
    - `middle`: full vertical line (top edge to bottom edge)
    - `bottom`: line from top edge to dot center (with bottom-left border-radius corner)
  - Dot: `<button>` 8px circle, centered vertically, colored with `getNeonStyle(color).hex`
  - Active state: dot gets white ring + brighter glow
- [ ] Horizontal position: `left: lane * 10px` (each lane is 10px apart)
- [ ] Line color: `highlight.color` at 40% opacity (append `66` to hex)
- [ ] Dot click handler: `onActivate(highlight.highlight.id, e.currentTarget)`
- [ ] Dot hover: `hover:scale-125` transition

**Verify:** `pnpm lint`

---

### Task 4 — Create HighlightGutter component

**File:** `features/highlights/components/highlight-gutter.tsx`

- [ ] Props: `highlights: HighlightData[]`, `currentVerse: number`, `onEdit: (highlightId: string) => void`, `onDelete: (highlightId: string) => void`, `bookName: string`, `chapter: number`
- [ ] Reads `activeHighlightId` and `setActiveHighlightId` from `useHighlightsContext()`
- [ ] For each highlight in `highlights[]`:
  - Compute `position` by examining `highlight.verses[]` (sorted by verse number):
    - If only 1 verse → `"single"`
    - If current verse == min verse → `"top"`
    - If current verse == max verse → `"bottom"`
    - Otherwise → `"middle"`
  - Assign `lane` index (0, 1, 2...) based on order in the array
- [ ] Render `<div className="relative w-7 shrink-0 select-none">` containing all `GutterIndicator`s
- [ ] Track `popoverAnchor` ref for the active highlight's dot element
- [ ] Compute `verseReference` string for popover (e.g. "Salmos 118:1-2")
- [ ] Render `<HighlightPopover>` when `activeHighlightId` matches one of this verse's highlights and popover anchor is set
- [ ] `onActivate` handler: if clicking same highlight, do nothing (keep popover). If different, switch. Sets `activeHighlightId` in context.

**Verify:** `pnpm lint`

---

### Task 5 — Modify VerseRow to use HighlightGutter + active text color

**File:** `features/bible-reader/components/verse-row.tsx`

- [ ] Remove `HighlightSidebar` import
- [ ] Add `HighlightGutter` import
- [ ] Add props: `onEditHighlight`, `onDeleteHighlight`, `bookName`, `chapter`
- [ ] Read `activeHighlightId` from `useHighlightsContext()`
- [ ] Compute `activeColor`: if `activeHighlightId` is set AND one of this verse's highlights matches → use that highlight's color. Otherwise `undefined`.
- [ ] Change layout from:
  ```
  <div flex items-start>
    <sup> verse number </sup>
    <div flex-1 flex-col>
      <p> text </p>
      <HighlightSidebar />
      <notes badge />
    </div>
  </div>
  ```
  To:
  ```
  <div flex items-start>
    {highlights?.length > 0 && <HighlightGutter ... />}
    <sup> verse number </sup>
    <div flex-1 flex-col>
      <p style={{ color: activeColor, transition: "color 200ms ease" }}> text </p>
      <notes badge />
    </div>
  </div>
  ```
- [ ] Remove `onShowAll` prop (no longer needed)

**Verify:** `pnpm lint`

---

### Task 6 — Update Reader to wire gutter props + outside click deactivation

**File:** `features/bible-reader/components/reader.tsx`

- [ ] Remove `HighlightSidebar` references / unused `onShowAll` wiring
- [ ] Import `useHighlightsContext` (already imported) — use `setActiveHighlightId`
- [ ] In the `handlePointerUp` outside-click handler: add `setActiveHighlightId(null)` alongside clearing selection
- [ ] Add a separate effect: when clicking outside `[data-highlight-gutter]` and `[data-highlight-popover]`, deactivate highlight
- [ ] Pass `onEditHighlight={dockEditHighlight}` and `onDeleteHighlight={handleDeleteHighlight}` to each `<VerseRow>`
- [ ] Pass `bookName={book.name}` and `chapter={chapter}` to each `<VerseRow>`
- [ ] Update `onShowAll` removal in `<VerseRow>` calls

**Verify:** `pnpm lint`

---

### Task 7 — Delete HighlightSidebar

**File:** `features/highlights/components/highlight-sidebar.tsx`

- [ ] Delete the file
- [ ] Grep for any remaining imports of `highlight-sidebar` and remove them

**Verify:** `pnpm lint && pnpm build`

---

### Task 8 — Final verification + commit

- [ ] `pnpm lint` — all clean
- [ ] `pnpm build` — builds without errors
- [ ] Manual check in `pnpm dev`:
  - Gutter brackets appear for highlighted verses
  - Multiple highlights show parallel indicators
  - Click dot → text colors + popover shows
  - Click another dot → switches
  - Click outside → deactivates
  - Edit/Delete buttons work in popover
  - Mobile: gutter renders properly (28px is acceptable)
- [ ] Commit: `feat: replace highlight dots with lateral gutter bracket indicators`
