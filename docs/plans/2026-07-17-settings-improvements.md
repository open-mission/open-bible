# Settings Improvements — v0.8.1

## Goal
Fix 3 UI issues in the settings/changelog/update-popup area.

## Issues
- **#191** — make release version a clickable link in changelog section
- **#192** — update popup title after installing new version
- **#193** — replace horizontal tabs with iOS-style navigation list on mobile settings

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `features/config/components/config-content.tsx` | Modify | #191: version link; #193: mobile nav |
| `features/release-notes/components/release-notes-toast.tsx` | Modify | #192: installed state + title |
| `features/config/components/config-dialog.tsx` | Modify (maybe) | #193: mobile drawer behavior |

## Tasks

### Task 1: Clickable release link in changelog (#191)
- In `config-content.tsx` (~line 601), change the version display from plain text to a clickable link
- Link target: `https://github.com/open-mission/open-bible/releases/tag/v{latestEntry.version}`
- Use `<a>` with `target="_blank" rel="noopener noreferrer"`
- Keep the same styling (font, size)

### Task 2: Post-install title change (#192)
- In `release-notes-toast.tsx`, add local state `const [installed, setInstalled] = useState(false)`
- In the `updatePwa` handler callback, call `setInstalled(true)` before the SW activation
- When `installed` is true: change title to "Nova versão instalada", change icon to a checkmark (e.g. `CheckCircle` from lucide-react), maybe green styling
- Keep "Nova versão disponível" when not installed

### Task 3: iOS-style mobile settings nav (#193)
- In `config-content.tsx`, detect mobile (< 768px) using existing `isDesktop` state
- On mobile: render a vertical list of grouped sections instead of tabs
  - Each row: icon + label + chevron-right
  - Tapping a row shows that section's content (hide the list, show the section)
  - Add a back button at the top to return to the sections list
  - Only one section visible at a time
- On desktop: keep the existing tab-based layout
- Make sure it works inside both the Drawer (config-dialog) and the standalone page (app/config/page.tsx)

## Verification
1. `pnpm lint` — 0 errors
2. `pnpm build` — succeeds
3. Manual: open settings on mobile viewport, verify tabs are replaced with list navigation
4. Manual: open changelog section, click version link, verify it opens GitHub release
5. Manual: trigger PWA update, click "Atualizar", verify title changes to "Nova versão instalada"
