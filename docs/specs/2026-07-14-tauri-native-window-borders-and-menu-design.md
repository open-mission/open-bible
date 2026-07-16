# Spec: Tauri Native Window Borders and Menu

**Issue:** #162
**Date:** 2026-07-14
**Status:** Under Review

## Problem

The Tauri desktop build currently uses custom overlay window title bars style on macOS (`titleBarStyle: Overlay`), which forces a borderless look and custom header spacings/drag-regions. However, this full-edge design has limitations and deviates from standard desktop app borders on other OSs. We want the application to use the standard OS window borders and title bars (on macOS and Windows/Linux). On macOS, the title is centered by default. On Windows, it will follow the OS's native title alignment.

Furthermore, we need a native menu option in the application to access settings ("Configurações" / "Preferences"). 

## Goals

1. Restore standard OS window borders and decorations on all desktop platforms.
2. Remove/disable the custom macOS header margins/paddings and drag handles in Next.js since the OS will manage window dragging and titlebar spacing.
3. Add a "Configurações..." (Settings...) option in the application's native menu.
4. Listen to this menu item event and navigate/open the preferences/settings page (`/config`) in the Next.js frontend application.

## Non-Goals

- Attempting to force center the title bar on platforms that do not natively support it (e.g., Windows 10 native titlebar is left-aligned). We will let the OS render the title bar natively.
- Implementing a completely custom titlebar inside the HTML code.

## Approach

### 1. Window config (`src-tauri/tauri.conf.json`)

Remove `"titleBarStyle": "Overlay"` from the main window configurations. This makes Tauri fallback to default OS decorations and native titlebars on all platforms (macOS, Windows, and Linux).

We will keep `"title": "Open Bible"` so the native title bar displays the application title.

### 2. Disable macOS Custom Header Logic

The hook `useIsTauriMacOS()` was used to apply custom left padding (`pl-[70px]`/`pl-[75px]`) and drag regions. We will update `features/layout/hooks/use-is-tauri-macos.ts` to return `false` always. This immediately disables the custom spacing and drag regions across the entire app without requiring risky modifications across layout components.

### 3. Add Native Menu and handle Settings Click in Rust

In `src-tauri/src/lib.rs`, build a custom application menu or extend the default menu to include a "Configurações..." item.

Since we want a standard menu plus a custom option, we can use `tauri::menu::Menu` or rebuild the default platform menu and insert a menu item for Settings.
To do this cleanly on all platforms:
- On macOS, the standard settings/preferences option is typically placed in the first app submenu (under the application name), with shortcut `Cmd+,`.
- On Windows and Linux, it's typically placed under a "File" menu or a dedicated menu.
To implement this:
1. Re-create the native menu with standard items (About, File, Edit, Window, Help) using `MenuBuilder` and `SubmenuBuilder`, or modify `Menu::default` if available.
2. Add a MenuItem for Settings ("Configurações") with ID `"settings"`.
3. Set up the menu event handler using `app.on_menu_event`.
4. When `"settings"` is clicked, emit a Tauri event `"open-settings"` to the frontend.

### 4. Handle "open-settings" in Next.js Frontend

1. Install `@tauri-apps/api` in dependencies (specifically for frontend events).
2. Create a global component `TauriMenuListener` (or integrate it inside `ThemeProvider` / a layout client component) that imports `listen` from `@tauri-apps/api/event`.
3. Listen for `"open-settings"` and navigate to `/config` using the Next.js router (`router.push("/config")`).

## Files to Modify

| File | Change |
|------|--------|
| `src-tauri/tauri.conf.json` | Remove `"titleBarStyle": "Overlay"` |
| `features/layout/hooks/use-is-tauri-macos.ts` | Make the hook return `false` to disable overlay padding |
| `src-tauri/src/lib.rs` | Build menu with a Settings item, handle events, and emit `"open-settings"` |
| `package.json` | Add `@tauri-apps/api` dependency |
| `app/layout.tsx` | Add/render a new client component to listen to `"open-settings"` and navigate |

## Success Criteria

1. On macOS desktop build: Native standard window title bar and border are displayed, with the title "Open Bible" centered natively. The `pl-[70px]` indentation is gone.
2. On Windows/Linux desktop build: Standard native title bar and borders are displayed.
3. Native application menu includes "Configurações" / "Configurações..." (Settings). Clicking it navigates the app to `/config` (Preferences page).
4. Web and PWA versions are untouched and continue to build and function correctly.
5. `pnpm lint` and `pnpm build` (including `pnpm build:tauri`) pass without error.
