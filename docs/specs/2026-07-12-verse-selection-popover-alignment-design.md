# Spec: Minified Floating Verse Selection Popover

## Context & Objectives
Currently, when a user selects verses in the Bible reader, a full-width toolbar is rendered at the bottom of the active panel.
This layout:
1. Takes up significant screen real estate.
2. Is far from the user's cursor/tap position (forcing eye and hand movement to the bottom of the screen).
3. Doesn't feel like a modern, contextual text-selection popover (like in Notion, Medium, or Apple Books).

The goal of this enhancement is to design a **minified, floating selection popover** that:
- Aligns dynamically next to the selected verse(s).
- Positions itself either above or below the selection depending on screen boundaries/scrolling positions (collision detection).
- Is scoped and styled relative to the active grid/pane/tab, scrolling naturally with the content.
- Fits beautifully in both desktop and mobile layouts.

---

## Detailed Design

### 1. Positioning Strategy
To ensure the popover is scoped to the active grid item and scrolls naturally with the reader text, it will be placed inside the scrolling container of the `Reader` as an `absolute` positioned sibling of the `<article>` element.

- **Scrolling Container**: The container `div` with scroll behavior (`overflow-y-auto`) will be given `position: relative`.
- **Absolute Coordinates**: The coordinates (`top`, `left`) will be calculated relative to this scroll container:
  - **Horizontal (`left`)**: Pinned to `50%` with `translateX(-50%)` to keep the popover horizontally centered over the text column.
  - **Vertical (`top`)**:
    1. Query all selected verse rows (`[data-verse-row]`) matching the active `selectedVerseIds`.
    2. Calculate their collective bounding box (minimum `top` and maximum `bottom`) relative to the scroll container's viewport.
    3. Measure/estimate the height of the popover.
    4. Compute `spaceAbove` (top of selected verses to top of scrolling viewport).
    5. If `spaceAbove >= popoverHeight + offset`, place the popover above the selection (`top = minTop - popoverHeight - offset`).
    6. Otherwise, place it below the selection (`top = maxBottom + offset`).

### 2. Minified UI Layout (The Pill)
Instead of a large card, we will use a sleek, rounded pill (`rounded-full`) that contains only high-frequency options:

- **Left section**:
  - Compact reference string (e.g., `Gn 1:1` or `Gênesis 1:1, 3`) in bold text.
  - Verses count badge (e.g., `• 2` if > 1 selected).
- **Separator** (vertical line).
- **Action Buttons (Icons only)**:
  - Copy Reference (`IconCopy` or similar)
  - Copy Text (`IconClipboardText`)
  - Note (`IconNotebook` - opens/closes note pane)
  - Highlight (`IconHighlight` - toggles inline color palette)
- **Inline Color Palette**:
  - In the same row, or dynamically expanding, we will render the 6 default neon colors directly within the pill or directly above/below the pill in a compact toolbar.
  - On desktop, we can display the color picker inline next to the highlight button.
  - On mobile, we will show the color picker by toggling the highlight button, keeping the base pill extremely narrow.
- **Close Button** (`IconX`).

---

## Verification Plan

### Manual Verification
1. Open the reader, select a single verse. Verify that the floating pill appears just above the verse and is centered horizontally.
2. Select multiple verses. Check that the position updates smoothly and adjusts to align to the bounds of the selected verses.
3. Scroll the reader pane. Verify that the floating pill scrolls naturally with the text.
4. Select a verse near the top of the viewport. Verify that the popover automatically flips to appear below the verse.
5. In split grid mode (advanced mode), select a verse in Pane A. Verify that only Pane A shows its selection popover, and Pane B is unaffected. Select a verse in Pane B, and verify the popover updates its position relative to Pane B's container.
6. Verify layout and responsiveness on mobile screen sizes.
