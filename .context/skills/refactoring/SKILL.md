---
type: skill
name: Refactoring
description: Refactor code safely with a step-by-step approach. Use when Improving code structure without changing behavior, Reducing code duplication, or Simplifying complex logic
skillSlug: refactoring
phases: [E]
generated: 2026-07-01
status: filled
scaffoldVersion: "2.0.0"
---
## Workflow

1. Read the source code and understand its behavior before changing anything.
2. Run `pnpm build` and `pnpm lint` to establish a baseline — they must pass before refactoring.
3. Identify the specific improvement: extract function, rename symbol, simplify conditional, deduplicate logic.
4. Make one type of change at a time — never mix extraction with renaming or reformatting.
5. After each change, run `pnpm lint` and `pnpm build` to confirm no breakage.
6. Manually test the affected code path in `pnpm dev` — there are no automated tests to catch regressions.
7. Commit frequently with clear messages using the `refactor:` prefix.
8. Verify no behavior changes occurred.

## Examples

**Extract shared verse-utils logic:**

```typescript
// Before: Inline parsing in two places
// lib/bible-db.ts:45
const [book, ch, vs] = ref.split(':');

// lib/verse-utils.ts:12
export function parseVerseId(ref: string) {
  const [book, ch, vs] = ref.split(':');
  return { bookId: parseInt(book), chapter: parseInt(ch), verse: parseInt(vs) };
}

// After: Both callers use parseVerseId
import { parseVerseId } from '@/verse-utils';
const { bookId, chapter, verse } = parseVerseId(ref);
```

**Rename for project consistency:**

```typescript
// Before: Inconsistent naming
const bibleId = 'ara';
const translation = getVersion('ara');

// After: Use project convention (versionId)
const versionId = 'ara';
const version = getVersion(versionId);
```

## Quality Bar

- One refactoring type per commit — keep PRs focused and reviewable.
- Since there are no tests, manual verification in `pnpm dev` is essential for each change.
- Preserve existing API contracts and worker RPC message shapes.
- Use project-consistent naming: `versionId`, `bookId`, `chapter`, `verse`, `note`, `highlight`.
- If you find a bug during refactoring, fix it in a separate commit (use `fix:` prefix).
- Flag areas where test coverage would have caught regressions.

## Resource Strategy

- Add `scripts/` only when the task is fragile, repetitive, or benefits from deterministic execution.
- Add `references/` only when details are too large or too variant-specific to keep in `SKILL.md`.
- Add `assets/` only for files that will be consumed in the final output.
- Keep extra docs out of the skill folder; prefer `SKILL.md` plus only the resources that materially help.
