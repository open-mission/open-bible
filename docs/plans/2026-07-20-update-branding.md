# Implementation Plan — Branding Update

Goal: Implement new logos, update favicons, apple touch icon, manifest, meta tags (og:image), sidebar logo, tauri icons, and config dialog.

## Proposed Changes

### Assets and Build
- [ ] Run `sips` to generate:
  - `public/icon.png` (1024x1024)
  - `public/icon-192.png` (192x192)
  - `public/icon-512.png` (512x512)
  from `public/logo-minimal.png`.
- [ ] Generate Tauri icons from the new `public/logo-minimal.png` using the Tauri CLI:
  `pnpm tauri icon public/logo-minimal.png` (this updates all icons under `src-tauri/icons/` automatically).

### PWA Manifest and Document Metadata
- [ ] Update `public/manifest.json` with new icon files `/icon-192.png` and `/icon-512.png`.
- [ ] Update `app/layout.tsx` metadata config:
  - Set `icons.icon` to `/logo-minimal.png`
  - Set `icons.apple` to `/logo-minimal.png`
  - Add `openGraph` configuration with `images: [{ url: '/logo.png', width: 1200, height: 400, alt: 'Open Bible Logo' }]`.

### Layout and Sidebar
- [ ] Update `features/layout/components/sidebar.tsx`:
  - Replace the text `<h1>Open Bible</h1>` in `AppSidebar` header with `logo.svg` or `logo.png` image.
  - Implement a clean logo container that matches sidebar collapse state and looks great on light/dark themes.
- [ ] Update `features/workspace/components/workspace-sidebar.tsx`:
  - Show the minimal logo at the top header in collapsed or expanded states.

### Configuration / About Screen
- [ ] Update `features/config/components/config-content.tsx`:
  - Add a dedicated branding/logo block at the top of the configurations panel or under the "changelog" tab to show the full logo and version information.

## Verification Plan

### Automated Tests
- Run `pnpm lint` and `pnpm test` to ensure zero compilation or linter regressions.

### Manual Verification
- Run `pnpm dev` and check the browser tab favicon.
- Inspect sidebar layout in both expanded and collapsed views.
- Check settings dialog about section.
