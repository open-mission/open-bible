"use client";

import { useEffect, useRef } from "react";

const SWIPE_THRESHOLD = 50;
// Swipe must be predominantly horizontal. Scrolling a long chapter shifts the
// touch slightly sideways; without this guard a diagonal scroll-release flips
// the chapter and destroys the reader's position. Require the delta to be
// mostly horizontal (at least 2x the vertical delta).
const SWIPE_AXIS_RATIO = 2;

export function useSwipeNavigation(
  onPrev: () => void,
  onNext: () => void,
  enabled = true,
) {
  const startRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!enabled) return;

    function handleTouchStart(e: TouchEvent) {
      if (e.touches.length !== 1) return;
      startRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }

    function handleTouchEnd(e: TouchEvent) {
      if (!startRef.current) return;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const dx = endX - startRef.current.x;
      const dy = endY - startRef.current.y;
      startRef.current = null;

      if (Math.abs(dx) < SWIPE_THRESHOLD) return;
      if (Math.abs(dy) > Math.abs(dx) / SWIPE_AXIS_RATIO) return;

      if (dx > 0) {
        onPrev();
      } else {
        onNext();
      }
    }

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onPrev, onNext, enabled]);
}
