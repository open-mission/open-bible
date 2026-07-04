# Highlight UI Refinement — Design Spec

> **Issue:** [#85 — improve: Highlight UI Refinement](https://github.com/open-mission/open-bible/issues/85)
> **Date:** 2026-07-04
> **Status:** Draft

## Goal

Refactor the verse selection bar / popover (`VerseSelectionPopover`) and highlight color picker UI to follow a new, more polished, and logically aligned design for both mobile and desktop views, using Tailwind CSS and components from `@base-ui/react` (via shadcn/ui base-vega).

---

## UI Components & Structure

### Mobile Layout

```text
┌──────────────────────────────────────────────────────────────┐
│  ●   ●   ●   ●   ●                              ✎            │
└──────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  Gênesis 1:2 (ARA)           [ 1 versículo ]             ✕   │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📄 Referência     📋 Texto     ✎ Destaque (ativo)           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

The Mobile view consists of a vertically stacked **Column**:
1. **Toolbar**: A container above the Card, with horizontal padding, containing:
   - **ColorPicker** (5 circles): 
     - 4 predefined color circles (`amber`, `green`, `blue`, `rose`).
     - 1 gradient color circle (custom color picker trigger). Clicking it programmatically opens the native browser/OS color picker.
   - **EditButton**: A button with a pencil icon (`✎` / `IconEdit` / `IconHighlight`) that opens the full highlight editor modal/sheet.
2. **Card**: The main popover card containing:
   - **Header** (row): Reference title (e.g., `Gênesis 1:2 (ARA)`), a verse count badge (`[ 1 versículo ]` or `[ N versículos ]`), and a close button (`✕` / `IconX`).
   - **Separator** (horizontal line).
   - **Actions** (row): Three full-width action buttons:
     - `Referência` (IconCopy)
     - `Texto` (IconClipboardText)
     - `Destaque` (IconHighlight). This button is highlighted (active/selected state) when the toolbar is open or when there is an active highlight.

---

### Desktop Layout

```text
                                   ┌──────────────────────────────┐
                                   │ ● ● ● ● ●             ✎      │
                                   └──────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                              │
│  Gênesis 1:2 (ARA)   [1 versículo]   📄 Referência   📋 Texto   ✎ Destaque (ativo)                  ✕        │
│                                                                                                              │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

The Desktop view consists of a vertically stacked **Column**:
1. **Toolbar**: A right-aligned container above the Card containing:
   - **ColorPicker** (5 circles, matching mobile custom-trigger behavior).
   - **EditButton** (pencil icon).
2. **Card**: A single-row horizontal card containing:
   - `ReferenceTitle` (e.g., `Gênesis 1:2 (ARA)`)
   - `VerseCountBadge` (e.g., `[ 1 versículo ]`)
   - **Spacer** (`flex-grow`)
   - `Referência` Action button
   - `Texto` Action button
   - `Destaque` Action button (selected if active)
   - `CloseButton` (✕)

---

## State & Interactions

- **Toolbar Visibility**:
  - The Toolbar is visible if the selected verses already have a highlight associated with them, OR if the user clicks/selects the `Destaque` action.
  - When the Toolbar is visible, the `Destaque` action button is rendered in its active/selected state.
- **Color Picker Actions**:
  - Selecting one of the 4 predefined colors:
    - If a highlight exists for the selected verses, update its color.
    - If no highlight exists, create a new highlight with this color.
    - If clicking the *currently active color*, delete the highlight (toggle off) and hide the toolbar.
  - **Custom Color Trigger (5th circle)**:
    - Renders as a gradient circle.
    - On click, triggers a hidden `<input type="color" />` programmatically to open the native browser color picker window.
    - When a custom color is chosen, it either updates the existing highlight color or creates a new highlight.
- **Edit Button Action**:
  - Opens the full `HighlightEditor` (drawer/bottom sheet on mobile, dialog on desktop) to manage tags/categories and notes.

## Technical Implementation

We will modify:
1. `features/highlights/components/highlight-color-picker.tsx`:
   - Refactor to display the 5 circles inline in a clean way.
   - Embed a hidden `<input type="color" />` and trigger its `.click()` programmatically when the gradient button is clicked.
   - Adjust styling to support rendering inside the new floating toolbar.
2. `features/highlights/components/highlight-menu.tsx`:
   - Change from a single button/dropdown to a wrapper or helper, or refactor it to render the new `Toolbar` layout.
   - Let `HighlightMenu` render the toolbar block (the 5 circles + edit pencil).
3. `features/bible-reader/components/verse-selection-popover.tsx`:
   - Structure the overall component into the new column layout.
   - Clean up responsive styles (`isMobile` media query).
   - Wire up `showToolbar` state, active highlight lookup, and actions.
