# Design Spec: Optimize VerseRow Padding and Click Target

## Current Problem
The `VerseRow` component holds its horizontal padding (gutter area + right margin) on its outermost layout container.
Because this container also has the `data-verse-id`, `data-verse-row`, and `role="button"` attributes, the entire padded area (including empty space on the left and right, and the highlight gutter) is interactive.
This leads to:
1. Accidental selection/deselection of verses when trying to click on the highlight gutter's dot indicator.
2. Clicking on the white space on either side of a verse triggers selection, which is overly sensitive.

## Proposed Solution
We will isolate the interactive/clickable attributes and selection styling to an inner container within `VerseRow`.

1. **Outer container**:
   - Acts as a layout wrapper only.
   - Retains the horizontal padding (`paddingClass`) and vertical verse spacing (`spacingClasses[verseSpacing]`).
   - Renders the absolute-positioned `gutterElement` (HighlightGutter).
   - Removed: `data-verse-id`, `data-verse-row`, `role="button"`, `tabIndex`, `cursor-pointer`, and active pressed/selected state triggers.

2. **Inner container**:
   - Contains the verse number, verse text, and notes indicators.
   - Receives: `ref={ref}`, `data-verse-id={verse.id}`, `data-verse-row=""`, `role="button"`, `tabIndex={0}`, `cursor-pointer`, and hover transition/colors.
   - Receives minimal padding (e.g. `px-1.5`) so the interactive area is strictly limited to the text block itself.

## Verification
- Validate compilation using `pnpm build`.
- Validate code quality using `pnpm lint`.
- Manually check that clicking on the empty gutter space does not select the verse, and clicking on highlight dots works smoothly.
