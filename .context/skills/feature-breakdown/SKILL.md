---
type: skill
name: Feature Breakdown
description: Break down features into implementable tasks. Use when Planning new feature implementation, Breaking large tasks into smaller pieces, or Creating implementation roadmap
skillSlug: feature-breakdown
phases: [P]
generated: 2026-07-01
status: filled
scaffoldVersion: "2.0.0"
---
## Workflow

1. Understand the full feature requirements from the issue/spec.
2. Identify which layers the feature touches: API (`lib/api/`), client DB worker (`lib/database/`), React context/hooks (`lib/`), UI (`components/`, `app/`), or PWA config (`next.config.mjs`).
3. Break into independent, testable tasks following Open Bible's architecture patterns.
4. Identify dependencies between tasks (e.g., "add RPC message" must precede "wire up UI").
5. Order tasks by dependency and priority.
6. Add acceptance criteria to each task.
7. Flag any unknowns or risks specific to Open Bible (OPFS locking, Workbox caching, composite PKs, etc.).

## Examples

**Example: Add verse highlighting feature**

```
## Feature: Verse Highlighting

### Task 1: Database schema
- Add `highlights` table to user schema (`lib/database/user/schema.ts`)
- Add Drizzle insert/select types for highlights
- Create client migration (`lib/database/user/migrations/`)
- Wire migration into `runUserMigrations`
- Acceptance: Migration runs without error in browser console

### Task 2: Worker RPC contract
- Add `highlightVerse`, `removeHighlight`, `getHighlights` operations
- Define request/response types in `lib/database/worker-types.ts`
- Implement handlers in `lib/database/sqlite-worker.source.js`
- Acceptance: Worker responds correctly to new message types

### Task 3: Repository layer
- Add highlights repository (`lib/database/user/repositories/highlightsRepository.ts`)
- Wire repository calls through `DatabaseManager`
- Acceptance: Can create/read/delete highlights via DatabaseManager API

### Task 4: React context / hook
- Add highlight state to `BibleVersionContext` or create a dedicated context
- Create `use-highlights.ts` hook
- Wire into verse tap/long-press handlers
- Acceptance: Highlights persist across chapter navigation

### Task 5: UI components
- Add highlight color picker to verse selection
- Show highlighted verses with colored background
- Add highlight management UI (list/remove highlights per chapter)
- Acceptance: Visual highlight appears and persists on reload

### Dependencies:
Task 1 → Task 2 → Task 3 → Task 4 → Task 5
```

## Quality Bar

- Each task should be independently testable in `pnpm dev`.
- Tasks should be small enough to complete in a day (max 2-3 files changed per task).
- Clearly state acceptance criteria with measurable outcomes.
- Identify and document dependencies — especially data flow direction (DB → worker → context → UI).
- Flag technical risks: OPFS migration safety, Workbox cache interactions, composite PK handling.
- Consider parallel work opportunities (e.g., UI sketches while DB layer is being built).

## Resource Strategy

- Add `scripts/` only when the task is fragile, repetitive, or benefits from deterministic execution.
- Add `references/` only when details are too large or too variant-specific to keep in `SKILL.md`.
- Add `assets/` only for files that will be consumed in the final output.
- Keep extra docs out of the skill folder; prefer `SKILL.md` plus only the resources that materially help.
