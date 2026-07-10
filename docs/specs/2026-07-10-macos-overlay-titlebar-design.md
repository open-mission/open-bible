# Spec: macOS Overlay Title Bar (VS Code / Obsidian style)

**Issue:** #121
**Date:** 2026-07-10
**Status:** Approved

## Problem

The Tauri desktop build uses the default native window chrome. On macOS this draws a
visible native title bar / window border that clashes with the themed app UI (light,
dark, or the custom accent palette). We want the desktop app to look like modern apps
such as VS Code or Obsidian — no separate native title bar, the interface runs
full-edge to the top of the window, while the macOS traffic-light window controls
(close / minimize / maximize) remain available and integrated.

## Goals

- Hide the native macOS title bar while keeping the traffic-light buttons, producing a
  unified full-edge look.
- Keep the app header as a **drag region** so the window can still be moved.
- Keep app content clear of the traffic lights (left inset on the top bar).
- Keep the header background theme-aware so the edge blends seamlessly.
- Apply this **only on macOS** (Tauri desktop). Web / iOS / PWA and Windows / Linux
  keep their current chrome.

## Non-Goals (first iteration)

- Custom window-control buttons (`decorations: false`) for Windows / Linux parity.
- macOS vibrancy / `windowEffects` (explored but out of scope for iteration 1 — the
  header already uses a themed gradient background).

## Approach

### 1. Window config (`src-tauri/tauri.conf.json`)

Add `"titleBarStyle": "Overlay"` to the `main` window. In Tauri v2 this property is a
macOS-only concept: on Windows / Linux it is ignored, so the native chrome remains
unchanged there — satisfying the macOS-only requirement at the config level.

### 2. Runtime macOS+Tauri detection

Add a client hook `useIsTauriMacOS()` that returns `true` only when running inside the
Tauri desktop runtime on macOS:

- Tauri v2 injects `window.__TAURI_INTERNALS__` → confirms we are in Tauri.
- `navigator.userAgent` containing `Mac` → confirms macOS (no traffic-light inset needed
  on Windows / Linux where the native title bar is still present).

Returning the value from a `useEffect` (not during render) avoids SSR / hydration
mismatches, since the web/PWA/CI builds never see `__TAURI_INTERNALS__`.

### 3. Drag region + traffic-light inset on top bars

Apply to the two top-of-window headers that exist as app routes:

- `features/bible-reader/components/reader-header.tsx` — the primary desktop top bar
  (`sticky top-0`).
- `app/config/page.tsx` — the Preferences header (`sticky top-0`).

When `useIsTauriMacOS()` is true:

- Add `data-tauri-drag-region` to the top bar element (empty areas of the bar become
  draggable; buttons inside remain clickable because they do not carry the attribute).
- Add a left inset (`pl-[70px]`) so the centered header content clears the traffic
  lights at the top-left. The header background gradient still spans the full width,
  so the edge blends under the traffic lights.

## Files

| File | Change |
|------|--------|
| `src-tauri/tauri.conf.json` | Add `"titleBarStyle": "Overlay"` to `main` window. |
| `features/layout/hooks/use-is-tauri-macos.ts` | New hook: detect macOS + Tauri. |
| `features/bible-reader/components/reader-header.tsx` | Apply drag region + left inset when macOS+Tauri. |
| `app/config/page.tsx` | Apply drag region + left inset on its header when macOS+Tauri. |

## Success Criteria

- On macOS desktop build: no native title bar; content runs to the window top; traffic
  lights are visible and usable; dragging the header moves the window; header content
  does not sit under the traffic lights; theme background blends.
- Web / iOS / PWA: no visual or behavioral change (no inset, no drag region).
- Windows / Linux desktop: unchanged (native chrome, no inset).
- `pnpm lint` and `pnpm build` pass.

## Verification

No automated test suite exists. Verify by:
1. `pnpm lint` (no new errors).
2. `pnpm build` (`build:tauri` static export) succeeds.
3. Manual: run `pnpm desktop:dev` on macOS and confirm the overlay title bar behavior.
