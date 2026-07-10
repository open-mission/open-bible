# Plan: macOS Overlay Title Bar

**Goal:** Remove the native macOS title bar in the Tauri desktop build and make the app
header a draggable, full-edge top bar that clears the traffic-light controls — without
affecting web, iOS, or Windows/Linux.

**Architecture:** Pure config + client-side runtime detection. `titleBarStyle: Overlay`
in Tauri config (macOS-only by design) hides the native bar. A client hook detects
macOS+Tauri at runtime; headers opt in to `data-tauri-drag-region` + a left inset only
when that hook is true, so non-desktop builds are untouched.

**Tech Stack:** Tauri v2 (`tauri.conf.json`), Next.js 16 client components, Tailwind v4.

## File map

- `src-tauri/tauri.conf.json` — window config.
- `features/layout/hooks/use-is-tauri-macos.ts` — new detection hook.
- `features/bible-reader/components/reader-header.tsx` — primary top bar.
- `app/config/page.tsx` — Preferences top bar.

## Tasks

- [ ] **T1 — Window config.** In `src-tauri/tauri.conf.json`, add `"titleBarStyle": "Overlay"`
  to the `main` window object (after `"fullscreen": false`).

- [ ] **T2 — Detection hook.** Create `features/layout/hooks/use-is-tauri-macos.ts`:

  ```ts
  "use client";

  import { useEffect, useState } from "react";

  /**
   * True only when running inside the Tauri desktop runtime on macOS.
   * titleBarStyle:"Overlay" (set in tauri.conf.json) is macOS-only, so the
   * traffic-light inset / drag region must also be macOS+Tauri only.
   */
  export function useIsTauriMacOS(): boolean {
    const [isTauriMacOS, setIsTauriMacOS] = useState(false);

    useEffect(() => {
      const isTauri =
        typeof window !== "undefined" &&
        "__TAURI_INTERNALS__" in window;
      const isMac =
        typeof navigator !== "undefined" &&
        /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
      setIsTauriMacOS(isTauri && isMac);
    }, []);

    return isTauriMacOS;
  }
  ```

- [ ] **T3 — Reader header.** In `features/bible-reader/components/reader-header.tsx`:
  - Import `useIsTauriMacOS` and `cn` (cn already imported).
  - Call `const isTauriMacOS = useIsTauriMacOS();` inside `ReaderHeader`.
  - Update the top bar `<div>` (line ~98):

    ```tsx
    <div
      data-tauri-drag-region={isTauriMacOS ? "" : undefined}
      className={cn(
        "sticky top-0 z-20 bg-gradient-to-b from-background via-background/95 to-transparent backdrop-blur flex items-center justify-center pb-3 pt-3 px-4 min-h-14.25",
        isTauriMacOS && "pl-[70px]",
      )}
    >
    ```

    The buttons inside keep their normal behavior (they do not carry
    `data-tauri-drag-region`), so only the empty bar areas drag.

- [ ] **T4 — Config header.** In `app/config/page.tsx`:
  - Import `useIsTauriMacOS` from the new hook and `cn` from `@/lib/utils` if not present
    (it is not imported there yet — add `import { cn } from "@/lib/utils";`).
  - Call `const isTauriMacOS = useIsTauriMacOS();` inside `ConfigPage`.
  - Update the header `<header>` (line ~59):

    ```tsx
    <header
      data-tauri-drag-region={isTauriMacOS ? "" : undefined}
      className={cn(
        "sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/95 backdrop-blur px-4 py-3",
        isTauriMacOS && "pl-[70px]",
      )}
    >
    ```

- [ ] **T5 — Verify.** Run `pnpm lint` and `pnpm build`. Confirm no errors and no
  behavioral change outside macOS+Tauri.

## Notes

- `data-tauri-drag-region` is a plain HTML attribute; no `@tauri-apps/api` dependency is
  required, so the web build stays lean.
- `min-h-14.25` is an existing class in the reader header; leave it untouched.
