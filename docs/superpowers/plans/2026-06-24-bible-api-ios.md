# Bible API iOS — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add mobile-optimized API endpoints with `?compact=true` parameter, CORS support, and a new books endpoint for iOS app consumption.

**Architecture:** Extend the existing Hono + OpenAPI API with query parameter support for compact responses, add CORS middleware for iOS native app access, and create a new endpoint for listing books. Update Scalar documentation.

**Tech Stack:** Hono, Zod-OpenAPI, Scalar, Next.js App Router

---

## Global Constraints

- TypeScript strict mode (`tsconfig.json`)
- `@/` path alias to project root
- Portuguese UI strings (pt-BR)
- No breaking changes to existing API consumers
- `runtime = "nodejs"` in route handler (required for `fs.readFile`)
- All existing schemas and types must remain unchanged

---

## Task 1: Add Compact Schemas

**Files:**
- Modify: `lib/api/schemas.ts`

**Interfaces:**
- Consumes: none (first task)
- Produces: `CompactVersionSchema`, `CompactVersionDetailSchema`, `CompactBookSchema`, `CompactChapterResponseSchema`, `CompactSearchResultSchema`, `BooksListSchema`, and their TypeScript types

- [ ] **Step 1: Add compact schemas to `lib/api/schemas.ts`**

Add the following after the existing `SearchResultSchema` (before the type exports):

```typescript
// ─── Compact schemas (mobile-optimized) ───────────────────────────

export const CompactVersionSchema = z.object({
  id: z.string().openapi({ example: "acf" }),
  name: z.string().openapi({ example: "Almeida Corrigida e Fiel" }),
})

export const CompactBookSchema = z.object({
  id: z.string().openapi({ example: "gen" }),
  name: z.string().openapi({ example: "Gênesis" }),
  abbreviation: z.string().openapi({ example: "Gn" }),
  testament: z.enum(["old", "new"]).openapi({ example: "old" }),
})

export const CompactVersionDetailSchema = z.object({
  id: z.string().openapi({ example: "acf" }),
  name: z.string().openapi({ example: "Almeida Corrigida e Fiel" }),
  books: z.array(CompactBookSchema),
})

export const CompactChapterResponseSchema = z.object({
  version: z.string().openapi({ example: "acf" }),
  bookId: z.string().openapi({ example: "gen" }),
  chapter: z.number().openapi({ example: 1 }),
  verses: z.array(VerseSchema),
})

export const CompactSearchResultSchema = z.object({
  version: z.string().openapi({ example: "acf" }),
  query: z.string().openapi({ example: "amor" }),
  results: z.array(VerseSchema),
})

export const BooksListSchema = z.object({
  version: z.string().openapi({ example: "acf" }),
  books: z.array(BookSchema),
})

// ─── Compact types ────────────────────────────────────────────────

export type CompactVersion = z.infer<typeof CompactVersionSchema>
export type CompactBook = z.infer<typeof CompactBookSchema>
export type CompactVersionDetail = z.infer<typeof CompactVersionDetailSchema>
export type CompactChapterResponse = z.infer<typeof CompactChapterResponseSchema>
export type CompactSearchResult = z.infer<typeof CompactSearchResultSchema>
export type BooksList = z.infer<typeof BooksListSchema>
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add lib/api/schemas.ts
git commit -m "feat(api): add compact schemas for mobile-optimized responses"
```

---

## Task 2: Add Compact Service Functions

**Files:**
- Modify: `lib/api/bible-service.ts`

**Interfaces:**
- Consumes: existing `readJSON`, `getVersionDetail`, `listVersions` functions
- Produces: `listBooksForVersion` function

- [ ] **Step 1: Add `listBooksForVersion` function to `lib/api/bible-service.ts`**

Add the following after the `getChapterVerses` function (before `searchVerses`):

```typescript
export async function listBooksForVersion(
  versionId: string
): Promise<{ version: string; books: { id: string; name: string; abbreviation: string; testament: "old" | "new"; chapters: number }[] } | null> {
  try {
    const meta = await getVersionDetail(versionId)
    if (!meta) return null

    return {
      version: versionId,
      books: meta.books.map((b) => ({
        id: b.id,
        name: b.name,
        abbreviation: b.abbreviation,
        testament: b.testament,
        chapters: b.chapters,
      })),
    }
  } catch {
    return null
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add lib/api/bible-service.ts
git commit -m "feat(api): add listBooksForVersion service function"
```

---

## Task 3: Add CORS Middleware

**Files:**
- Modify: `lib/api/hono-app.ts`

**Interfaces:**
- Consumes: existing `app` instance
- Produces: CORS headers on all responses, OPTIONS preflight handling

- [ ] **Step 1: Add CORS middleware to `lib/api/hono-app.ts`**

Add the following immediately after the `app` instantiation (after line 23, before the `// ─── Type helper` comment):

```typescript
// ─── CORS middleware ──────────────────────────────────────────────

app.use("*", async (c, next) => {
  c.header("Access-Control-Allow-Origin", "*")
  c.header("Access-Control-Allow-Methods", "GET, OPTIONS")
  c.header("Access-Control-Allow-Headers", "Content-Type")
  if (c.req.method === "OPTIONS") {
    return c.text("", 204)
  }
  return next()
})
```

- [ ] **Step 2: Export OPTIONS handler in route.ts**

Modify `app/api/[[...route]]/route.ts` to add:

```typescript
import { app } from "@/lib/api/hono-app"

export const runtime = "nodejs"

export async function GET(request: Request) {
  return app.fetch(request)
}

export async function POST(request: Request) {
  return app.fetch(request)
}

export async function OPTIONS(request: Request) {
  return app.fetch(request)
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Test CORS with dev server**

Run: `pnpm dev`
In another terminal:
```bash
curl -I -X OPTIONS http://localhost:3000/api/bibles
```
Expected: Response with `Access-Control-Allow-Origin: *` header

- [ ] **Step 5: Commit**

```bash
git add lib/api/hono-app.ts app/api/\[\[...route\]\]/route.ts
git commit -m "feat(api): add CORS middleware for iOS app access"
```

---

## Task 4: Update List Versions Endpoint with Compact Support

**Files:**
- Modify: `lib/api/hono-app.ts`

**Interfaces:**
- Consumes: `listVersions` from bible-service, `CompactVersionSchema`, `VersionSchema` from schemas
- Produces: `GET /api/bibles` returns compact or full format based on `?compact=true`

- [ ] **Step 1: Update `listVersionsRoute` in `lib/api/hono-app.ts`**

Replace the existing `listVersionsRoute` definition and handler (lines 33-50) with:

```typescript
const listVersionsRoute = createRoute({
  method: "get",
  path: "/api/bibles",
  summary: "Listar versões da Bíblia",
  description: "Retorna todas as versões bíblicas disponíveis. Use `?compact=true` para formato otimizado para mobile.",
  tags: ["Versões"],
  request: {
    query: z.object({
      compact: z.enum(["true", "false"]).optional().openapi({
        param: { name: "compact", in: "query" },
        example: "true",
        description: "Retorna formato compacto (sem totalBooks). Padrão: false.",
      }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(VersionSchema),
        },
      },
      description: "Lista de versões disponíveis",
    },
  },
})

app.openapi(listVersionsRoute, async (c) => {
  const { compact } = c.req.valid("query")
  const versions = await listVersions()
  if (compact === "true") {
    return c.json(versions.map((v) => ({ id: v.id, name: v.name })))
  }
  return c.json(versions)
})
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Test both formats**

Run: `pnpm dev`
In another terminal:
```bash
# Full format
curl http://localhost:3000/api/bibles | head -c 200
# Compact format
curl http://localhost:3000/api/bibles?compact=true | head -c 200
```
Expected: Full format has `totalBooks`, compact format does not

- [ ] **Step 4: Commit**

```bash
git add lib/api/hono-app.ts
git commit -m "feat(api): add compact support to list versions endpoint"
```

---

## Task 5: Update Version Detail Endpoint with Compact Support

**Files:**
- Modify: `lib/api/hono-app.ts`

**Interfaces:**
- Consumes: `getVersionDetail` from bible-service, `VersionDetailSchema`, `CompactVersionDetailSchema` from schemas
- Produces: `GET /api/bibles/{version}` returns compact or full format based on `?compact=true`

- [ ] **Step 1: Update `versionDetailRoute` in `lib/api/hono-app.ts`**

Replace the existing `versionDetailRoute` definition and handler (lines 54-87) with:

```typescript
const versionDetailRoute = createRoute({
  method: "get",
  path: "/api/bibles/{version}",
  summary: "Detalhes da versão",
  description: "Retorna metadados de uma versão, incluindo a lista de livros. Use `?compact=true` para formato otimizado para mobile.",
  tags: ["Versões"],
  request: {
    params: z.object({
      version: z.string().openapi({
        param: { name: "version", in: "path" },
        example: "acf",
      }),
    }),
    query: z.object({
      compact: z.enum(["true", "false"]).optional().openapi({
        param: { name: "compact", in: "query" },
        example: "true",
        description: "Retorna formato compacto (sem totalBooks, livros sem chapters). Padrão: false.",
      }),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: VersionDetailSchema } },
      description: "Detalhes da versão",
    },
    404: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Versão não encontrada",
    },
  },
})

app.openapi(versionDetailRoute, h(async (c) => {
  const { version } = c.req.valid("param")
  const { compact } = c.req.valid("query")
  const detail = await getVersionDetail(version)
  if (!detail) {
    return c.json({ error: "Versão não encontrada" }, 404)
  }
  if (compact === "true") {
    return c.json({
      id: detail.id,
      name: detail.name,
      books: detail.books.map((b) => ({
        id: b.id,
        name: b.name,
        abbreviation: b.abbreviation,
        testament: b.testament,
      })),
    })
  }
  return c.json(detail)
}))
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Test both formats**

Run: `pnpm dev`
In another terminal:
```bash
# Full format
curl http://localhost:3000/api/bibles/acf | python3 -m json.tool | head -20
# Compact format
curl http://localhost:3000/api/bibles/acf?compact=true | python3 -m json.tool | head -20
```
Expected: Full format has `totalBooks` and books with `chapters`, compact does not

- [ ] **Step 4: Commit**

```bash
git add lib/api/hono-app.ts
git commit -m "feat(api): add compact support to version detail endpoint"
```

---

## Task 6: Update Chapter Verses Endpoint with Compact Support

**Files:**
- Modify: `lib/api/hono-app.ts`

**Interfaces:**
- Consumes: `getChapterVerses` from bible-service, `ChapterResponseSchema`, `CompactChapterResponseSchema` from schemas
- Produces: `GET /api/bibles/{version}/books/{bookId}/chapters/{chapter}` returns compact or full format based on `?compact=true`

- [ ] **Step 1: Update `chapterRoute` in `lib/api/hono-app.ts`**

Replace the existing `chapterRoute` definition and handler (lines 91-139) with:

```typescript
const chapterRoute = createRoute({
  method: "get",
  path: "/api/bibles/{version}/books/{bookId}/chapters/{chapter}",
  summary: "Versículos de um capítulo",
  description: "Retorna todos os versículos de um capítulo específico. Use `?compact=true` para formato otimizado para mobile.",
  tags: ["Texto Bíblico"],
  request: {
    params: z.object({
      version: z.string().openapi({
        param: { name: "version", in: "path" },
        example: "acf",
      }),
      bookId: z.string().openapi({
        param: { name: "bookId", in: "path" },
        example: "gen",
      }),
      chapter: z.coerce.number().openapi({
        param: { name: "chapter", in: "path" },
        example: 1,
      }),
    }),
    query: z.object({
      compact: z.enum(["true", "false"]).optional().openapi({
        param: { name: "compact", in: "query" },
        example: "true",
        description: "Retorna formato compacto (sem bookName, totalVerses). Padrão: false.",
      }),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: ChapterResponseSchema } },
      description: "Versículos do capítulo",
    },
    404: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Capítulo não encontrado",
    },
  },
})

app.openapi(chapterRoute, h(async (c) => {
  const { version, bookId, chapter } = c.req.valid("param")
  const { compact } = c.req.valid("query")
  const result = await getChapterVerses(version, bookId, chapter)
  if (!result) {
    return c.json({ error: "Capítulo não encontrado" }, 404)
  }
  if (compact === "true") {
    return c.json({
      version,
      bookId,
      chapter,
      verses: result.verses,
    })
  }
  return c.json({
    version,
    bookId,
    bookName: result.bookName,
    chapter,
    totalVerses: result.verses.length,
    verses: result.verses,
  })
}))
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Test both formats**

Run: `pnpm dev`
In another terminal:
```bash
# Full format
curl http://localhost:3000/api/bibles/acf/books/gen/chapters/1 | python3 -m json.tool | head -15
# Compact format
curl http://localhost:3000/api/bibles/acf/books/gen/chapters/1?compact=true | python3 -m json.tool | head -15
```
Expected: Full format has `bookName` and `totalVerses`, compact does not

- [ ] **Step 4: Commit**

```bash
git add lib/api/hono-app.ts
git commit -m "feat(api): add compact support to chapter verses endpoint"
```

---

## Task 7: Update Search Endpoint with Compact Support

**Files:**
- Modify: `lib/api/hono-app.ts`

**Interfaces:**
- Consumes: `searchVerses` from bible-service, `SearchResultSchema`, `CompactSearchResultSchema` from schemas
- Produces: `GET /api/bibles/{version}/search` returns compact or full format based on `?compact=true`

- [ ] **Step 1: Update `searchRoute` in `lib/api/hono-app.ts`**

Replace the existing `searchRoute` definition and handler (lines 143-206) with:

```typescript
const searchRoute = createRoute({
  method: "get",
  path: "/api/bibles/{version}/search",
  summary: "Buscar versículos",
  description:
    "Busca textual em todos os versículos de uma versão. Retorna até 50 resultados. Use `?compact=true` para formato otimizado para mobile.",
  tags: ["Texto Bíblico"],
  request: {
    params: z.object({
      version: z.string().openapi({
        param: { name: "version", in: "path" },
        example: "acf",
      }),
    }),
    query: z.object({
      q: z.string().openapi({
        param: { name: "q", in: "query" },
        example: "amor",
        description: "Termo de busca (case-insensitive)",
      }),
      limit: z.coerce.number().optional().openapi({
        param: { name: "limit", in: "query" },
        example: 20,
        description: "Máximo de resultados (padrão: 50)",
      }),
      compact: z.enum(["true", "false"]).optional().openapi({
        param: { name: "compact", in: "query" },
        example: "true",
        description: "Retorna formato compacto (sem totalResults, limit). Padrão: false.",
      }),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: SearchResultSchema } },
      description: "Resultados da busca",
    },
    400: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Parâmetro de busca ausente",
    },
    404: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Versão não encontrada",
    },
  },
})

app.openapi(searchRoute, h(async (c) => {
  const { version } = c.req.valid("param")
  const { q, limit, compact } = c.req.valid("query")

  if (!q || q.trim().length === 0) {
    return c.json({ error: "Parâmetro 'q' é obrigatório" }, 400)
  }

  const results = await searchVerses(version, q.trim(), limit ?? 50)
  if (results === null) {
    return c.json({ error: "Versão não encontrada" }, 404)
  }

  if (compact === "true") {
    return c.json({
      version,
      query: q.trim(),
      results: results.map((r) => ({
        bookId: r.bookId,
        chapter: r.chapter,
        verse: r.verse,
        text: r.text,
      })),
    })
  }

  return c.json({
    version,
    query: q.trim(),
    totalResults: results.length,
    limit: limit ?? 50,
    results,
  })
}))
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Test both formats**

Run: `pnpm dev`
In another terminal:
```bash
# Full format
curl "http://localhost:3000/api/bibles/acf/search?q=amor&limit=2" | python3 -m json.tool
# Compact format
curl "http://localhost:3000/api/bibles/acf/search?q=amor&limit=2&compact=true" | python3 -m json.tool
```
Expected: Full format has `totalResults`, `limit`, and results with `bookName`/`bookAbbreviation`/`reference`. Compact format only has `version`, `query`, and `results` with basic verse fields.

- [ ] **Step 4: Commit**

```bash
git add lib/api/hono-app.ts
git commit -m "feat(api): add compact support to search endpoint"
```

---

## Task 8: Add Books List Endpoint

**Files:**
- Modify: `lib/api/hono-app.ts`

**Interfaces:**
- Consumes: `listBooksForVersion` from bible-service, `BooksListSchema`, `ErrorResponseSchema` from schemas
- Produces: `GET /api/bibles/{version}/books` new endpoint

- [ ] **Step 1: Add import for `listBooksForVersion`**

Update the import in `lib/api/hono-app.ts` to include `listBooksForVersion`:

```typescript
import {
  listVersions,
  getVersionDetail,
  getChapterVerses,
  searchVerses,
  listBooksForVersion,
} from "./bible-service"
```

- [ ] **Step 2: Add `booksListRoute` to `lib/api/hono-app.ts`**

Add the following after the `searchRoute` handler and before the `// ─── OpenAPI spec` comment:

```typescript
// ─── List books for a version ─────────────────────────────────────

const booksListRoute = createRoute({
  method: "get",
  path: "/api/bibles/{version}/books",
  summary: "Listar livros de uma versão",
  description: "Retorna a lista de livros de uma versão específica da Bíblia.",
  tags: ["Versões"],
  request: {
    params: z.object({
      version: z.string().openapi({
        param: { name: "version", in: "path" },
        example: "acf",
      }),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: BooksListSchema } },
      description: "Lista de livros da versão",
    },
    404: {
      content: { "application/json": { schema: ErrorResponseSchema } },
      description: "Versão não encontrada",
    },
  },
})

app.openapi(booksListRoute, h(async (c) => {
  const { version } = c.req.valid("param")
  const result = await listBooksForVersion(version)
  if (!result) {
    return c.json({ error: "Versão não encontrada" }, 404)
  }
  return c.json(result)
}))
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Test the endpoint**

Run: `pnpm dev`
In another terminal:
```bash
curl http://localhost:3000/api/bibles/acf/books | python3 -m json.tool | head -20
```
Expected: JSON with `version` and `books` array containing all 66 books with `chapters` count

- [ ] **Step 5: Commit**

```bash
git add lib/api/hono-app.ts
git commit -m "feat(api): add books list endpoint for a version"
```

---

## Task 9: Update Scalar Documentation

**Files:**
- Modify: `lib/api/hono-app.ts`

**Interfaces:**
- Consumes: existing OpenAPI spec generation
- Produces: Updated Scalar docs with new tags, descriptions, and mobile documentation

- [ ] **Step 1: Update OpenAPI spec info and add tags in `lib/api/hono-app.ts`**

Replace the existing `app.doc()` call (lines 210-219) with:

```typescript
app.doc("/api/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "Open Bible API",
    version: "1.1.0",
    description:
      "API para leitura de textos bíblicos em português. Suporta múltiplas versões, busca textual e consulta por livro/capítulo.\n\n## Mobile (iOS)\n\nUse `?compact=true` em qualquer endpoint para obter respostas otimizadas para mobile com menos dados.\n\n## CORS\n\nA API suporta CORS para apps nativos iOS/Android.",
  },
  servers: [{ url: "/", description: "Servidor local" }],
  tags: [
    { name: "Versões", description: "Consulta de versões e livros disponíveis" },
    { name: "Texto Bíblico", description: "Consulta de versículos e busca textual" },
  ],
})
```

- [ ] **Step 2: Update Scalar docs config**

Replace the existing `app.get("/api/docs", ...)` call (lines 223-230) with:

```typescript
app.get(
  "/api/docs",
  apiReference({
    pageTitle: "Open Bible API — Documentação",
    spec: { url: "/api/openapi.json" },
    theme: "purple",
    layout: "modern",
    hideModels: false,
  })
)
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Test Scalar docs**

Run: `pnpm dev`
Open browser to `http://localhost:3000/api/docs`
Expected: Scalar UI loads with all endpoints documented, including new tags and compact parameter descriptions

- [ ] **Step 5: Test OpenAPI spec**

Run: `pnpm dev`
In another terminal:
```bash
curl http://localhost:3000/api/openapi.json | python3 -m json.tool | grep -A2 "compact"
```
Expected: All endpoints show `compact` query parameter in their OpenAPI spec

- [ ] **Step 6: Commit**

```bash
git add lib/api/hono-app.ts
git commit -m "docs(api): update Scalar documentation with mobile support and new endpoints"
```

---

## Task 10: Update API Client for Compact Support

**Files:**
- Modify: `lib/api-client.ts`

**Interfaces:**
- Consumes: existing API endpoints with `?compact=true` support
- Produces: Client functions that can optionally use compact format

- [ ] **Step 1: Add compact types and update functions in `lib/api-client.ts`**

Replace the entire file content with:

```typescript
const API_BASE = "/api"

interface APIVersion {
  id: string
  name: string
  totalBooks: number
}

interface APICompactVersion {
  id: string
  name: string
}

interface APIVersionDetail extends APIVersion {
  books: {
    id: string
    name: string
    abbreviation: string
    testament: "old" | "new"
    chapters: number
  }[]
}

interface APICompactVersionDetail {
  id: string
  name: string
  books: {
    id: string
    name: string
    abbreviation: string
    testament: "old" | "new"
  }[]
}

interface APIVerse {
  bookId: string
  chapter: number
  verse: number
  text: string
}

interface APIChapterResponse {
  version: string
  bookId: string
  bookName: string
  chapter: number
  totalVerses: number
  verses: APIVerse[]
}

interface APICompactChapterResponse {
  version: string
  bookId: string
  chapter: number
  verses: APIVerse[]
}

interface APISearchResult {
  version: string
  query: string
  totalResults: number
  limit: number
  results: (APIVerse & {
    bookName: string
    bookAbbreviation: string
    reference: string
  })[]
}

interface APICompactSearchResult {
  version: string
  query: string
  results: APIVerse[]
}

interface APIBooksList {
  version: string
  books: {
    id: string
    name: string
    abbreviation: string
    testament: "old" | "new"
    chapters: number
  }[]
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.error || `Erro ${res.status}`)
  }
  return res.json()
}

export async function fetchVersions(compact = false): Promise<APIVersion[] | APICompactVersion[]> {
  const params = compact ? "?compact=true" : ""
  return fetchJSON<APIVersion[] | APICompactVersion[]>(`/bibles${params}`)
}

export async function fetchVersionDetail(
  versionId: string,
  compact = false
): Promise<APIVersionDetail | APICompactVersionDetail> {
  const params = compact ? "?compact=true" : ""
  return fetchJSON<APIVersionDetail | APICompactVersionDetail>(
    `/bibles/${encodeURIComponent(versionId)}${params}`
  )
}

export async function fetchChapterVerses(
  versionId: string,
  bookId: string,
  chapter: number,
  compact = false
): Promise<APIChapterResponse | APICompactChapterResponse> {
  const params = compact ? "?compact=true" : ""
  return fetchJSON<APIChapterResponse | APICompactChapterResponse>(
    `/bibles/${encodeURIComponent(versionId)}/books/${encodeURIComponent(bookId)}/chapters/${chapter}${params}`
  )
}

export async function searchVerses(
  versionId: string,
  query: string,
  limit = 50,
  compact = false
): Promise<APISearchResult | APICompactSearchResult> {
  const searchParams = new URLSearchParams({ q: query, limit: String(limit) })
  if (compact) searchParams.set("compact", "true")
  return fetchJSON<APISearchResult | APICompactSearchResult>(
    `/bibles/${encodeURIComponent(versionId)}/search?${searchParams}`
  )
}

export async function fetchBooks(versionId: string): Promise<APIBooksList> {
  return fetchJSON<APIBooksList>(
    `/bibles/${encodeURIComponent(versionId)}/books`
  )
}

export { ApiError }
export type {
  APIVersion,
  APICompactVersion,
  APIVersionDetail,
  APICompactVersionDetail,
  APIVerse,
  APIChapterResponse,
  APICompactChapterResponse,
  APISearchResult,
  APICompactSearchResult,
  APIBooksList,
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add lib/api-client.ts
git commit -m "feat(api-client): add compact format support and books endpoint"
```

---

## Task 11: Final Verification

- [ ] **Step 1: Build the project**

Run: `pnpm build`
Expected: Build succeeds without errors

- [ ] **Step 2: Run dev server and test all endpoints**

Run: `pnpm dev`
In another terminal, test all endpoints:

```bash
# List versions (full)
curl http://localhost:3000/api/bibles | python3 -m json.tool | head -10

# List versions (compact)
curl http://localhost:3000/api/bibles?compact=true | python3 -m json.tool | head -10

# Version detail (full)
curl http://localhost:3000/api/bibles/acf | python3 -m json.tool | head -15

# Version detail (compact)
curl http://localhost:3000/api/bibles/acf?compact=true | python3 -m json.tool | head -15

# Books list
curl http://localhost:3000/api/bibles/acf/books | python3 -m json.tool | head -15

# Chapter verses (full)
curl http://localhost:3000/api/bibles/acf/books/gen/chapters/1 | python3 -m json.tool | head -15

# Chapter verses (compact)
curl http://localhost:3000/api/bibles/acf/books/gen/chapters/1?compact=true | python3 -m json.tool | head -15

# Search (full)
curl "http://localhost:3000/api/bibles/acf/search?q=amor&limit=2" | python3 -m json.tool

# Search (compact)
curl "http://localhost:3000/api/bibles/acf/search?q=amor&limit=2&compact=true" | python3 -m json.tool

# CORS preflight
curl -I -X OPTIONS http://localhost:3000/api/bibles

# Scalar docs
curl http://localhost:3000/api/docs | head -5

# OpenAPI spec
curl http://localhost:3000/api/openapi.json | python3 -m json.tool | grep "compact"
```

- [ ] **Step 3: Verify no breaking changes**

The existing app web functionality should work unchanged. Verify:
1. Open `http://localhost:3000` in browser
2. Select a book and chapter
3. Verses load correctly (using full format by default)

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix(api): final adjustments for iOS API support"
```
