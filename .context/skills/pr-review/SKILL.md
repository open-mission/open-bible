---
type: skill
name: Pr Review
description: Review pull requests against team standards and best practices. Use when Reviewing a pull request before merge, Providing feedback on proposed changes, or Validating PR meets project standards
skillSlug: pr-review
phases: [R, V]
generated: 2026-07-01
status: filled
scaffoldVersion: "2.0.0"
---
## Workflow

1. Read the PR description and linked issue to understand the goal.
2. Check the branch name follows convention (`feat/{nr}-desc`, `fix/{nr}-desc`, `improve/{nr}-desc` from `develop`).
3. Verify commits use semantic types (`feat:`, `fix:`, `improve:`) — validated by commitlint in CI.
4. Review code changes file by file, focusing on Open Bible-specific pitfalls.
5. Check that the PR does not modify `next.config.mjs` Workbox rules without explicit justification.
6. Verify the worker RPC contract (`lib/database/worker-types.ts`) is updated if new DB operations were added.
7. Ensure `pnpm lint` and `pnpm build` pass in CI.
8. Leave constructive feedback with specific file/line references.
9. Approve, request changes, or comment based on findings.

## Quality Bar

- Start by understanding the PR's goal and verifying the issue is referenced correctly (`Closes #nr`).
- Check for Open Bible gotchas: `ignoreBuildErrors: true` means type errors must be caught by eye; composite PK `(id, version_id)`; download `NetworkOnly` rule.
- Verify Portuguese UI strings — reject hardcoded English text in user-facing components.
- Confirm the PR keeps server/client search parity (`LIKE %q% COLLATE NOCASE`, no FTS).
- Check for CORS implications if the PR touches `/api/*` routes (open CORS for iOS companion app).
- Verify no secrets or env files are committed.
- Test the changes locally if complex.
- Approve only when confident in the changes.

## Examples

**Request changes (Open Bible-specific):**
```
Good start, but a few items need attention:

1. The new worker operation in `lib/database/worker-types.ts` is missing
   the request type — the existing `WorkerRequest` union needs an
   addition for `toggleHighlight`.
2. The PR adds an English toast message in `components/reader/verse-actions.tsx:42`
   — all user-facing strings must be Portuguese.
3. The search query in `lib/bible-db.ts:112` uses string interpolation
   instead of parameterized binding — this must use `?` placeholders
   for SQLite.

Please address these and I'll re-review.
```

## Resource Strategy

- Add `scripts/` only when the task is fragile, repetitive, or benefits from deterministic execution.
- Add `references/` only when details are too large or too variant-specific to keep in `SKILL.md`.
- Add `assets/` only for files that will be consumed in the final output.
- Keep extra docs out of the skill folder; prefer `SKILL.md` plus only the resources that materially help.
