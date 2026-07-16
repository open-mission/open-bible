# Implementation Plan: Floating Verse Selection Popover

Align the selection popover dynamically with the selected verse(s) inside the active reader grid pane, minifying the toolbar into a sleek, floating pill with collision detection.

## Proposed Changes

### Bible Reader Component

#### [MODIFY] [reader.tsx](file:///Users/claudio/Projects/open-bible/features/bible-reader/components/reader.tsx)
- Add a ref `scrollContainerRef` to the scrolling content container `div` of `ReaderContent` and ensure it has the CSS class `relative`.
- Implement positioning state:
  ```typescript
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; position: "top" | "bottom" } | null>(null);
  ```
- Implement `useEffect` triggered by changes in `selectedVerseIds` to calculate the vertical bounds of the selected verses relative to the scrolling container and perform collision detection (top vs bottom placement).
- Pass the calculated position `top` and placement orientation (`"top"` or `"bottom"`) to the `VerseSelectionPopover` component.
- Move the `VerseSelectionPopover` render block inside the scrolling container (so it scrolls naturally with the text).

---

#### [MODIFY] [verse-selection-popover.tsx](file:///Users/claudio/Projects/open-bible/features/bible-reader/components/verse-selection-popover.tsx)
- Update `VerseSelectionPopoverProps` to accept `top: number` and `position: "top" | "bottom"`.
- Refactor the markup to be a compact, pill-shaped toolbar:
  - Apply `absolute` positioning, using `top`, `left: 50%`, and `transform: translateX(-50%)` to center it horizontally.
  - Simplify desktop and mobile designs into a unified, minified row:
    - Left side: Abbreviated book name (or full name if short) and verse indicator (e.g., `Gn 1:1` or `Gênesis 1:1`, and count badge if multiple).
    - Center side: Icon-only buttons for copying reference, copying text, adding notes, and toggling highlight options.
    - Right side: Integrated or toggleable inline color circles for highlighting.
    - End side: Close button.
  - Apply smooth micro-animations for sliding up/down based on the placement direction.

---

## Verification Plan

### Automated Tests
- Run ESLint to ensure code conforms to project standards:
  ```bash
  pnpm lint
  ```
- Run the build script to ensure there are no bundling issues:
  ```bash
  pnpm build
  ```

### Manual Verification
- Run `pnpm dev` and launch the application locally.
- Select single/multiple verses in simple view.
- Open advanced split-screen layout, select verses in different grids, verify correct scoping and alignment.
- Verify collision detection by selecting verses at the top and bottom edges of the viewport.
- Verify mobile responsive layout.
