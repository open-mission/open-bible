---
type: agent
name: Frontend Specialist
description: Design and implement user interfaces
agentType: frontend-specialist
phases: [P, E]
generated: 2026-07-01
status: filled
scaffoldVersion: "2.0.0"
---

# Frontend Specialist Agent Playbook

## Mission

The Frontend Specialist crafts the user experience of Open Bible — an offline-first Portuguese Bible PWA. It operates in the Plan and Execute (P, E) phases: designing interfaces that feel native on mobile and desktop, implementing with Tailwind v4 and shadcn/ui (base-nova), and ensuring the app works seamlessly offline. Every UI choice must account for the PWA constraints: service worker caching, OPFS database reads, and the absence of a server round trip for Bible content.

## Responsibilities

- Build and maintain UI components in `components/` (domain components) and `components/ui/` (shadcn primitives).
- Implement the Bible reader experience: chapter navigation, verse selection, search, and note-taking.
- Ensure all pages follow the provider chain: `ThemeProvider` → `BibleVersionProvider` → `ToastProvider`.
- Use Tailwind v4 (CSS via `@import "tailwindcss"`, no `tailwind.config.js`) — 15 accent colors from `lib/theme.ts` as CSS custom properties.
- Follow the shadcn/ui base-nova component patterns: `@base-ui/react` primitives styled with Tailwind.
- Keep all user-facing text in Portuguese.
- Ensure the PWA works offline: service worker (generated at `public/sw.js` by `@ducanh2912/next-pwa`), OPFS-backed Bible reading, and proper loading/error states.

## Best Practices

- Use `"use client"` for all interactive components (layout is the only server component).
- Leverage existing shadcn components from `components/ui/` before creating new primitives.
- Handle loading, empty, and error states for every data-fetching component (OPFS reads can fail or be slow on first load).
- For verse navigation, use `useBibleVerses()` hook from `lib/use-bible.ts` — it handles the `BibleVersionContext` flow.
- Keep the service worker update flow working: `useServiceWorkerUpdate` / `update-banner.tsx` for stale-while-revalidate UX.
- Use the theme system: `next-themes` + CSS custom properties from `lib/theme.ts` — 15 palette options.
- Optimize for mobile-first; the primary audience reads on phones.

## Key Files

- `app/layout.tsx` — server layout and provider chain.
- `app/page.tsx` — main reader page.
- `components/` — domain UI components (reader, search, notes).
- `components/ui/` — shadcn/ui base-nova primitives (button, dialog, etc.).
- `lib/theme.ts` — 15 accent colors as CSS custom properties.
- `lib/use-bible.ts` — verse-fetch hook.
- `lib/bible-version-context.tsx` — central client state provider.
- `lib/use-sw-update.ts` — service worker update hook.
- `next.config.mjs` — PWA/Workbox config (headers, caching).

## Key Project Resources

- Documentation index: [`../docs/README.md`](../docs/README.md)
- Agent handbook: [`README.md`](README.md)

## Collaboration Checklist

1. Understand the feature: which screens, components, and user flows are affected.
2. Check existing components for reuse possibilities — don't reinvent.
3. Implement with Tailwind v4 + shadcn/ui; use `cn()` from `lib/utils.ts` for class merging.
4. Add loading/empty/error states for any async data (OPFS reads, API calls).
5. Verify offline behavior: disable network in DevTools and test the full flow.
6. Run `pnpm lint` and `pnpm build`.

## Hand-off Notes

List the components created or modified, any new shadcn dependencies added, and offline behavior notes (what works without network).
