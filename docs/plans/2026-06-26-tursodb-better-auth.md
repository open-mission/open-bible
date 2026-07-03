# TursoDB + Better Auth Implementation Plan (Phase 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up TursoDB as the database backend and Better Auth for user authentication, replacing localStorage for highlights and notes.

**Architecture:** TursoDB (serverless/libSQL) on Vercel + Better Auth for authentication. Single database with tables for auth (Better Auth managed), highlights, and notes. Bible data migration deferred to Phase 2.

**Tech Stack:** `@tursodatabase/serverless`, `better-auth`, Next.js App Router, Hono API

## Global Constraints

- Deploy target: Vercel (serverless/edge)
- Package manager: pnpm
- TypeScript strict mode
- Portuguese UI strings
- Existing Hono API at `app/api/[[...route]]/route.ts` preserved

---

## File Structure

| File | Responsibility |
|------|----------------|
| `lib/turso.ts` | TursoDB serverless client singleton |
| `lib/auth.ts` | Better Auth server config |
| `lib/auth-client.ts` | Better Auth React client |
| `app/api/auth/[...all]/route.ts` | Better Auth Next.js route handler |
| `lib/db/schema.ts` | Database schema definitions (highlights, notes) |
| `lib/db/index.ts` | Database client export |
| `.env.local` | Environment variables (gitignored) |

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Dependencies to install:**

- [ ] **Step 1: Install TursoDB and Better Auth**

```bash
pnpm add @tursodatabase/serverless better-auth
```

- [ ] **Step 2: Install Turso CLI for local dev**

```bash
pnpm add -D @tursodatabase/libsql
```

- [ ] **Step 3: Verify installation**

```bash
pnpm ls @tursodatabase/serverless better-auth
```

Expected: Both packages listed in output.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "deps: add @tursodatabase/serverless and better-auth"
```

---

### Task 2: Create Environment Variables

**Files:**
- Create: `.env.local`

- [ ] **Step 1: Create .env.local with required variables**

```bash
cat > .env.local << 'EOF'
# TursoDB
TURSO_DATABASE_URL=file:local.db
TURSO_AUTH_TOKEN=

# Better Auth
BETTER_AUTH_SECRET=dev-secret-change-in-production-min-32-chars!!
BETTER_AUTH_URL=http://localhost:3000
EOF
```

- [ ] **Step 2: Add .env.local to .gitignore if not present**

Check `grep -q ".env.local" .gitignore || echo ".env.local" >> .gitignore`

- [ ] **Step 3: Commit (env file NOT committed)**

```bash
git add .gitignore
git commit -m "chore: add .env.local to gitignore"
```

---

### Task 3: Create TursoDB Client

**Files:**
- Create: `lib/turso.ts`

**Interfaces:**
- Produces: `turso` client instance for database operations

- [ ] **Step 1: Create TursoDB client**

```typescript
// lib/turso.ts
import { createClient } from "@tursodatabase/serverless";

function getTursoClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error("TURSO_DATABASE_URL is required");
  }

  return createClient({
    url,
    authToken: authToken || undefined,
  });
}

export const turso = getTursoClient();
```

- [ ] **Step 2: Commit**

```bash
git add lib/turso.ts
git commit -m "feat: add TursoDB serverless client"
```

---

### Task 4: Create Database Schema

**Files:**
- Create: `lib/db/schema.ts`
- Create: `lib/db/index.ts`

**Interfaces:**
- Produces: `highlights`, `notes` tables; `db` client export

- [ ] **Step 1: Create database schema file**

```typescript
// lib/db/schema.ts
export const highlightsTable = {
  name: "highlights",
  columns: {
    id: "TEXT PRIMARY KEY",
    userId: "TEXT NOT NULL",
    versionId: "TEXT",
    verseId: "TEXT NOT NULL",
    color: "TEXT NOT NULL",
    customHex: "TEXT",
    createdAt: "TEXT NOT NULL",
  },
};

export const notesTable = {
  name: "notes",
  columns: {
    id: "TEXT PRIMARY KEY",
    userId: "TEXT NOT NULL",
    verseIds: "TEXT NOT NULL",
    content: "TEXT NOT NULL",
    createdAt: "TEXT NOT NULL",
    updatedAt: "TEXT NOT NULL",
  },
};

export const bibleVersionsTable = {
  name: "bible_versions",
  columns: {
    id: "TEXT PRIMARY KEY",
    name: "TEXT NOT NULL",
    totalBooks: "INTEGER NOT NULL",
  },
};

export const bibleBooksTable = {
  name: "bible_books",
  columns: {
    id: "TEXT PRIMARY KEY",
    versionId: "TEXT NOT NULL",
    name: "TEXT NOT NULL",
    abbreviation: "TEXT NOT NULL",
    testament: "TEXT NOT NULL",
    chapters: "INTEGER NOT NULL",
  },
};

export const bibleVersesTable = {
  name: "bible_verses",
  columns: {
    id: "TEXT PRIMARY KEY",
    versionId: "TEXT NOT NULL",
    bookId: "TEXT NOT NULL",
    chapter: "INTEGER NOT NULL",
    verse: "INTEGER NOT NULL",
    text: "TEXT NOT NULL",
  },
};

export const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS highlights (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    version_id TEXT,
    verse_id TEXT NOT NULL,
    color TEXT NOT NULL,
    custom_hex TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    verse_ids TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bible_versions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    total_books INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bible_books (
    id TEXT PRIMARY KEY,
    version_id TEXT NOT NULL,
    name TEXT NOT NULL,
    abbreviation TEXT NOT NULL,
    testament TEXT NOT NULL,
    chapters INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bible_verses (
    id TEXT PRIMARY KEY,
    version_id TEXT NOT NULL,
    book_id TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    text TEXT NOT NULL
  );
`;
```

- [ ] **Step 2: Create database client with schema initialization**

```typescript
// lib/db/index.ts
import { turso } from "@/lib/turso";
import { SCHEMA_SQL } from "./schema";

export async function initializeDatabase() {
  const statements = SCHEMA_SQL.split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    await turso.execute(stmt);
  }
}

export { turso };
```

- [ ] **Step 3: Commit**

```bash
git add lib/db/schema.ts lib/db/index.ts
git commit -m "feat: add database schema and client"
```

---

### Task 5: Set Up Better Auth

**Files:**
- Create: `lib/auth.ts`
- Create: `lib/auth-client.ts`

**Interfaces:**
- Produces: `auth` server instance, `authClient` React client

- [ ] **Step 1: Create Better Auth server config**

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { createClient } from "@tursodatabase/serverless";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

export const auth = betterAuth({
  database: {
    type: "sqlite",
    url: process.env.TURSO_DATABASE_URL!,
  },
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});
```

- [ ] **Step 2: Create Better Auth client**

```typescript
// lib/auth-client.ts
"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

- [ ] **Step 3: Commit**

```bash
git add lib/auth.ts lib/auth-client.ts
git commit -m "feat: add Better Auth server and client config"
```

---

### Task 6: Create Auth API Route

**Files:**
- Create: `app/api/auth/[...all]/route.ts`

**Interfaces:**
- Consumes: `auth` from `lib/auth.ts`
- Produces: GET/POST handlers for `/api/auth/*`

- [ ] **Step 1: Create auth route handler**

```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

export const GET = handler.GET;
export const POST = handler.POST;
```

- [ ] **Step 2: Verify auth routes work**

Start dev server and check:
```bash
pnpm dev
# In another terminal:
curl http://localhost:3000/api/auth/get-session
```

Expected: JSON response (likely `null` session).

- [ ] **Step 3: Commit**

```bash
git add app/api/auth/\[...all\]/route.ts
git commit -m "feat: add Better Auth Next.js route handler"
```

---

### Task 7: Create Database Initialization Script

**Files:**
- Create: `scripts/init-db.mjs`

**Interfaces:**
- Consumes: `SCHEMA_SQL` from `lib/db/schema.ts`
- Produces: Database tables created on first run

- [ ] **Step 1: Create initialization script**

```javascript
// scripts/init-db.mjs
import { readFileSync } from "fs";
import { join } from "path";

async function initDB() {
  const { createClient } = await import("@tursodatabase/serverless");

  const client = createClient({
    url: process.env.TURSO_DATABASE_URL || "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  });

  const schemaPath = join(process.cwd(), "lib/db/schema.ts");
  const schemaContent = readFileSync(schemaPath, "utf-8");

  // Extract SQL from SCHEMA_SQL constant
  const sqlMatch = schemaContent.match(/SCHEMA_SQL\s*=\s*`([\s\S]*?)`/);
  if (!sqlMatch) {
    console.error("Could not find SCHEMA_SQL in schema.ts");
    process.exit(1);
  }

  const sql = sqlMatch[1];
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    console.log(`Executing: ${stmt.substring(0, 50)}...`);
    await client.execute(stmt);
  }

  console.log("Database initialized successfully!");
}

initDB().catch(console.error);
```

- [ ] **Step 2: Add init script to package.json**

```bash
node -e "
const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8'));
pkg.scripts['db:init'] = 'node scripts/init-db.mjs';
require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"
```

- [ ] **Step 3: Commit**

```bash
git add scripts/init-db.mjs package.json
git commit -m "feat: add database initialization script"
```

---

### Task 8: Update Store to Support Auth

**Files:**
- Modify: `lib/store.ts`

**Interfaces:**
- Consumes: `authClient` from `lib/auth-client.ts`
- Produces: Updated `useHighlights()`, `useNotes()` hooks with user context

- [ ] **Step 1: Add user-aware store hooks**

Add to the top of `lib/store.ts`:

```typescript
import { useSession } from "@/lib/auth-client";
```

- [ ] **Step 2: Create API helper functions for highlights**

```typescript
// Add after imports in lib/store.ts
async function fetchHighlights(userId: string): Promise<Highlight[]> {
  const res = await fetch(`/api/highlights?userId=${userId}`);
  if (!res.ok) return [];
  return res.json();
}

async function saveHighlight(highlight: Highlight, userId: string): Promise<void> {
  await fetch("/api/highlights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...highlight, userId }),
  });
}

async function deleteHighlightFromDB(id: string, userId: string): Promise<void> {
  await fetch(`/api/highlights?id=${id}&userId=${userId}`, {
    method: "DELETE",
  });
}
```

- [ ] **Step 3: Create API helper functions for notes**

```typescript
async function fetchNotes(userId: string): Promise<Note[]> {
  const res = await fetch(`/api/notes?userId=${userId}`);
  if (!res.ok) return [];
  return res.json();
}

async function saveNote(note: Note, userId: string): Promise<void> {
  await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...note, userId }),
  });
}

async function deleteNoteFromDB(id: string, userId: string): Promise<void> {
  await fetch(`/api/notes?id=${id}&userId=${userId}`, {
    method: "DELETE",
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/store.ts
git commit -m "feat: add API helpers for highlights and notes"
```

---

### Task 9: Create Highlights API

**Files:**
- Create: `app/api/highlights/route.ts`

**Interfaces:**
- Consumes: `turso` from `lib/turso`
- Produces: GET, POST, DELETE handlers for `/api/highlights`

- [ ] **Step 1: Create highlights API route**

```typescript
// app/api/highlights/route.ts
import { turso } from "@/lib/turso";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const { rows } = await turso.execute({
    sql: "SELECT * FROM highlights WHERE user_id = ? ORDER BY created_at DESC",
    args: [userId],
  });

  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id, userId, versionId, verseId, color, customHex, createdAt } = body;

  if (!id || !userId || !verseId || !color || !createdAt) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await turso.execute({
    sql: `INSERT OR REPLACE INTO highlights (id, user_id, version_id, verse_id, color, custom_hex, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [id, userId, versionId || null, verseId, color, customHex || null, createdAt],
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const userId = request.nextUrl.searchParams.get("userId");

  if (!id || !userId) {
    return NextResponse.json({ error: "id and userId required" }, { status: 400 });
  }

  await turso.execute({
    sql: "DELETE FROM highlights WHERE id = ? AND user_id = ?",
    args: [id, userId],
  });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/highlights/route.ts
git commit -m "feat: add highlights CRUD API"
```

---

### Task 10: Create Notes API

**Files:**
- Create: `app/api/notes/route.ts`

**Interfaces:**
- Consumes: `turso` from `lib/turso`
- Produces: GET, POST, DELETE handlers for `/api/notes`

- [ ] **Step 1: Create notes API route**

```typescript
// app/api/notes/route.ts
import { turso } from "@/lib/turso";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const { rows } = await turso.execute({
    sql: "SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC",
    args: [userId],
  });

  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id, userId, verseIds, content, createdAt, updatedAt } = body;

  if (!id || !userId || !verseIds || !content || !createdAt || !updatedAt) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await turso.execute({
    sql: `INSERT OR REPLACE INTO notes (id, user_id, verse_ids, content, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, userId, JSON.stringify(verseIds), content, createdAt, updatedAt],
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const userId = request.nextUrl.searchParams.get("userId");

  if (!id || !userId) {
    return NextResponse.json({ error: "id and userId required" }, { status: 400 });
  }

  await turso.execute({
    sql: "DELETE FROM notes WHERE id = ? AND user_id = ?",
    args: [id, userId],
  });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/notes/route.ts
git commit -m "feat: add notes CRUD API"
```

---

### Task 11: Test the Integration

**Files:**
- Test: Manual verification

- [ ] **Step 1: Start dev server**

```bash
pnpm dev
```

- [ ] **Step 2: Test auth endpoint**

```bash
curl http://localhost:3000/api/auth/get-session
```

Expected: `null` or session object.

- [ ] **Step 3: Test highlights API (unauthenticated)**

```bash
curl "http://localhost:3000/api/highlights?userId=test-user"
```

Expected: `[]` (empty array).

- [ ] **Step 4: Test notes API (unauthenticated)**

```bash
curl "http://localhost:3000/api/notes?userId=test-user"
```

Expected: `[]` (empty array).

- [ ] **Step 5: Stop dev server and commit**

```bash
# Ctrl+C in dev server terminal
git add -A
git commit -m "chore: verify TursoDB + Better Auth integration"
```

---

## Summary

After completing this plan:

1. TursoDB client configured in `lib/turso.ts`
2. Better Auth configured in `lib/auth.ts` and `lib/auth-client.ts`
3. Auth API routes at `/api/auth/*`
4. Database schema for highlights, notes, and Bible data
5. CRUD APIs for highlights and notes
6. Ready for Phase 2 (Bible data migration) and Phase 3 (offline sync)
