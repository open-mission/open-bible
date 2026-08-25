export interface Verse { id: string; bookId: string; chapter: number; verse: number; text: string }
export interface BibleReader { getChapter(versionId: string, bookId: string, chapter: number): Promise<Verse[]> }

export interface BibleVersion { id: string; name: string; totalBooks?: number }
export interface BibleCatalog { listVersions(): Promise<BibleVersion[]> }
export interface BibleSearch { search(versionId: string, query: string): Promise<Verse[]> }
