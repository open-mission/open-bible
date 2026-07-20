# Highlight Gutter Indicators — Design Spec

**Date:** 2026-07-19
**Status:** Draft — Awaiting approval
**Scope:** Replace `HighlightSidebar` (inline dots below verses) with lateral gutter indicators that visually connect highlighted verse ranges and allow interactive activation.

---

## 1. Problem

The current highlight visualization (`HighlightSidebar`) renders colored dots/pills **below** each verse's text. This approach:

- Doesn't visually communicate verse **ranges** (a highlight spanning vv. 1–3 shows three disconnected dots)
- Doesn't provide a spatial cue — dots compete with the notes badge for below-verse space
- Has no "active highlight" concept — you can't focus on one highlight to see which verses it covers

## 2. Goal

Implement a **gutter-based indicator system** on the left side of verses that:

1. Shows vertical bracket lines connecting verses covered by the same highlight
2. Displays a colored dot at the anchor point of each highlight
3. Supports multiple overlapping highlights on the same verse (parallel lines/dots)
4. On click: activates the highlight (colors the verse text) and shows a popover with details
5. Completely replaces the existing `HighlightSidebar` dots

## 3. UX Specification

### 3.1 Gutter Layout

```
┌─── gutter (28px) ───┐ ┌─── verse content ────────────────────┐
│  ┌ ●                │ │  ¹ Rendei graças ao SENHOR, porque    │
│  │                   │ │    ele é bom...                       │
│  └ ●                │ │  ² Diga, pois, Israel: Sim, a sua...  │
│    ●                 │ │  ³ Diga, pois, a casa de Arão...      │
│                      │ │  ⁴ Digam, pois, os que temem...       │
└──────────────────────┘ └──────────────────────────────────────┘
```

- **Position:** Left of the verse number, as a separate column
- **Width:** Fixed 28px gutter column (accommodates up to ~3 overlapping indicators)
- **Bracket lines:** Vertical lines connecting first-to-last verse of a highlight range
- **Dots (●):** 8px circles at the midpoint of each range bracket, colored with the highlight's `color`
- **Multiple overlapping:** Each highlight gets its own vertical lane (offset horizontally by ~8px)

### 3.2 Interaction — Click on Dot

When the user clicks a highlight dot:

1. **Activate highlight:** The text of all verses covered by that highlight transitions to the highlight's color (smooth `color` CSS transition, ~200ms ease)
2. **Show popover:** A popover appears anchored to the dot with:
   - Highlight color indicator (circle)
   - Category name (if set) — displayed as a pill/badge
   - Verse reference (e.g. "Salmos 118:1-2")
   - Personal note/annotation text (`highlight.content`) — if non-empty
   - "Editar" button → opens `HighlightEditor`
   - "Excluir" button → deletes highlight with confirmation
3. **Only one active at a time:** Clicking another dot deactivates the previous one

### 3.3 Deactivation

The active highlight deactivates (text returns to normal, popover closes) when:

- Clicking anywhere outside the popover and gutter
- Clicking another highlight's dot (switches to the new one)
- Clicking the close button inside the popover

Clicking the same dot again does **NOT** toggle off — it keeps the popover open.

### 3.4 Transitions

- **Text color:** `transition: color 200ms ease` on `<p>` verse text
- **Popover:** Standard shadcn/base-ui popover entry animation (fade + slight scale)
- **Dot hover:** Subtle scale (1.2x) + opacity increase on the glow

### 3.5 Visual Style

- **Bracket lines:** 1.5px solid, using `highlight.color` at 40% opacity
- **Bracket corners:** 3px border-radius on the top-left and bottom-left corners
- **Dots:** 8px solid circles with the highlight's neon glow (`getNeonStyle().glow`)
- **Active dot:** Brighter glow + white ring (2px)
- **Dark/light mode:** Colors work on both since neon hex values are self-contained

## 4. Architecture

### 4.1 Component Hierarchy (changes)

```
Reader
  └─ article (verse list)
       └─ VerseRow (per verse)
            ├─ HighlightGutter (NEW — replaces HighlightSidebar)
            │    ├─ GutterBracket (per highlight, vertical line + dot)
            │    └─ HighlightPopover (on active highlight)
            ├─ sup (verse number)
            └─ p (verse text — now receives active highlight color)
```

### 4.2 New Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| `HighlightGutter` | `features/highlights/components/highlight-gutter.tsx` | Container for gutter indicators. Receives `highlights: HighlightData[]`, current verse position, total chapter verse data to compute range extents. |
| `GutterIndicator` | `features/highlights/components/gutter-indicator.tsx` | Single vertical bracket line + dot. Handles click to activate. Renders bracket segments (top/middle/bottom/single). |
| `HighlightPopover` | `features/highlights/components/highlight-popover.tsx` | Popover anchored to dot. Displays highlight details + edit/delete actions. |

### 4.3 State Management

**New context addition** — `HighlightsContext` gets an `activeHighlightId` state:

```ts
interface HighlightsContextValue {
  highlightsByVerse: Map<string, HighlightData[]>
  loading: boolean
  refresh: () => Promise<void>
  activeHighlightId: string | null          // NEW
  setActiveHighlightId: (id: string | null) => void  // NEW
}
```

`VerseRow` reads `activeHighlightId` from context to apply text color when its verse is covered by the active highlight.

### 4.4 Data Flow for Gutter Rendering

The gutter needs to know a highlight's **position within its range** for the current verse. For a highlight covering vv. 2–4:

- Verse 2 renders bracket `top` (┌)
- Verse 3 renders bracket `middle` (│)
- Verse 4 renders bracket `bottom` (└)

This is computed in `HighlightGutter` by looking at `HighlightData.verses[]` (sorted by `verse` number) and comparing with the current verse number.

### 4.5 Files Modified

| File | Change |
|------|--------|
| `features/highlights/components/highlight-sidebar.tsx` | **DELETED** — replaced by `HighlightGutter` |
| `features/highlights/components/highlight-gutter.tsx` | **NEW** |
| `features/highlights/components/gutter-indicator.tsx` | **NEW** |
| `features/highlights/components/highlight-popover.tsx` | **NEW** |
| `features/highlights/context/highlights-context.tsx` | Add `activeHighlightId` + `setActiveHighlightId` |
| `features/bible-reader/components/verse-row.tsx` | Replace `HighlightSidebar` with `HighlightGutter`, apply text color for active highlight |
| `features/bible-reader/components/reader.tsx` | Remove `HighlightSidebar` import, wire gutter + deactivation on outside click |

### 4.6 No Database Changes

The existing schema (`highlights`, `highlight_verses`, `highlight_categories`) fully supports this feature. No migrations needed.

## 5. Constraints

- **No breaking changes** to highlight creation/editing flow (`HighlightMenu`, `HighlightEditor`, `HighlightColorPicker` remain unchanged)
- **Performance:** Gutter calculations are O(n) per verse where n = number of highlights on that verse (typically 0–3). No concern.
- **Mobile:** The 28px gutter is acceptable on mobile (verse text already has `px-4`). If the gutter feels tight, we can reduce to 20px with smaller dots (6px).
- **Accessibility:** Dots are `<button>` elements with `aria-label` describing the highlight. Popover is keyboard-navigable.

## 6. Out of Scope

- Drag-to-create highlights from the gutter
- Gutter-based highlight reordering
- Animated bracket drawing on highlight creation
- Highlight merging/splitting
