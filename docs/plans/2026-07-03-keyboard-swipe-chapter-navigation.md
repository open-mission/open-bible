# Keyboard & Swipe Chapter Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add keyboard arrow key and mobile swipe navigation between Bible chapters with slide animation.

**Architecture:** Two custom hooks (`useKeyboardNavigation`, `useSwipeNavigation`) consumed by `reader.tsx`, with CSS keyframe animations for visual feedback.

**Tech Stack:** React hooks, raw DOM events, CSS keyframes (no new dependencies)

## Global Constraints

- Zero new npm dependencies
- Arrow keys always active (even during verse selection)
- Swipe threshold: 50px horizontal, 30px to block scroll
- Animation: 200ms ease-out slide
- Skip keyboard if target is input/textarea/contentEditable

---

### Task 1: Add CSS keyframe animations

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Produces: `.animate-slide-in-left` and `.animate-slide-in-right` CSS classes

- [ ] **Step 1: Add keyframes to globals.css**

Add at the end of the file:

```css
@keyframes slide-in-left {
  from { transform: translateX(30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slide-in-right {
  from { transform: translateX(-30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.animate-slide-in-left {
  animation: slide-in-left 200ms ease-out;
}

.animate-slide-in-right {
  animation: slide-in-right 200ms ease-out;
}
```

- [ ] **Step 2: Verify dev server compiles**

Run: `pnpm dev`
Expected: No CSS errors, app loads normally

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "improve: add slide animation keyframes for chapter navigation"
```

---

### Task 2: Create useKeyboardNavigation hook

**Files:**
- Create: `features/bible-reader/hooks/use-keyboard-navigation.ts`

**Interfaces:**
- Produces: `useKeyboardNavigation(onPrev: () => void, onNext: () => void): void`

- [ ] **Step 1: Create the hook file**

```ts
"use client";

import { useEffect } from "react";

export function useKeyboardNavigation(
  onPrev: () => void,
  onNext: () => void,
) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onNext();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onPrev, onNext]);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm dev`
Expected: No TS errors in terminal

- [ ] **Step 3: Commit**

```bash
git add features/bible-reader/hooks/use-keyboard-navigation.ts
git commit -m "feat: add useKeyboardNavigation hook for arrow key chapter nav"
```

---

### Task 3: Create useSwipeNavigation hook

**Files:**
- Create: `features/bible-reader/hooks/use-swipe-navigation.ts`

**Interfaces:**
- Produces: `useSwipeNavigation(onPrev: () => void, onNext: () => void): void`

- [ ] **Step 1: Create the hook file**

```ts
"use client";

import { useEffect, useRef } from "react";

const SWIPE_THRESHOLD = 50;
const SCROLL_BLOCK_THRESHOLD = 30;

export function useSwipeNavigation(
  onPrev: () => void,
  onNext: () => void,
) {
  const startRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    function handleTouchStart(e: TouchEvent) {
      if (e.touches.length !== 1) return;
      startRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }

    function handleTouchMove(e: TouchEvent) {
      if (!startRef.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - startRef.current.x;
      const dy = e.touches[0].clientY - startRef.current.y;
      if (Math.abs(dx) > SCROLL_BLOCK_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        e.preventDefault();
      }
    }

    function handleTouchEnd(e: TouchEvent) {
      if (!startRef.current) return;
      const endX = e.changedTouches[0].clientX;
      const dx = endX - startRef.current.x;
      startRef.current = null;

      if (Math.abs(dx) > SWIPE_THRESHOLD) {
        if (dx > 0) {
          onPrev();
        } else {
          onNext();
        }
      }
    }

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onPrev, onNext]);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm dev`
Expected: No TS errors

- [ ] **Step 3: Commit**

```bash
git add features/bible-reader/hooks/use-swipe-navigation.ts
git commit -m "feat: add useSwipeNavigation hook for touch gesture chapter nav"
```

---

### Task 4: Integrate hooks and animation into Reader

**Files:**
- Modify: `features/bible-reader/components/reader.tsx`

**Interfaces:**
- Consumes: `useKeyboardNavigation`, `useSwipeNavigation` (from Tasks 2-3)
- Consumes: `.animate-slide-in-left`, `.animate-slide-in-right` CSS classes (from Task 1)

- [ ] **Step 1: Add imports**

Add to existing imports at top of file:

```ts
import { useKeyboardNavigation } from "../hooks/use-keyboard-navigation";
import { useSwipeNavigation } from "../hooks/use-swipe-navigation";
```

- [ ] **Step 2: Add slideDirection state**

After the existing `selectedVerseIds` state (line ~51), add:

```ts
const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);
```

- [ ] **Step 3: Modify prevChapter and nextChapter**

Replace the existing functions (lines ~94-100):

```ts
function prevChapter() {
  if (chapter > 1) {
    setSlideDirection("right");
    onChapterChange(chapter - 1);
  }
}

function nextChapter() {
  if (book && chapter < book.chapters) {
    setSlideDirection("left");
    onChapterChange(chapter + 1);
  }
}
```

- [ ] **Step 4: Add hooks after the existing useEffect**

After the existing `useEffect` for verse selection (line ~80), add:

```ts
useKeyboardNavigation(prevChapter, nextChapter);
useSwipeNavigation(prevChapter, nextChapter);
```

- [ ] **Step 5: Add animation class and onAnimationEnd to article**

Replace the `<article>` tag (line ~155):

```tsx
<article
  ref={containerRef}
  className={`${fontClass} text-foreground selection:bg-highlight ${
    slideDirection === "left"
      ? "animate-slide-in-left"
      : slideDirection === "right"
        ? "animate-slide-in-right"
        : ""
  }`}
  style={{ fontSize: `${fontSize}px` }}
  onAnimationEnd={() => setSlideDirection(null)}
>
```

- [ ] **Step 6: Verify full integration**

Run: `pnpm dev`
Expected: App loads, arrow keys navigate chapters with slide animation on desktop, swipe works on mobile

- [ ] **Step 7: Commit**

```bash
git add features/bible-reader/components/reader.tsx
git commit -m "feat: integrate keyboard and swipe navigation with slide animation"
```

---

### Task 5: Final verification

- [ ] **Step 1: Run lint**

Run: `pnpm lint`
Expected: No errors

- [ ] **Step 2: Build production**

Run: `pnpm build`
Expected: Builds successfully (TS errors ignored per project config)

- [ ] **Step 3: Manual test checklist**

- [ ] Desktop: press ArrowLeft → previous chapter loads with slide-right animation
- [ ] Desktop: press ArrowRight → next chapter loads with slide-left animation
- [ ] Desktop: at chapter 1, ArrowLeft → no action, no error
- [ ] Desktop: at last chapter, ArrowRight → no action, no error
- [ ] Desktop: click in search input, press ArrowLeft/Right → cursor moves, no chapter change
- [ ] Mobile: swipe right → previous chapter with slide animation
- [ ] Mobile: swipe left → next chapter with slide animation
- [ ] Mobile: at boundaries → no action, no error
- [ ] Mobile: select verses, then swipe → chapter changes (selection dismissed by existing logic)
