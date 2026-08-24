import type { BibleCatalog, BibleSearch, BibleVersion, BibleReader, Verse } from "@open-bible/contracts"

export class WebBibleReader implements BibleReader {
  constructor(private readonly getVerses: (versionId: string, bookId: string, chapter: number) => Promise<Verse[]>) {}

  getChapter(versionId: string, bookId: string, chapter: number) {
    return this.getVerses(versionId, bookId, chapter)
  }
}

export class WebBibleCatalog implements BibleCatalog {
  constructor(private readonly getVersions: () => Promise<BibleVersion[]>) {}

  listVersions() {
    return this.getVersions()
  }
}

export class WebBibleSearch implements BibleSearch {
  constructor(private readonly findVerses: (versionId: string, query: string) => Promise<Verse[]>) {}

  search(versionId: string, query: string) {
    return this.findVerses(versionId, query)
  }
}
