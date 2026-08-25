import { BibleManager } from "../db/bible-manager.js"
import { InstalledStore } from "../db/installed-store.js"
import { downloadBible, listRemoteVersions, removeBible } from "./download.js"

export class BibleService {
  manager = new BibleManager()
  store = new InstalledStore()

  listInstalled() {
    return this.store.list()
  }

  getBooks(versionId: string) {
    return this.manager.getBooks(versionId)
  }

  getChapter(versionId: string, bookId: string, chapter: number) {
    return this.manager.getChapterVerses(versionId, bookId, chapter)
  }

  search(versionId: string, query: string, limit?: number) {
    return this.manager.search(versionId, query, limit)
  }

  async download(versionId: string, opts?: Parameters<typeof downloadBible>[1]) {
    return downloadBible(versionId, opts)
  }

  async listRemote(opts?: Parameters<typeof listRemoteVersions>[0]) {
    return listRemoteVersions(opts)
  }

  async remove(versionId: string) {
    // close manager cache for that version so file can be removed on Windows
    this.manager.close()
    return removeBible(versionId)
  }

  close() {
    this.manager.close()
    this.store.close()
  }
}
