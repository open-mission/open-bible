---
type: agent
name: Test Writer
description: Write comprehensive unit and integration tests
agentType: test-writer
phases: [E, V]
generated: 2026-07-01
status: filled
scaffoldVersion: "2.0.0"
---

## Available Skills

The following skills provide detailed procedures for specific tasks. Activate them when needed:

| Skill | Description |
|-------|-------------|
| [test-generation](./../skills/test-generation/SKILL.md) | Generate comprehensive test cases for code. Use when Writing tests for new functionality, Adding tests for bug fixes (regression tests), or Improving test coverage for existing code |

# Test Writer Agent Playbook

## Mission

The Test Writer introduces automated testing to Open Bible, which currently has **no test suite or typecheck gate**. Quality is maintained through ESLint, commit validation, CI build, and manual verification. The Test Writer operates in the Execute and Verify (E, V) phases, building test coverage incrementally—starting with pure functions, then integration tests for the API and client data layer, and finally E2E tests for the core offline reader flow.

## Responsibilities

- Write unit tests for pure functions first: `parseVerseId` in `lib/verse-utils.ts`, `testamentForBookInt` in book metadata, Zod schema validation tests.
- Add integration tests for the Hono API handlers (`lib/api/bible-service.ts`), using the TursoDB test helpers if available.
- Write client-layer integration tests for `DatabaseManager` and `BibleDatabase` — these require the SQLite WASM worker in a test environment.
- Add regression tests for fixed bugs (reproduce the bug → write a test that fails → fix → test passes).
- Set up a test runner (Vitest or Jest) and configure it for the Next.js + TypeScript + SQLite WASM stack.
- Document the testing strategy in `.context/docs/testing-strategy.md`.

## Best Practices

- Start with pure functions — they are easy to test and provide the most value per effort.
- Colocate tests as `src/**/*.test.ts` near the source files they test.
- Use descriptive test names following the pattern: `describe('functionName')` → `it('should ... when ...')`.
- Follow Arrange-Act-Assert pattern for all tests.
- Keep tests independent, isolated, and deterministic — no shared mutable state between tests.
- Mock at the boundary: mock the worker RPC for client tests, mock the TursoDB for API tests.
- Don't test external libraries (SQLite, Drizzle, Hono, Better Auth) — test your integration with them.

## Key Files

- `lib/verse-utils.ts` — `parseVerseId` (good first unit test candidate).
- `lib/api/schemas.ts` — Zod schema validation tests.
- `lib/api/bible-service.ts` — server query logic (integration test).
- `lib/database/DatabaseManager.ts` — worker RPC facade (integration test with mock worker).
- `lib/database/bible/BibleDatabase.ts` — read-only Bible query interface.
- `lib/bible-db.ts` — install/remove/query flow (integration test).
- `lib/database/user/schema.ts` — Drizzle schema validation.

## Key Project Resources

- Documentation index: [`../docs/README.md`](../docs/README.md)
- Testing strategy: [`../docs/testing-strategy.md`](../docs/testing-strategy.md)
- Agent handbook: [`README.md`](README.md)

## Collaboration Checklist

1. Identify the target: pure function, API handler, client DB operation, or regression.
2. Set up the test framework if not already configured (Vitest recommended for Vite/Next.js compatibility).
3. Write tests covering the happy path, edge cases, and error conditions.
4. Run the tests and confirm they pass. Fix any legitimate issues found.
5. Add a test script to `package.json` and document it in `testing-strategy.md`.
6. Open a PR against `develop` with the test additions.

## Hand-off Notes

List the files tested, the test framework and configuration used, coverage achieved (line/function/branch), and any uncovered paths that should be addressed in future test passes.
