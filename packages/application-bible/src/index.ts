import type { BibleCatalog, BibleReader, BibleSearch } from "@open-bible/contracts"
export async function getChapter(reader: BibleReader, versionId: string, bookId: string, chapter: number) { return reader.getChapter(versionId, bookId, chapter) }
export async function listVersions(catalog: BibleCatalog) { return catalog.listVersions() }
export async function searchVerses(search: BibleSearch, versionId: string, query: string) { return search.search(versionId, query) }
