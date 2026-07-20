# Implementation Plan: Optimize VerseRow Padding and Click Target

Improve the interactive click target of `VerseRow` by moving click-handling attributes and hover styles to an inner container with minimal horizontal padding, preventing accidental selections in the gutter or side margin areas.

## User Review Required

> [!NOTE]
> Moving the click handler attributes to the inner container means that clicking the whitespace in the gutter or side margins will no longer select/deselect the verse. This resolves the reported issue where users accidentally trigger selection when clicking near highlight indicators.

## Proposed Changes

### Bible Reader Component

#### [MODIFY] [verse-row.tsx](file:///Users/claudio/Projects/open-bible/features/bible-reader/components/verse-row.tsx)
- Restructure the JSX in `VerseRow`:
  - Outer `div` handles spacing classes and horizontal padding classes. It renders `{gutterElement}` relative to its boundaries.
  - An inner `div` wrapping the verse content receives the interactive attributes: `ref`, `data-verse-id`, `data-verse-row`, `role="button"`, `tabIndex`, `aria-pressed`, and tailwind class names for interactive/hover behavior (`group cursor-pointer rounded-md transition-colors select-text px-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring`).

## Verification Plan

### Automated Tests
- Run `pnpm lint` to verify code quality.
- Run `pnpm build` to verify next/typescript compilation.

### Manual Verification
- Check layout rendering under different spacings (small, medium, large) and gutter positions (left, right).
- Verify that clicking in the gutter area (outside indicators) does not toggle verse selection.
- Verify that clicking on a highlight dot correctly activates/deactivates the highlight popover.
- Verify that clicking on the verse text still toggles selection.
