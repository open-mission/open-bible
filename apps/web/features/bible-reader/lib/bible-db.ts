const DB_NAME = "openbible-bibles"
const DB_VERSION = 1

interface VerseRecord {
  bookId: string
  chapter: number
  verse: number
  text: string
}

export interface VersionMeta {
  id: string
  name: string
  downloadedAt: string
  books: {
    id: string
    name: string
    abbreviation: string
    testament: "old" | "new"
    chapters: number
    chapterVerseCounts: number[]
  }[]
}

export interface AvailableVersion {
  id: string
  name: string
  totalBooks: number
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains("versions")) {
        db.createObjectStore("versions", { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains("verses")) {
        const store = db.createObjectStore("verses", { keyPath: "id" })
        store.createIndex("versionId", "versionId", { unique: false })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function getInstalledVersions(): Promise<VersionMeta[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("versions", "readonly")
    const req = tx.objectStore("versions").getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function isVersionInstalled(versionId: string): Promise<boolean> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("versions", "readonly")
    const req = tx.objectStore("versions").get(versionId)
    req.onsuccess = () => resolve(!!req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function getVersionMeta(versionId: string): Promise<VersionMeta | undefined> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("versions", "readonly")
    const req = tx.objectStore("versions").get(versionId)
    req.onsuccess = () => resolve(req.result ?? undefined)
    req.onerror = () => reject(req.error)
  })
}

export async function fetchAvailableVersions(): Promise<AvailableVersion[]> {
  const res = await fetch("/api/bibles")
  if (!res.ok) throw new Error("Failed to fetch version index")
  return res.json()
}

export async function downloadAndInstallVersion(
  versionId: string,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const res = await fetch(`/data/bibles/${versionId}/meta.json`)
  if (!res.ok) throw new Error(`Version ${versionId} not found`)
  const meta: VersionMeta = await res.json()
  meta.downloadedAt = new Date().toISOString()

  const db = await openDB()
  const total = meta.books.length

  for (let i = 0; i < total; i++) {
    const book = meta.books[i]
    const bookChapters: { id: string; versionId: string; bookId: string; chapter: number; verses: VerseRecord[] }[] = []

    for (let ch = 1; ch <= book.chapters; ch++) {
      const chRes = await fetch(`/data/bibles/${versionId}/${book.id}-${ch}.json`)
      if (chRes.ok) {
        const verses: VerseRecord[] = await chRes.json()
        bookChapters.push({
          id: `${versionId}-${book.id}-${ch}`,
          versionId,
          bookId: book.id,
          chapter: ch,
          verses,
        })
      }
    }

    // Batch-write all chapters for this book in one transaction
    const tx = db.transaction("verses", "readwrite")
    const store = tx.objectStore("verses")
    for (const chapter of bookChapters) {
      store.put(chapter)
    }
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })

    onProgress?.(i + 1, total)
  }

  // Save version metadata
  const tx = db.transaction("versions", "readwrite")
  tx.objectStore("versions").put(meta)
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getChapterVerses(
  versionId: string,
  bookId: string,
  chapter: number
): Promise<VerseRecord[] | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("verses", "readonly")
    const req = tx.objectStore("verses").get(`${versionId}-${bookId}-${chapter}`)
    req.onsuccess = () => {
      const record = req.result
      resolve(record ? record.verses : null)
    }
    req.onerror = () => reject(req.error)
  })
}

export async function removeVersion(versionId: string): Promise<void> {
  const db = await openDB()

  // Remove all verse records for this version
  const tx1 = db.transaction("verses", "readwrite")
  const index = tx1.objectStore("verses").index("versionId")
  const range = IDBKeyRange.only(versionId)
  const req = index.openCursor(range)
  req.onsuccess = () => {
    const cursor = req.result
    if (cursor) {
      cursor.delete()
      cursor.continue()
    }
  }
  await new Promise<void>((resolve, reject) => {
    tx1.oncomplete = () => resolve()
    tx1.onerror = () => reject(tx1.error)
  })

  // Remove version metadata
  const tx2 = db.transaction("versions", "readwrite")
  tx2.objectStore("versions").delete(versionId)
  await new Promise<void>((resolve, reject) => {
    tx2.oncomplete = () => resolve()
    tx2.onerror = () => reject(tx2.error)
  })
}
