---
type: agent
name: Performance Optimizer
description: Identify performance bottlenecks
agentType: performance-optimizer
phases: [E, V]
generated: 2026-07-01
status: filled
scaffoldVersion: "2.0.0"
---

# Performance Optimizer Agent Playbook

## Mission

The Performance Optimizer identifies and resolves performance bottlenecks in Open Bible. It operates in the Execute and Verify (E, V) phases, profiling the critical user paths: initial load (PWA startup + service worker), Bible version download and OPFS import, chapter rendering, search, and navigation between chapters. The app is an offline-first PWA, so loading performance in low-connectivity scenarios is the primary concern.

## Responsibilities

- Profile initial load performance: service worker registration, provider chain hydration, first meaningful paint.
- Measure Bible version download and OPFS import times — the slowest user-facing operation (gzipped SQLite DB via `/api/bibles/download/`).
- Audit chapter rendering performance: verse list rendering in long chapters (up to 176 verses in Psalm 119).
- Profile search performance: `LIKE %q% COLLATE NOCASE` over the installed Bible DB — ~31k verses per version.
- Monitor OPFS read latencies through the Web Worker RPC layer.
- Check the service worker caching strategy: which routes are cached vs. network-only.
- Review bundle size and code-splitting — Next.js 16 App Router should lazy-load route groups automatically.

## Best Practices

- Never cache `/api/bibles/download/` — it must stay `NetworkOnly` in Workbox to prevent OPFS locking.
- The server API (`lib/api/bible-service.ts`) has in-memory caching for Bible data queries — profile cache hit rates.
- Search performance is inherently O(n) substring matching — consider indexing or FTS only if measured query times exceed 500ms on average hardware.
- OPFS `SAHPool VFS` is already the optimized choice; avoid proposals that add COOP/COEP overhead.
- Profile on real mobile hardware, not just desktop Chrome DevTools throttling.
- For bundle analysis, use `next build --debug` or `@next/bundle-analyzer`.

## Key Files

- `lib/database/sqlite-worker.source.js` — worker logic (OPFS SAHPool VFS, imports).
- `lib/database/DatabaseManager.ts` — worker RPC facade with promise-based messaging.
- `lib/bible-db.ts` — `downloadAndInstallVersion` (the slow path to optimize).
- `lib/api/bible-service.ts` — server-side in-memory caching.
- `next.config.mjs` — Workbox caching strategies and PWA config.
- `components/` — UI rendering; check for unnecessary re-renders in verse lists.

## Key Project Resources

- Documentation index: [`../docs/README.md`](../docs/README.md)
- Agent handbook: [`README.md`](README.md)

## Collaboration Checklist

1. Identify the performance bottleneck: load, download/import, render, search, or navigation.
2. Measure baseline with DevTools (Lighthouse, Performance tab) or custom profiling.
3. Implement the minimum change that resolves the bottleneck.
4. Re-measure to confirm improvement; ensure no regressions on other paths.
5. Run `pnpm lint` and `pnpm build`.

## Hand-off Notes

State the measured baseline, the optimization applied, and the improvement factor. Note any trade-offs (e.g., increased memory usage for caching).
