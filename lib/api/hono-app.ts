import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi"
import { apiReference } from "@scalar/hono-api-reference"
import {
  VersionSchema,
  VersionDetailSchema,
  ChapterResponseSchema,
  ErrorResponseSchema,
  SearchResultSchema,
} from "./schemas"
import {
  listVersions,
  getVersionDetail,
  getChapterVerses,
  searchVerses,
} from "./bible-service"

export const app = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json({ error: "Parâmetro inválido. Verifique a documentação em /api/docs." }, 400)
    }
  },
})

// ─── CORS middleware ──────────────────────────────────────────────

app.use("*", async (c, next) => {
  c.header("Access-Control-Allow-Origin", "*")
  c.header("Access-Control-Allow-Methods", "GET, OPTIONS")
  c.header("Access-Control-Allow-Headers", "Content-Type")
  if (c.req.method === "OPTIONS") {
    return c.body(null, 204)
  }
  return next()
})

// ─── Type helper for handlers with multiple response statuses ────

function h(fn: (...args: any[]) => any) {
  return fn
}

// ─── List versions ────────────────────────────────────────────────

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

app.openapi(listVersionsRoute, h(async (c) => {
  const { compact } = c.req.valid("query")
  const versions = await listVersions()
  if (compact === "true") {
    return c.json(versions.map((v) => ({ id: v.id, name: v.name })))
  }
  return c.json(versions)
}))

// ─── Version detail ───────────────────────────────────────────────

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

// ─── Chapter verses ───────────────────────────────────────────────

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

// ─── Search ───────────────────────────────────────────────────────

const searchRoute = createRoute({
  method: "get",
  path: "/api/bibles/{version}/search",
  summary: "Buscar versículos",
  description:
    "Busca textual em todos os versículos de uma versão. Retorna até 50 resultados.",
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
  const { q, limit } = c.req.valid("query")

  if (!q || q.trim().length === 0) {
    return c.json({ error: "Parâmetro 'q' é obrigatório" }, 400)
  }

  const results = await searchVerses(version, q.trim(), limit ?? 50)
  if (results === null) {
    return c.json({ error: "Versão não encontrada" }, 404)
  }

  return c.json({
    version,
    query: q.trim(),
    totalResults: results.length,
    limit: limit ?? 50,
    results,
  })
}))

// ─── OpenAPI spec ─────────────────────────────────────────────────

app.doc("/api/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "Open Bible API",
    version: "1.0.0",
    description:
      "API para leitura de textos bíblicos em português. Suporta múltiplas versões, busca textual e consulta por livro/capítulo.",
  },
  servers: [{ url: "/", description: "Servidor local" }],
})

// ─── Scalar docs ──────────────────────────────────────────────────

app.get(
  "/api/docs",
  apiReference({
    pageTitle: "Open Bible API",
    spec: { url: "/api/openapi.json" },
    theme: "purple",
  })
)
