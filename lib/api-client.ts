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
