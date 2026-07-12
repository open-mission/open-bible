# Design Spec: Verse selection popover visibility in workspace panes

Address the issue where the verse selection popover (`VerseSelectionPopover`) is invisible inside workspace panes (Advanced layout mode - tabs and grid).

## Problem Statement

When a user selects verses in a Bible pane inside the Advanced Workspace (which organizes panes using tabs or a split grid), the selection popover does not appear or is cut off.

### Root Cause Analysis

1. The workspace pane is rendered inside a `GridPane` (in `grid-pane.tsx`), which has `overflow-hidden` and a fixed height computed by the resizable layout.
2. Inside `bible-pane-view.tsx`, the `Reader` component (where the popover is rendered) is wrapped in a `SidebarProvider`.
3. The `SidebarProvider` component (from shadcn UI, defined in `components/ui/sidebar.tsx`) has a default Tailwind class `min-h-svh` (which evaluates to `min-height: 100svh` / 100% viewport height).
4. Because of `min-h-svh`, the `SidebarProvider` inside a grid pane is forced to expand to at least the full height of the viewport, even if the parent container is much smaller (e.g. 300px or 400px).
5. The flex child elements within the `Reader` are stretched out. The `VerseSelectionPopover` is rendered at the bottom of this stretched area.
6. Since the parent grid pane has `overflow-hidden`, the popover is drawn outside the visible bounds of the grid pane, rendering it invisible.

## Proposed Solution

Instead of editing the shared `sidebar.tsx` component (which is used globally and expects `min-h-svh` when in fullscreen mode), we can pass `min-h-0` to the `className` of the `SidebarProvider` specifically in `bible-pane-view.tsx`.

Since the CSS merge function `cn()` uses `twMerge`, passing `min-h-0` will override the default `min-h-svh` class. This restricts the height of `SidebarProvider` to the bounds of the pane (`h-full` / `100%`), allowing the vertical flex chain inside the Reader to function correctly. The `VerseSelectionPopover` will then be positioned properly at the bottom of the visible pane.

## Layout Chain Impact

- `GridPane` (bounds correct, `overflow-hidden`)
  - `BiblePaneView` (fills height)
    - `SidebarProvider` (`h-full min-h-0` resolves to the actual pane height)
      - `SidebarInset` (`h-full`)
        - `PanelLayout` (flex/resizable horizontal layout filling parent)
          - `main` / `Reader` (`h-full relative flex flex-col`)
            - `ReaderContent` (scroll area `flex-1 min-h-0 overflow-y-auto` + `VerseSelectionPopover` with `shrink-0`)

This correct chain enables the scroll area of the `Reader` to shrink when the popover opens, making the popover visible exactly at the bottom of the active pane.
