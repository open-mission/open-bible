import { z } from "@hono/zod-openapi"

export const VersionSchema = z.object({
  id: z.string().openapi({ example: "acf" }),
  name: z.string().openapi({ example: "Almeida Corrigida e Fiel" }),
  totalBooks: z.number().openapi({ example: 66 }),
})

export const BookSchema = z.object({
  id: z.string().openapi({ example: "gen" }),
  name: z.string().openapi({ example: "Gênesis" }),
  abbreviation: z.string().openapi({ example: "Gn" }),
  testament: z.enum(["old", "new"]).openapi({ example: "old" }),
  chapters: z.number().openapi({ example: 50 }),
})

export const VersionDetailSchema = VersionSchema.extend({
  books: z.array(BookSchema),
  warning: z.string().optional(),
})

export const VerseSchema = z.object({
  bookId: z.string().openapi({ example: "gen" }),
  chapter: z.number().openapi({ example: 1 }),
  verse: z.number().openapi({ example: 1 }),
  text: z.string().openapi({ example: "No princípio criou Deus os céus e a terra." }),
})

export const ChapterResponseSchema = z.object({
  version: z.string().openapi({ example: "acf" }),
  bookId: z.string().openapi({ example: "gen" }),
  bookName: z.string().openapi({ example: "Gênesis" }),
  chapter: z.number().openapi({ example: 1 }),
  totalVerses: z.number().openapi({ example: 31 }),
  verses: z.array(VerseSchema),
})

export const ErrorResponseSchema = z.object({
  error: z.string(),
})

export const SearchResultSchema = z.object({
  version: z.string(),
  query: z.string(),
  totalResults: z.number(),
  limit: z.number(),
  results: z.array(
    VerseSchema.extend({
      bookName: z.string(),
      bookAbbreviation: z.string(),
      reference: z.string(),
    })
  ),
})

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

export type Version = z.infer<typeof VersionSchema>
export type Book = z.infer<typeof BookSchema>
export type VersionDetail = z.infer<typeof VersionDetailSchema>
export type Verse = z.infer<typeof VerseSchema>
export type ChapterResponse = z.infer<typeof ChapterResponseSchema>
export type SearchResult = z.infer<typeof SearchResultSchema>
