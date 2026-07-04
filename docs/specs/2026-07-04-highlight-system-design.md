# Highlight System — Design Spec

> **Issue:** [#81 — feat: Highlight System](https://github.com/open-mission/open-bible/issues/81)
> **Date:** 2026-07-04
> **Status:** Approved

## Goal

Implement a complete highlight system for Bible study that supports multiple highlights per verse, categories/tags, optional note association, and a fast inline creation flow — all stored locally in SQLite WASM (OPFS).

## Architecture

Highlights are first-class entities in the user database (`app.db`), separate from verse data. A `highlights` table stores metadata (color, category, note reference), and a `highlight_verses` table maps highlights to specific verses. This allows multiple highlights per verse and multi-verse highlights.

The UI follows a progressive disclosure pattern: quick inline color selection from the verse selection popover, with a full editor available via bottom sheet (mobile) or dialog (desktop) when clicking the visual indicator on a verse.

## Data Model

### `highlight_categories` table

```sql
CREATE TABLE highlight_categories (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
);
```

- Global categories (not tied to Bible version)
- User creates them as needed via autocomplete input
- No predefined categories — empty on first use

### `highlights` table

```sql
CREATE TABLE highlights (
  id TEXT PRIMARY KEY NOT NULL,
  color TEXT NOT NULL,
  category_id TEXT,
  note_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (category_id) REFERENCES highlight_categories(id) ON DELETE SET NULL,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE SET NULL
);
```

- `color`: one of `"amber"` | `"green"` | `"blue"` | `"rose"` (predefined) or a hex string for custom colors
- `category_id`: nullable FK to `highlight_categories`
- `note_id`: nullable FK to `notes` (future extensibility)

### `highlight_verses` table

```sql
CREATE TABLE highlight_verses (
  id TEXT PRIMARY KEY NOT NULL,
  highlight_id TEXT NOT NULL,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  bible TEXT NOT NULL,
  FOREIGN KEY (highlight_id) REFERENCES highlights(id) ON DELETE CASCADE
);

CREATE INDEX idx_highlight_verses_lookup
  ON highlight_verses (book, chapter, verse, bible);
```

- Links a highlight to one or more verses
- `bible` is the version id (e.g., `"ara"`)
- Composite index for efficient chapter-level lookups
- `ON DELETE CASCADE`: deleting a highlight removes all its verse associations

### Relationships

```
highlight_categories  1 ──< N  highlights  N >──<  highlight_verses
                         (category_id)              (highlight_id)
                                │
                                │ note_id (nullable)
                                ▼
                              notes
```

## Colors

### Predefined palette

| Name   | CSS Variable              | Tailwind Class            |
|--------|---------------------------|---------------------------|
| amber  | `var(--highlight-amber)`  | `bg-highlight-amber`      |
| green  | `var(--highlight-green)`  | `bg-highlight-green`      |
| blue   | `var(--highlight-blue)`   | `bg-highlight-blue`       |
| rose   | `var(--highlight-rose)`   | `bg-highlight-rose`       |

These tokens are already defined in `globals.css` and `theme-provider.tsx` across all palettes (default light/dark, dracula, gruvbox).

### Custom colors

- User can pick any color via a color picker
- Stored as hex string (e.g., `"#ff5733"`)
- Rendered directly as `backgroundColor` inline style

### Color map utility

`highlight-colors.ts` maps color names/keys to CSS custom properties:

```ts
export const HIGHLIGHT_COLORS = {
  amber: "var(--highlight-amber)",
  green: "var(--highlight-green)",
  blue: "var(--highlight-blue)",
  rose: "var(--highlight-rose)",
} as const

export type HighlightColorKey = keyof typeof HIGHLIGHT_COLORS
export type HighlightColor = HighlightColorKey | string // string = custom hex
```

## Component Architecture

All components follow the Composition Pattern (static sub-components).

### `HighlightMenu` — Quick creation from selection popover

Replaces the disabled "Destaque" button in `VerseSelectionPopover`.

```
HighlightMenu
├── HighlightMenu.Trigger     — Button that opens the inline color selector
├── HighlightMenu.Content     — Popover/dropdown with color grid
├── HighlightMenu.Colors      — 4 predefined color swatches
├── HighlightMenu.CustomColor — "Custom" option opens color picker
└── HighlightMenu.MoreOptions — "Mais opções" opens HighlightEditor
```

**Flow:**
1. User selects verses → popover appears → taps "Destaque"
2. `HighlightMenu.Content` opens inline with 4 color swatches + custom
3. Taps a color → highlight created instantly → popover closes
4. Taps "Mais opções" → opens `HighlightEditor`

### `HighlightEditor` — Full editing interface

Opens when clicking a highlight's visual indicator on a verse, or via "Mais opções" from `HighlightMenu`.

```
HighlightEditor
├── HighlightEditor.Header       — Title + close button
├── HighlightEditor.ColorPicker  — 4 predefined + custom color picker
├── HighlightEditor.CategoryInput — Autocomplete input for categories
├── HighlightEditor.NoteSelector — Placeholder for future note linking
├── HighlightEditor.Actions      — Delete button
└── HighlightEditor.Footer       — Save/close
```

**Mobile:** Rendered inside `BottomSheet` (Drawer via vaul)
**Desktop:** Rendered inside `Dialog` (@base-ui/react)

### `HighlightSidebar` — Visual indicator on verse

A thin colored bar (3px) on the left edge of a verse row.

- Single highlight: one colored bar
- Multiple highlights: multiple thin bars side by side (max 4 visible)
- 4th+ highlights: shows `+N` badge
- Click on a bar: opens `HighlightEditor` for that specific highlight
- If verse has >4 highlights: clicking opens a `BottomSheet`/`Drawer` listing all highlights as cards

### `HighlightCategoryInput` — Category autocomplete

- Text input with dropdown showing matching categories
- Typing filters existing categories
- If no match: shows "Criar '{input}'?" button
- Selecting a category sets it on the highlight
- Categories are stored globally, not per Bible version

## File Structure

```
features/highlights/
├── components/
│   ├── highlight-menu.tsx
│   ├── highlight-editor.tsx
│   ├── highlight-sidebar.tsx
│   └── highlight-category-input.tsx
├── hooks/
│   ├── use-highlights.ts
│   └── use-highlight-mutations.ts
├── context/
│   └── highlights-context.tsx
└── utils/
    └── highlight-colors.ts

lib/database/user/
├── schema.ts                    — Add highlights, highlight_verses, highlight_categories tables
├── migrations/index.ts          — Add 0002_highlights migration
└── repositories/
    ├── highlightsRepository.ts
    ├── highlightVersesRepository.ts
    └── highlightCategoriesRepository.ts
```

## Data Flow

### Loading highlights for a chapter

```
Reader mounts
  → useHighlights(bookId, chapter, versionId)
  → highlightsContext.getHighlights(bookId, chapter, versionId)
  → database.highlightVerses.listByChapter(book, chapter, bible)
  → JOIN with highlights + highlight_categories
  → Returns Map<string, HighlightData[]>  (verseId → highlights[])
  → Passed to VerseRow as prop
```

### Quick creation (from selection popover)

```
User selects verses → taps "Destaque" → HighlightMenu opens
  → picks color → handleCreateHighlight(color)
  → database.highlights.create({ color, categoryId: null, noteId: null })
  → For each selected verse:
      database.highlightVerses.add({ highlightId, book, chapter, verse, bible })
  → Refresh highlights map → close popover
```

### Editing

```
User clicks sidebar bar → HighlightEditor opens (BottomSheet/Dialog)
  → loads highlight data (color, category, note)
  → user edits → saves
  → database.highlights.update(id, { color, categoryId })
  → Refresh highlights map
```

### Deletion

```
HighlightEditor → "Excluir" → confirmation
  → database.highlights.delete(id)  — cascades to highlight_verses
  → Refresh highlights map
```

## Verse Rendering

### `VerseRow` changes

Current `VerseRow` receives `isActive` and `isSelected`. Add:

```ts
interface VerseRowProps {
  verse: Verse
  isActive: boolean
  isSelected?: boolean
  highlights?: HighlightData[]  // NEW
  verseSpacing?: "small" | "medium" | "large"
}
```

### Visual rendering

```tsx
<div className="flex">
  {/* Highlight sidebar indicators */}
  {highlights && highlights.length > 0 && (
    <div className="flex shrink-0 w-1 gap-px mr-2">
      {highlights.slice(0, 4).map((h) => (
        <div
          key={h.id}
          className="w-1 rounded-full cursor-pointer hover:opacity-80"
          style={{ backgroundColor: getColorValue(h.color) }}
          onClick={(e) => { e.stopPropagation(); onHighlightClick(h.id) }}
        />
      ))}
      {highlights.length > 4 && (
        <span className="text-[10px] text-muted-foreground">
          +{highlights.length - 4}
        </span>
      )}
    </div>
  )}
  {/* Existing verse number + text */}
</div>
```

## UX Principles

1. **Reading First**: Highlights enhance reading, never block it. Visual indicators are subtle.
2. **Progressive Disclosure**: Quick color pick → full editor only when needed.
3. **Fast by Default**: Creating a highlight takes 2 taps (select → color).
4. **Advanced When Needed**: Category, note association, delete available in editor.

## Acceptance Criteria

- [ ] Users can highlight one verse
- [ ] Users can highlight multiple verses (same highlight)
- [ ] Highlights are created instantly (< 2 taps)
- [ ] Four predefined colors available (amber, green, blue, rose)
- [ ] Custom color supported via color picker
- [ ] Highlights persist in `app.db` (SQLite WASM OPFS)
- [ ] Highlights are restored on page load
- [ ] Multiple highlights may exist on the same verse
- [ ] Visual indicator (colored sidebar bar) shown on highlighted verses
- [ ] Categories are available as autocomplete tags
- [ ] Categories can be created inline during highlight editing
- [ ] Existing highlights can be edited (color, category)
- [ ] Existing highlights can be deleted
- [ ] Desktop uses Dialog for advanced editing
- [ ] Mobile uses Bottom Sheet for advanced editing
- [ ] Components follow Composition Pattern (static sub-components)
- [ ] 4+ highlights on a verse: click opens sheet with all highlights as cards
