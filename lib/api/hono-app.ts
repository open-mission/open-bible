import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { gzipSync } from "zlib";
import { turso } from "../turso";
import {
  VersionSchema,
  VersionDetailSchema,
  ChapterResponseSchema,
  ErrorResponseSchema,
  SearchResultSchema,
  BooksListSchema,
} from "./schemas";
import {
  listVersions,
  getVersionDetail,
  getChapterVerses,
  searchVerses,
  listBooksForVersion,
} from "./bible-service";

export const app = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json(
        { error: "Parâmetro inválido. Verifique a documentação em /api/docs." },
        400,
      );
    }
  },
});

// ─── CORS middleware ──────────────────────────────────────────────

app.use("*", async (c, next) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type");
  // Expose custom headers so cross-origin clients (Tauri desktop, iOS app) can read
  // the uncompressed size and content-encoding of the gzipped Bible download proxy.
  c.header(
    "Access-Control-Expose-Headers",
    "X-Original-Content-Length, Content-Encoding",
  );
  if (c.req.method === "OPTIONS") {
    return c.body(null, 204);
  }
  return next();
});

// ─── Type helper for handlers with multiple response statuses ────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function h(fn: (...args: any[]) => any) {
  return fn;
}

// ─── List versions ────────────────────────────────────────────────

const listVersionsRoute = createRoute({
  method: "get",
  path: "/api/bibles",
  summary: "Listar versões da Bíblia",
  description:
    "Retorna todas as versões bíblicas disponíveis. Use `?compact=true` para formato otimizado para mobile.",
  tags: ["Versões"],
  request: {
    query: z.object({
      compact: z
        .enum(["true", "false"])
        .optional()
        .openapi({
          param: { name: "compact", in: "query" },
          example: "true",
          description:
            "Retorna formato compacto (sem totalBooks). Padrão: false.",
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
});

app.openapi(
  listVersionsRoute,
  h(async (c) => {
    const { compact } = c.req.valid("query");
    const versions = await listVersions();
    if (compact === "true") {
      return c.json(versions.map((v) => ({ id: v.id, name: v.name })));
    }
    return c.json(versions);
  }),
);

// ─── Version detail ───────────────────────────────────────────────

const versionDetailRoute = createRoute({
  method: "get",
  path: "/api/bibles/{version}",
  summary: "Detalhes da versão",
  description:
    "Retorna metadados de uma versão, incluindo a lista de livros. Use `?compact=true` para formato otimizado para mobile.",
  tags: ["Versões"],
  request: {
    params: z.object({
      version: z.string().openapi({
        param: { name: "version", in: "path" },
        example: "acf",
      }),
    }),
    query: z.object({
      compact: z
        .enum(["true", "false"])
        .optional()
        .openapi({
          param: { name: "compact", in: "query" },
          example: "true",
          description:
            "Retorna formato compacto (sem totalBooks, livros sem chapters). Padrão: false.",
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
});

app.openapi(
  versionDetailRoute,
  h(async (c) => {
    const { version } = c.req.valid("param");
    const { compact } = c.req.valid("query");
    const detail = await getVersionDetail(version);
    if (!detail) {
      return c.json({ error: "Versão não encontrada" }, 404);
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
        ...(detail.warning ? { warning: detail.warning } : {}),
      });
    }
    return c.json(detail);
  }),
);

// ─── Chapter verses ───────────────────────────────────────────────

const chapterRoute = createRoute({
  method: "get",
  path: "/api/bibles/{version}/books/{bookId}/chapters/{chapter}",
  summary: "Versículos de um capítulo",
  description:
    "Retorna todos os versículos de um capítulo específico. Use `?compact=true` para formato otimizado para mobile.",
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
      compact: z
        .enum(["true", "false"])
        .optional()
        .openapi({
          param: { name: "compact", in: "query" },
          example: "true",
          description:
            "Retorna formato compacto (sem bookName, totalVerses). Padrão: false.",
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
});

app.openapi(
  chapterRoute,
  h(async (c) => {
    const { version, bookId, chapter } = c.req.valid("param");
    const { compact } = c.req.valid("query");
    const result = await getChapterVerses(version, bookId, chapter);
    if (!result) {
      return c.json({ error: "Capítulo não encontrado" }, 404);
    }
    if (compact === "true") {
      return c.json({
        version,
        bookId,
        chapter,
        verses: result.verses,
      });
    }
    return c.json({
      version,
      bookId,
      bookName: result.bookName,
      chapter,
      totalVerses: result.verses.length,
      verses: result.verses,
    });
  }),
);

// ─── Search ───────────────────────────────────────────────────────

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
      limit: z.coerce
        .number()
        .optional()
        .openapi({
          param: { name: "limit", in: "query" },
          example: 20,
          description: "Máximo de resultados (padrão: 50)",
        }),
      compact: z
        .enum(["true", "false"])
        .optional()
        .openapi({
          param: { name: "compact", in: "query" },
          example: "true",
          description:
            "Retorna formato compacto (sem totalResults, limit). Padrão: false.",
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
});

app.openapi(
  searchRoute,
  h(async (c) => {
    const { version } = c.req.valid("param");
    const { q, limit, compact } = c.req.valid("query");

    if (!q || q.trim().length === 0) {
      return c.json({ error: "Parâmetro 'q' é obrigatório" }, 400);
    }

    const results = await searchVerses(version, q.trim(), limit ?? 50);
    if (results === null) {
      return c.json({ error: "Versão não encontrada" }, 404);
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
      });
    }

    return c.json({
      version,
      query: q.trim(),
      totalResults: results.length,
      limit: limit ?? 50,
      results,
    });
  }),
);

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
});

app.openapi(
  booksListRoute,
  h(async (c) => {
    const { version } = c.req.valid("param");
    const result = await listBooksForVersion(version);
    if (!result) {
      return c.json({ error: "Versão não encontrada" }, 404);
    }
    return c.json(result);
  }),
);

app.get("/api/bibles/download/:version", async (c) => {
  const version = c.req.param("version").toLowerCase();
  const mapping: Record<string, string> = {
    acf: "ACF.sqlite",
    ara: "ARA.sqlite",
    arc: "ARC.sqlite",
    as21: "AS21.sqlite",
    jfaa: "JFAA.sqlite",
    kja: "KJA.sqlite",
    kjf: "KJF.sqlite",
    mens: "MENS.sqlite",
    naa: "NAA.sqlite",
    nbv: "NBV.sqlite",
    ntlh: "NTLH.sqlite",
    nvi: "NVI.sqlite",
    nvt: "NVT.sqlite",
    ol: "OL.sqlite",
    tb: "TB.sqlite",
    vfl: "VFL.sqlite",
  };

  try {
    // Query TursoDB for the download URL of this version
    const result = await turso.execute(
      "SELECT download_url FROM bible_versions WHERE id = ?",
      [version],
    );

    let targetUrl = "";
    const row = result.rows[0];
    if (row && row.download_url) {
      targetUrl = row.download_url as string;
    } else {
      const filename = mapping[version];
      if (!filename) {
        return c.text("Versão não encontrada", 404);
      }
      const bucketUrl =
        process.env.CLOUDFLARE_BUCKET_PUBLIC_URL ||
        "https://pub-2e657f1c9c644712ad9474513a7ad79b.r2.dev";
      targetUrl = `${bucketUrl}/${filename}`;
    }

    const filename = targetUrl.split("/").pop() || `${version}.sqlite`;

    const upstream = await fetch(targetUrl);
    if (!upstream.ok) {
      return c.text(
        `Erro ao obter arquivo da origem: ${upstream.statusText}`,
        upstream.status as 200,
      );
    }

    const arrayBuffer = await upstream.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const compressed = gzipSync(buffer);

    c.header("Content-Type", "application/octet-stream");
    c.header("Content-Disposition", `attachment; filename="${filename}"`);
    c.header("Content-Encoding", "gzip");
    c.header("X-Original-Content-Length", String(arrayBuffer.byteLength));
    c.header("Content-Length", String(compressed.length));
    c.header("Cache-Control", "no-store");

    return c.body(compressed as Uint8Array);
  } catch (e) {
    console.error(`Falha no proxy de download para ${version}:`, e);
    return c.text("Erro interno no servidor de proxy de download", 500);
  }
});

// ─── Debug: Bible data diagnostic ─────────────────────────────────

app.get("/api/debug/bibles-data", async (c) => {
  try {
    const versions = await turso.execute(
      "SELECT id, name, total_books, download_url FROM bible_versions ORDER BY id"
    );
    const booksPerVersion = await turso.execute(
      "SELECT version_id, COUNT(*) as count FROM bible_books GROUP BY version_id ORDER BY version_id"
    );
    const totalBooks = await turso.execute(
      "SELECT COUNT(*) as count FROM bible_books"
    );
    const totalVerses = await turso.execute(
      "SELECT COUNT(*) as count FROM bible_verses"
    );
    const sampleDownloadUrls = await turso.execute(
      "SELECT id, download_url FROM bible_versions WHERE download_url IS NOT NULL LIMIT 3"
    );
    
    return c.json({
      versions: versions.rows.map((v) => ({
        id: v[0],
        name: v[1],
        totalBooks: v[2],
        hasDownloadUrl: !!v[3],
        downloadUrl: v[3] ? String(v[3]).substring(0, 80) + "..." : null,
      })),
      booksPerVersion: booksPerVersion.rows,
      totalBooksInBibleBooks: totalBooks.rows[0]?.[0] ?? 0,
      totalVersesInBibleVerses: totalVerses.rows[0]?.[0] ?? 0,
      sampleDownloadUrls: sampleDownloadUrls.rows.map((r) => ({
        id: r[0],
        url: r[1] ? String(r[1]).substring(0, 100) + "..." : null,
      })),
    });
  } catch (e) {
    console.error("Erro no diagnóstico de dados bíblicos:", e);
    return c.text("Erro ao consultar dados bíblicos", 500);
  }
});

// ─── OpenAPI spec ─────────────────────────────────────────────────

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
    {
      name: "Versões",
      description: "Consulta de versões e livros disponíveis",
    },
    {
      name: "Texto Bíblico",
      description: "Consulta de versículos e busca textual",
    },
  ],
});

// ─── Scalar docs ──────────────────────────────────────────────────

app.get(
  "/api/docs",
  apiReference({
    pageTitle: "Open Bible API — Documentação",
    spec: { url: "/api/openapi.json" },
    theme: "purple",
    layout: "modern",
    hideModels: false,
  }),
);
