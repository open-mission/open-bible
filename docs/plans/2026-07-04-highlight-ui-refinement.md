# Highlight UI Refinement — Implementation Plan

> **Issue:** [#85 — improve: Highlight UI Refinement](https://github.com/open-mission/open-bible/issues/85)
> **Date:** 2026-07-04
> **Status:** Approved

## Goal

Refactor `VerseSelectionPopover` and the highlight picker components in `features/highlights` to follow the updated responsive design guidelines.

## Proposed Changes

### 1. Refactor Color Picker
Modify `features/highlights/components/highlight-color-picker.tsx` to:
- Render 5 circles inline.
- Hide a native `<input type="color" />` and trigger it programmatically on 5th (gradient) circle click.

### 2. Refactor Highlight Menu as Toolbar
Modify `features/highlights/components/highlight-menu.tsx` to render the Toolbar block:
- 5 circles for color picker
- Pencil icon button to edit categories/notes
- Handle onCreateHighlight, onUpdateHighlight, and onDeleteHighlight

### 3. Refactor Popover Layout
Modify `features/bible-reader/components/verse-selection-popover.tsx` to handle the Column flex layout for mobile and desktop viewports, positioning the toolbar above the card.

---

## Tasks

- [ ] Create `improve/82-highlight-ui-refinement` branch from `develop`.
- [ ] Implement color picker and toolbar UI refinements.
- [ ] Implement column-flex responsive popover structure.
- [ ] Verify functionality and run `pnpm lint` + `pnpm build`.
