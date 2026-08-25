import * as fs from "node:fs"
import * as path from "node:path"
import { getDataDir } from "../db/paths.js"

export interface HistoryEntry {
  bookId: string
  chapter: number
  verse?: number
  timestamp: number
}

export interface NavStateData {
  lastBook: string
  lastChapter: number
  lastVerse?: number
  history: HistoryEntry[]
}

const DEFAULT: NavStateData = {
  lastBook: "gen",
  lastChapter: 1,
  lastVerse: undefined,
  history: [],
}

function statePath(): string {
  return path.join(getDataDir(), "state.json")
}

export class NavigationState {
  lastBook: string
  lastChapter: number
  lastVerse?: number
  history: HistoryEntry[]

  constructor() {
    this.lastBook = DEFAULT.lastBook
    this.lastChapter = DEFAULT.lastChapter
    this.lastVerse = DEFAULT.lastVerse
    this.history = []
    this.load()
  }

  load(): void {
    const p = statePath()
    try {
      if (!fs.existsSync(p)) {
        this.lastBook = DEFAULT.lastBook
        this.lastChapter = DEFAULT.lastChapter
        this.history = []
        return
      }
      const raw = fs.readFileSync(p, "utf-8")
      const data = JSON.parse(raw) as Partial<NavStateData>
      this.lastBook = data.lastBook ?? DEFAULT.lastBook
      this.lastChapter = data.lastChapter ?? DEFAULT.lastChapter
      this.lastVerse = data.lastVerse
      this.history = Array.isArray(data.history) ? data.history.slice(0, 10) : []
    } catch {
      this.lastBook = DEFAULT.lastBook
      this.lastChapter = DEFAULT.lastChapter
      this.lastVerse = undefined
      this.history = []
    }
  }

  save(): void {
    const p = statePath()
    try {
      const dir = path.dirname(p)
      fs.mkdirSync(dir, { recursive: true })
      const data: NavStateData = {
        lastBook: this.lastBook,
        lastChapter: this.lastChapter,
        lastVerse: this.lastVerse,
        history: this.history,
      }
      fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf-8")
    } catch {
      // ignore write errors
    }
  }

  addHistory(entry: { bookId: string; chapter: number; verse?: number }): void {
    const now = Date.now()
    const newEntry: HistoryEntry = { bookId: entry.bookId, chapter: entry.chapter, verse: entry.verse, timestamp: now }
    // dedup: if same as most recent entry, update timestamp and move to top (already top)
    if (this.history.length > 0) {
      const top = this.history[0]
      if (top.bookId === newEntry.bookId && top.chapter === newEntry.chapter && top.verse === newEntry.verse) {
        top.timestamp = now
        this.lastBook = newEntry.bookId
        this.lastChapter = newEntry.chapter
        this.lastVerse = newEntry.verse
        this.save()
        return
      }
    }
    // remove existing duplicate elsewhere
    this.history = this.history.filter(h => !(h.bookId === newEntry.bookId && h.chapter === newEntry.chapter && h.verse === newEntry.verse))
    this.history.unshift(newEntry)
    if (this.history.length > 10) this.history = this.history.slice(0, 10)
    this.lastBook = newEntry.bookId
    this.lastChapter = newEntry.chapter
    this.lastVerse = newEntry.verse
    this.save()
  }
}
