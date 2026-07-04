# Keyboard & Swipe Chapter Navigation

## Goal

Enable users to navigate between Bible chapters using keyboard arrow keys (desktop) and swipe gestures (mobile) with slide animation feedback.

## Decisions

- Arrow keys always work, even when verse selection popover is open
- Swipe triggers slide animation (old chapter slides out, new slides in)
- Zero new dependencies — raw event handlers + CSS keyframes
- Swipe only active on mobile (touch events); keyboard always active

## Architecture

```
reader.tsx
  ├─ useKeyboardNavigation(onPrev, onNext)    ← new hook
  ├─ useSwipeNavigation(onPrev, onNext)       ← new hook
  ├─ slideDirection state                     ← controls animation
  └─ CSS keyframes in globals.css
```

## Files to Create/Modify

| File | Action |
|------|--------|
| `features/bible-reader/hooks/use-keyboard-navigation.ts` | CREATE — useEffect with ArrowLeft/ArrowRight listener |
| `features/bible-reader/hooks/use-swipe-navigation.ts` | CREATE — touch event handlers for swipe detection |
| `features/bible-reader/components/reader.tsx` | MODIFY — add hooks, slideDirection state, animation class |
| `app/globals.css` | MODIFY — add @keyframes slide-in-left/right + utility classes |

## Hook Signatures

```ts
useKeyboardNavigation(onPrev: () => void, onNext: () => void): void
useSwipeNavigation(onPrev: () => void, onNext: () => void): void
```

## Key Implementation Details

**Keyboard**: keydown → skip if target is input/textarea/contentEditable → ArrowLeft calls onPrev(), ArrowRight calls onNext(). Always active.

**Swipe**: touchstart records startX/startY → touchmove blocks scroll if horizontal delta > 30px and > vertical → touchend checks |deltaX| > 50px → calls onPrev() (swipe right) or onNext() (swipe left). Ignores multi-touch.

**Animation**: CSS @keyframes slide-in-left/right with 200ms ease-out. Applied via class on `<article>`, reset on animationend.

**Flow**: Hook detects → calls prevChapter()/nextChapter() → onChapterChange() → Reader re-mounts with new key → CSS animation plays → animationend resets state.

## Edge Cases

- First chapter: prevChapter() no-op (existing guard chapter > 1)
- Last chapter: nextChapter() no-op (existing guard chapter < book.chapters)
- Text input focus: Keyboard hook skips if target is input/textarea/contentEditable
- Verse selection open: Navigation always works
- Multi-touch swipe: Ignored (check e.touches.length === 1)
- Desktop: Keyboard works; swipe no-op (touch events not fired)
