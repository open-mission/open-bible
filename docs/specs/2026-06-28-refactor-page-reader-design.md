# Refactor: page.tsx, reader.tsx, and related components

## Goal

Separate concerns between `app/page.tsx` (layout orchestration) and `components/reader.tsx` (bible reading), eliminate duplicated utilities across the codebase, and extract a reusable resizable panel layout component (`PanelLayout`) independent of business logic.

## Current problems

### Duplicated code

1. **`parseVerseId`** — identical function defined in `secondary-sidebar.tsx:31` and `note-editor-dialog.tsx:19`
2. **`HIGHLIGHT_HEX` map + resolution** — duplicated in `secondary-sidebar.tsx:19-28` and `verse-row.tsx:6-16` with slightly different interfaces (`resolveHighlightHex` vs `resolveHex`)
3. **`try/catch` localStorage patterns** — repeated 5+ times across page.tsx, bible-version-context.tsx, store.ts

### `app/page.tsx` (347 lines)

- Manages 13 `useState` calls for book, chapter, reader-mode, sidebar open/collapsed, inspector, secondary sidebar, nav, dialogs
- 3 separate `useEffect` blocks for localStorage persistence (book, chapter, reader-mode) with duplicated try/catch
- Mixes layout concerns (ResizablePanelGroup, sidebar panels) with state orchestration
- `EmptyReader` component is inlined at bottom of file

### `components/reader.tsx` (250 lines)

- Mixes navigation bar, chapter header, verse rendering, multi-select, and chapter footer
- Could benefit from extracting sub-components for readability and reuse

---

## New files

### `lib/verse-utils.ts`

Shared utilities to eliminate duplication:

```ts
export const HIGHLIGHT_HEX: Record<string, string> = {
  amber: "#f5c842",
  green: "#6aba7a",
  blue: "#6aabd2",
  rose: "#e87b8c",
}

export function resolveHighlightHex(h: { color: string; customHex?: string }): string
export function parseVerseId(verseId: string): { bookId, book, chapter, verse, text } | null
```

### `lib/use-reader-position.ts`

Custom hook that consolidates the 3 localStorage persistence effects from page.tsx:

```ts
export function useReaderPosition() {
  return {
    selectedBookId: string | null,
    setSelectedBookId: (id: string | null) => void,
    selectedChapter: number | null,
    setSelectedChapter: (ch: number | null) => void,
    readerMode: "wide" | "readable",
    setReaderMode: (mode: "wide" | "readable") => void,
  }
}
```

Handles restore on mount + persist on change internally.

### `lib/use-panel-state.ts`

Custom hook that centralizes sidebar/inspector state management:

```ts
export function usePanelState() {
  return {
    sidebarOpen, setSidebarOpen,
    sidebarCollapsed, setSidebarCollapsed,
    inspectorOpen, setInspectorOpen,
    secondarySidebarOpen, secondarySidebarTab, handleSecondaryClose,
    activeNav, handleNavClick,
  }
}
```

### `components/panel-layout.tsx` — Reusable panel layout

**Generic, business-logic-free** resizable panel layout component. No imports from bible-specific code.

#### Props

```ts
interface PanelLayoutProps {
  left?: React.ReactNode
  leftDefaultSize?: number
  leftMinSize?: number
  leftMaxSize?: number
  leftCollapsible?: boolean
  main: React.ReactNode
  mainMinSize?: number
  right?: React.ReactNode
  rightDefaultSize?: number
  rightMinSize?: number
  rightMaxSize?: number
  rightCollapsible?: boolean
  className?: string
}
```

- `left`, `main`, `right` — slot-based API for panel content
- When `left` or `right` is `undefined`/`null`, that panel is not rendered
- `leftCollapsible` / `rightCollapsible` — whether the panel can auto-collapse when resized to 0
- Uses existing `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle` from `ui/resizable`

#### Usage in page.tsx

```tsx
<PanelLayout
  left={secondarySidebarOpen ? <SecondarySidebar ... /> : undefined}
  leftDefaultSize={20}
  leftCollapsible
  main={
    <div className="flex flex-col h-full">
      <Reader ... />
    </div>
  }
  right={inspectorOpen ? <InspectorPanel ... /> : undefined}
  rightDefaultSize={30}
  rightCollapsible
/>
```

### `components/reader-empty.tsx`

Extract `EmptyReader` from `page.tsx`:

```ts
interface ReaderEmptyProps {
  onOpenSidebar: () => void
}
```

### `components/reader-header.tsx`

Extract navigation bar from `reader.tsx:115-168`:

```ts
interface ReaderHeaderProps {
  book: { name: string }
  chapter: number
  readerMode: "wide" | "readable"
  isInspectorOpen: boolean
  onBookChapterClick: () => void
  onToggleReaderMode: () => void
  onInspectorToggle: () => void
}
```

### `components/reader-chapter-nav.tsx`

Extract chapter navigation footer from `reader.tsx:226-247`:

```ts
interface ReaderChapterNavProps {
  book: { name: string; chapters: number }
  chapter: number
  onPrevChapter: () => void
  onNextChapter: () => void
}
```

---

## Modified files

### `app/page.tsx` — Simplified (~80 lines)

Becomes pure orchestration:

1. Uses `useReaderPosition()` for book/chapter/readerMode
2. Uses `usePanelState()` for sidebar/inspector state
3. Renders `AppSidebar` + `PanelLayout` + dialogs
4. Passes callbacks to sub-components

No more inline `useEffect` for localStorage. No more ResizablePanelGroup.

### `components/reader.tsx` — Cleaner (~120 lines)

- Uses `<ReaderHeader>`, `<ReaderChapterNav>` sub-components
- Multi-select bar stays inline (~14 lines, too small to extract)
- Focuses only on verse list rendering and multi-select logic

### `components/verse-row.tsx`

- Remove local `HIGHLIGHT_HEX` and `resolveHex`
- Import from `lib/verse-utils`

### `components/secondary-sidebar.tsx`

- Remove local `parseVerseId`, `HIGHLIGHT_HEX`, `resolveHighlightHex`
- Import from `lib/verse-utils`

### `components/note-editor-dialog.tsx`

- Remove local `parseVerseId`
- Import from `lib/verse-utils`

---

## File summary

| File | Action | Lines (approx) |
|------|--------|----------------|
| `lib/verse-utils.ts` | new | ~30 |
| `lib/use-reader-position.ts` | new | ~40 |
| `lib/use-panel-state.ts` | new | ~45 |
| `components/panel-layout.tsx` | new | ~60 |
| `components/reader-empty.tsx` | new | ~25 |
| `components/reader-header.tsx` | new | ~55 |
| `components/reader-chapter-nav.tsx` | new | ~35 |
| `app/page.tsx` | rewrite | ~80 |
| `components/reader.tsx` | refactor | ~120 |
| `components/verse-row.tsx` | minor edit | remove ~10 |
| `components/secondary-sidebar.tsx` | minor edit | remove ~15 |
| `components/note-editor-dialog.tsx` | minor edit | remove ~10 |

**Net effect:** ~470 lines across 12 files vs. ~600 lines across 4 files. More modular, more maintainable, zero duplication.

---

## Constraints

- No new libraries
- Follow existing code conventions (portuguese UI strings, `"use client"`, tailwind classes)
- All new components are client components (`"use client"`)
- `PanelLayout` has zero business logic imports — only UI primitives (`ResizablePanelGroup`, etc.)
- Keep existing behavior identical — pure refactor, no feature changes
