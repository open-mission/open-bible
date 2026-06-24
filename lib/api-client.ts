const API_BASE = "/api"

interface APIVersion {
  id: string
  name: string
  totalBooks: number
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

export async function fetchVersions(): Promise<APIVersion[]> {
  return fetchJSON<APIVersion[]>("/bibles")
}

export async function fetchVersionDetail(
  versionId: string
): Promise<APIVersionDetail> {
  return fetchJSON<APIVersionDetail>(`/bibles/${encodeURIComponent(versionId)}`)
}

export async function fetchChapterVerses(
  versionId: string,
  bookId: string,
  chapter: number
): Promise<APIChapterResponse> {
  return fetchJSON<APIChapterResponse>(
    `/bibles/${encodeURIComponent(versionId)}/books/${encodeURIComponent(bookId)}/chapters/${chapter}`
  )
}

export async function searchVerses(
  versionId: string,
  query: string,
  limit = 50
): Promise<APISearchResult> {
  const params = new URLSearchParams({ q: query, limit: String(limit) })
  return fetchJSON<APISearchResult>(
    `/bibles/${encodeURIComponent(versionId)}/search?${params}`
  )
}

export { ApiError }
