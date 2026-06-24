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

export type Version = z.infer<typeof VersionSchema>
export type Book = z.infer<typeof BookSchema>
export type VersionDetail = z.infer<typeof VersionDetailSchema>
export type Verse = z.infer<typeof VerseSchema>
export type ChapterResponse = z.infer<typeof ChapterResponseSchema>
export type SearchResult = z.infer<typeof SearchResultSchema>
