---
name: security-audit
description: Review code and infrastructure for security weaknesses. Use when Reviewing code for security vulnerabilities, Assessing authentication/authorization, or Checking for OWASP top 10 issues
---

## Workflow

1. Review the Better Auth implementation: `lib/auth.ts` (server config), `lib/auth-client.ts` (client helper), `app/api/auth/[...all]/route.ts`.
2. Check authorization on all API endpoints — Bible reading is public, but account management should require auth.
3. Verify all API inputs are validated with Zod schemas (`lib/api/schemas.ts`).
4. Look for SQL injection in search queries — parameterized `LIKE` with bound parameters required.
5. Check for sensitive data exposure in the download proxy (`/api/bibles/download/`).
6. Review CORS configuration — open on `/api/*` for iOS companion app.
7. Check the Workbox config for caching of authenticated or download routes.
8. Verify `.env.local` is git-ignored and no secrets are hardcoded.
9. Document findings with severity.

## Quality Bar

- The attack surface is auth (Better Auth), API (Hono + Zod), download proxy, and OPFS client storage.
- No role/permission tiers exist — auth gates account features, reading is open.
- User data stays client-side by default (OPFS `app.db`); sync is a future feature.
- Emergency response: rotate `BETTER_AUTH_SECRET` to invalidate all sessions.
- Search is `LIKE %q% COLLATE NOCASE` — already parameterized; verify it stays parameterized.

## Examples

**Security audit findings for Open Bible:**

```
## Security Audit Report

### High
1. Missing input validation in /api/bibles/search
   - The `q` parameter is used directly in SQL LIKE clause
   - Verify it's bound as `?` parameter, not interpolated
   - Fix verified: `lib/api/bible-service.ts:127` uses parameterized query

### Medium
2. CORS too permissive for state-changing endpoints
   - All `/api/*` routes have open CORS
   - Currently acceptable because no state-changing endpoints exist under this router
   - Risk: if a notes-sync endpoint is added, CORS must be restricted
   - Recommendation: document this in the security docs

### Low
3. No rate limiting on /api/auth/login
   - Better Auth handles brute-force internally? Verify.
   - Recommendation: confirm Better Auth rate limiting is configured

### Recommendations
- Consider adding CSP headers for PWA
- Document the open CORS decision for the iOS companion app
```

## Resource Strategy

- Add `scripts/` only when the task is fragile, repetitive, or benefits from deterministic execution.
- Add `references/` only when details are too large or too variant-specific to keep in `SKILL.md`.
- Add `assets/` only for files that will be consumed in the final output.
- Keep extra docs out of the skill folder; prefer `SKILL.md` plus only the resources that materially help.
