# Design Spec — Update Branding with New Logos

Implement a unified visual identity for the Open Bible application across web, PWA metadata, Tauri desktop config, and in-app components using the newly provided branding assets.

## Proposed Design & Architecture

We will distribute the branding assets across the following surfaces:

### 1. File Copy & Asset Generations
- Copy `logo-minimal.png` and `logo.png` (transparents/minimal) to the `public/` directory (already copied from Downloads).
- Generate multiple square PNG icon sizes from `public/logo-minimal.png` using the macOS `sips` utility:
  - `public/icon.png` (1024x1024)
  - `public/icon-192.png` (192x192)
  - `public/icon-512.png` (512x512)
- Replace `src-tauri/icons/icon.png` (and other Tauri files if needed) with the new minimal logo.

### 2. PWA Manifest & Metadata
- Update `public/manifest.json` to include the new `icon-192.png` and `icon-512.png` icons, along with the fallback `icon.png` (1024x1024).
- Update metadata tags in `app/layout.tsx`:
  - Point `icons.icon` and `icons.apple` to `/logo-minimal.png` or the generated `/icon.png`.
  - Add `og:image` pointing to `/logo.png` for rich link previews.

### 3. Sidebar UI Updates
- In `features/layout/components/sidebar.tsx`:
  - In expanded state, replace the `<h1>Open Bible</h1>` text with the full `logo.png` or `logo.svg` vector image.
  - In collapsed state, show `logo-minimal.png` or `logo.svg` wrapped in `mix-blend-mode: screen` (if on dark theme) or formatted nicely.
- In `features/workspace/components/workspace-sidebar.tsx`:
  - Render `logo-minimal.png` in collapsed/expanded headers.

### 4. About Section / Settings Dialog
- Add the full logo `public/logo.png` (or `logo.svg`) to the settings/about content inside `features/config/components/config-content.tsx` (e.g., above version number or in a dedicated "Sobre" section).

### Tauri Window Icon
- Update standard Tauri build configurations to point to the new icon.

## Open Questions
- None.
