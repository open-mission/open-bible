---
name: test-generation
description: Generate comprehensive test cases for code. Use when Writing tests for new functionality, Adding tests for bug fixes (regression tests), or Improving test coverage for existing code
---

## Workflow

1. Identify the function or component to test — prioritize pure functions with no side effects.
2. List the behaviors: happy path, edge cases, error conditions, boundary values.
3. Set up the test framework (Vitest recommended for Vite/Next.js compatibility).
4. Write tests using Arrange-Act-Assert pattern with descriptive names.
5. Mock external dependencies at the boundary (worker RPC, TursoDB, OPFS).
6. Run tests and confirm they pass.
7. Verify tests are deterministic and isolated — no shared state between tests.

## Quality Bar

- Test behavior, not implementation — focus on inputs and outputs.
- Use descriptive test names: `describe('parseVerseId')` → `it('should parse "1:2:3" into bookId=1, chapter=2, verse=3')`.
- Follow Arrange-Act-Assert pattern consistently.
- Keep tests independent and isolated — no shared mutable state.
- Don't test external libraries (SQLite, Drizzle, Hono, Better Auth).
- Mock at the boundary: mock the worker RPC for client DB tests, mock TursoDB for API tests.
- Aim for fast, reliable tests — pure function tests should complete in milliseconds.

## Examples

**Unit test for parseVerseId:**

```typescript
import { describe, it, expect } from 'vitest';
import { parseVerseId } from '@/verse-utils';

describe('parseVerseId', () => {
  it('should parse valid verse ID into components', () => {
    const result = parseVerseId('1:2:3');
    expect(result).toEqual({ bookId: 1, chapter: 2, verse: 3 });
  });

  it('should handle single-digit values', () => {
    const result = parseVerseId('19:119:176');
    expect(result).toEqual({ bookId: 19, chapter: 119, verse: 176 });
  });

  it('should throw on malformed input', () => {
    expect(() => parseVerseId('invalid')).toThrow();
    expect(() => parseVerseId('1:2')).toThrow();
    expect(() => parseVerseId('1:2:3:4')).toThrow();
  });

  it('should throw on non-numeric segments', () => {
    expect(() => parseVerseId('a:b:c')).toThrow();
  });
});
```

**Integration test for API version listing:**

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { listVersions } from '@/api/bible-service';

describe('listVersions', () => {
  it('should return all available Bible versions', async () => {
    const versions = await listVersions();
    expect(versions).toBeInstanceOf(Array);
    expect(versions.length).toBeGreaterThan(0);
    expect(versions[0]).toHaveProperty('id');
    expect(versions[0]).toHaveProperty('name');
  });

  it('should include metadata for each version', async () => {
    const versions = await listVersions();
    for (const v of versions) {
      expect(v).toHaveProperty('language');
      expect(v.language).toBe('pt');
    }
  });
});
```

## Resource Strategy

- Add `scripts/` only when the task is fragile, repetitive, or benefits from deterministic execution.
- Add `references/` only when details are too large or too variant-specific to keep in `SKILL.md`.
- Add `assets/` only for files that will be consumed in the final output.
- Keep extra docs out of the skill folder; prefer `SKILL.md` plus only the resources that materially help.
