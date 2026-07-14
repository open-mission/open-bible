# Plan: Tauri Native Window Borders and Menu

**Goal:** Restore native OS window borders (decorations) and add a native Settings menu option in the Tauri application that navigates the frontend to the preferences page.

**Architecture:**
1. Tauri configuration modification to disable macOS-only borderless overlay styling.
2. Update the frontend `useIsTauriMacOS` hook to always return `false` so the custom paddings and drag regions are disabled.
3. Build the native Tauri menu in Rust including standard menus (App, File, Edit, Window) plus a custom "Configurações" (Settings) item.
4. Set up an event listener in Rust to catch menu item click and emit a custom event (`"open-settings"`).
5. Install `@tauri-apps/api` in Next.js and build a client-side listener that listens to `"open-settings"` and redirects to `/config`.

**Tech Stack:** Tauri v2, Rust, Next.js 16 (`output: "export"`), `@tauri-apps/api` v2, TypeScript.

## File map

- `src-tauri/tauri.conf.json` — Remove titleBarStyle overlay configuration.
- `features/layout/hooks/use-is-tauri-macos.ts` — Change hook to return `false` to disable custom overlay spacing.
- `src-tauri/src/lib.rs` — Create custom menu, hook `on_menu_event`, and emit event.
- `package.json` — Add `@tauri-apps/api` dependency.
- `app/layout.tsx` — Add `TauriMenuListener` to capture the settings event globally.
- `features/layout/components/tauri-menu-listener.tsx` — New client component to handle redirect logic.

## Tasks

- [ ] **T1 — Window config.** In `src-tauri/tauri.conf.json`, remove the `"titleBarStyle": "Overlay"` setting inside the main window definition.
- [ ] **T2 — Disable CSS offsets.** In `features/layout/hooks/use-is-tauri-macos.ts`, modify the hook to return `false` directly.
- [ ] **T3 — Rust native menu.** In `src-tauri/src/lib.rs`:
  - Import `tauri::menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder, PredefinedMenuItem}`.
  - Inside `setup`:
    - Create a custom `MenuItemBuilder` for Settings: `MenuItemBuilder::new("Configurações...").id("settings").accelerator("CmdOrCtrl+,").build(app)?`.
    - Construct the menu using `SubmenuBuilder` and standard item methods.
    - Set the menu using `app.set_menu(menu)?`.
    - Setup menu event handler: check for `"settings"` ID and emit `"open-settings"` using `app.emit("open-settings", ())?`.
- [ ] **T4 — Install Tauri API.** Add `@tauri-apps/api` to frontend dependencies in `package.json`. Run `pnpm install` in workspace root.
- [ ] **T5 — Tauri menu listener component.** Create `features/layout/components/tauri-menu-listener.tsx` as a `"use client"` component:
  - Import `useEffect` and `useRouter` from `next/navigation`.
  - Use `listen` from `@tauri-apps/api/event` dynamically (or conditionally under `window.__TAURI_INTERNALS__`) to capture `"open-settings"` and call `router.push("/config")`.
- [ ] **T6 — Integrate menu listener.** Add `<TauriMenuListener />` inside `RootLayout` in `app/layout.tsx` so it's active globally.
- [ ] **T7 — Verify.** Run `pnpm lint` and `pnpm build` to verify the build process is clean and successful.
