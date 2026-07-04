# Bible Download Fix Plan

**Date:** 2026-07-03
**Issues:** Empty books array for KJF version + Insert error into installed_bibles

---

## Problem Summary

### Issue 1: Empty books for KJF version
- **Endpoint:** `GET /api/bibles/kjf`
- **Response:** `{"id":"kjf","name":"KJF","totalBooks":66,"books":[]}`
- **Root Cause:** `bible_books` table in TursoDB has no rows for `version_id='kjf'`

### Issue 2: Insert error into installed_bibles
- **Error:** `Failed query: insert into "installed_bibles"...`
- **Location:** `lib/database/database.ts:79`
- **Root Cause:** `installed_bibles` table may not exist in local SQLite WASM database

---

## Root Cause Analysis

### Issue 1 Analysis
The `getVersionDetail` function queries:
1. `bible_versions WHERE id = 'kjf'` → Returns version row (id, name, total_books=66) ✓
2. `bible_books WHERE version_id = 'kjf'` → Returns 0 rows ✗

The version exists in `bible_versions` but has no corresponding books in `bible_books`. This means the `pnpm db:import` script either:
- Didn't find `KJF.sqlite` in `resources/bibles/`
- Or the import succeeded for `bible_versions` but failed for `bible_books`

### Issue 2 Analysis
The error occurs at `lib/database/database.ts:79` when calling `db.insert(schema.installedBibles)`. The error is caught at line 86 and logged, but the Bible file is still written to OPFS.

The most likely cause is that the **user database migrations haven't run** or failed silently, so the `installed_bibles` table doesn't exist in the local SQLite WASM database (`app.db`).

---

## Implementation Plan

### Phase 1: Diagnostic Endpoints (Temporary)

#### 1.1 Add diagnostic route to check TursoDB data
- **File:** `lib/api/hono-app.ts`
- **Action:** Add temporary endpoint `GET /api/debug/bibles-data`
- **Purpose:** Query and return:
  - All versions from `bible_versions` with counts
  - All distinct `version_id` values from `bible_books`
  - Count of books per version
  - Specifically check if KJF has books

### Phase 2: Fix Insert Issue (Issue 2)

#### 2.1 Add migration verification in `installBible`
- **File:** `lib/database/database.ts`
- **Action:** Before inserting into `installed_bibles`:
  1. Verify the table exists by querying `sqlite_master`
  2. If table doesn't exist, re-run migrations
  3. Then retry the insert

#### 2.2 Add table existence check to DatabaseManager
- **File:** `lib/database/DatabaseManager.ts`
- **Action:** Add method `tableExists(dbPath, tableName)` to check if a table exists

### Phase 3: Fix Empty Books Issue (Issue 1)

#### 3.1 Add graceful handling in version detail
- **File:** `lib/api/bible-service.ts`
- **Action:** In `getVersionDetail`:
  - If `bible_books` is empty but `total_books > 0` in `bible_versions`
  - Log a warning: "Version {id} exists but has no books in bible_books"
  - Return the version with empty books array (current behavior)
  - Add a `warning` field to the response

### Phase 4: Cleanup

#### 4.1 Remove diagnostic endpoints (after verification)
- Remove `GET /api/debug/bibles-data` route
- Remove temporary logging

---

## Files to Modify

| File | Changes |
|------|---------|
| `lib/api/hono-app.ts` | Add diagnostic endpoint |
| `lib/api/bible-service.ts` | Add warning for missing books |
| `lib/database/database.ts` | Add migration verification, improve error handling |
| `lib/database/DatabaseManager.ts` | Add method to check table existence |

---

## Expected Outcomes

1. **Issue 1:** API will return version data with a warning field indicating missing books
2. **Issue 2:** Install will verify migrations before insert, preventing table-not-found errors
3. **Diagnostics:** Temporary endpoint to verify TursoDB data for debugging

---

## Verification Steps

1. Test `GET /api/debug/bibles-data` to verify TursoDB data
2. Test `GET /api/bibles/kjf` to see warning field
3. Test Bible install flow to verify insert works
4. Remove diagnostic endpoint after verification
