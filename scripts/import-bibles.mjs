#!/usr/bin/env node

import { readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import Database from "better-sqlite3"

const log = (msg) => process.stdout.write(msg + "\n")
const err = (msg) => process.stderr.write(msg + "\n")

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const BIBLES_DIR = join(ROOT, "resources", "bibles")

const BOOK_META = [
  null,
  { id: "gen", name: "Gênesis", abbreviation: "Gn" },
  { id: "exo", name: "Êxodo", abbreviation: "Ex" },
  { id: "lev", name: "Levítico", abbreviation: "Lv" },
  { id: "num", name: "Números", abbreviation: "Nm" },
  { id: "deu", name: "Deuteronômio", abbreviation: "Dt" },
  { id: "jos", name: "Josué", abbreviation: "Js" },
  { id: "jdg", name: "Juízes", abbreviation: "Jz" },
  { id: "rut", name: "Rute", abbreviation: "Rt" },
  { id: "1sa", name: "1 Samuel", abbreviation: "1Sm" },
  { id: "2sa", name: "2 Samuel", abbreviation: "2Sm" },
  { id: "1ki", name: "1 Reis", abbreviation: "1Rs" },
  { id: "2ki", name: "2 Reis", abbreviation: "2Rs" },
  { id: "1ch", name: "1 Crônicas", abbreviation: "1Cr" },
  { id: "2ch", name: "2 Crônicas", abbreviation: "2Cr" },
  { id: "ezr", name: "Esdras", abbreviation: "Ed" },
  { id: "neh", name: "Neemias", abbreviation: "Ne" },
  { id: "est", name: "Ester", abbreviation: "Et" },
  { id: "job", name: "Jó", abbreviation: "Jó" },
  { id: "psa", name: "Salmos", abbreviation: "Sl" },
  { id: "pro", name: "Provérbios", abbreviation: "Pv" },
  { id: "ecc", name: "Eclesiastes", abbreviation: "Ec" },
  { id: "sng", name: "Cânticos", abbreviation: "Ct" },
  { id: "isa", name: "Isaías", abbreviation: "Is" },
  { id: "jer", name: "Jeremias", abbreviation: "Jr" },
  { id: "lam", name: "Lamentações", abbreviation: "Lm" },
  { id: "ezk", name: "Ezequiel", abbreviation: "Ez" },
  { id: "dan", name: "Daniel", abbreviation: "Dn" },
  { id: "hos", name: "Oseias", abbreviation: "Os" },
  { id: "jol", name: "Joel", abbreviation: "Jl" },
  { id: "amo", name: "Amós", abbreviation: "Am" },
  { id: "oba", name: "Obadias", abbreviation: "Ob" },
  { id: "jon", name: "Jonas", abbreviation: "Jn" },
  { id: "mic", name: "Miquéias", abbreviation: "Mq" },
  { id: "nam", name: "Naum", abbreviation: "Na" },
  { id: "hab", name: "Habacuque", abbreviation: "Hc" },
  { id: "zep", name: "Sofonias", abbreviation: "Sf" },
  { id: "hag", name: "Ageu", abbreviation: "Ag" },
  { id: "zec", name: "Zacarias", abbreviation: "Zc" },
  { id: "mal", name: "Malaquias", abbreviation: "Ml" },
  { id: "mat", name: "Mateus", abbreviation: "Mt" },
  { id: "mrk", name: "Marcos", abbreviation: "Mc" },
  { id: "luk", name: "Lucas", abbreviation: "Lc" },
  { id: "jhn", name: "João", abbreviation: "Jo" },
  { id: "act", name: "Atos", abbreviation: "At" },
  { id: "rom", name: "Romanos", abbreviation: "Rm" },
  { id: "1co", name: "1 Coríntios", abbreviation: "1Co" },
  { id: "2co", name: "2 Coríntios", abbreviation: "2Co" },
  { id: "gal", name: "Gálatas", abbreviation: "Gl" },
  { id: "eph", name: "Efésios", abbreviation: "Ef" },
  { id: "php", name: "Filipenses", abbreviation: "Fp" },
  { id: "col", name: "Colossenses", abbreviation: "Cl" },
  { id: "1th", name: "1 Tessalonicenses", abbreviation: "1Ts" },
  { id: "2th", name: "2 Tessalonicenses", abbreviation: "2Ts" },
  { id: "1ti", name: "1 Timóteo", abbreviation: "1Tm" },
  { id: "2ti", name: "2 Timóteo", abbreviation: "2Tm" },
  { id: "tit", name: "Tito", abbreviation: "Tt" },
  { id: "phm", name: "Filemon", abbreviation: "Fm" },
  { id: "heb", name: "Hebreus", abbreviation: "Hb" },
  { id: "jas", name: "Tiago", abbreviation: "Tg" },
  { id: "1pe", name: "1 Pedro", abbreviation: "1Pe" },
  { id: "2pe", name: "2 Pedro", abbreviation: "2Pe" },
  { id: "1jo", name: "1 João", abbreviation: "1Jo" },
  { id: "2jo", name: "2 João", abbreviation: "2Jo" },
  { id: "3jo", name: "3 João", abbreviation: "3Jo" },
  { id: "jud", name: "Judas", abbreviation: "Jd" },
  { id: "rev", name: "Apocalipse", abbreviation: "Ap" },
]

const BATCH_SIZE = 20
const MAX_RETRIES = 3

async function executeWithRetry(client, sql, args, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await client.execute(sql, args)
    } catch (err) {
      if (attempt === retries) throw err
      const delay = attempt * 2000
      err(`  Retry ${attempt}/${retries} after error: ${err.message}. Waiting ${delay}ms...`)
      await new Promise((r) => setTimeout(r, delay))
    }
  }
}

async function importBibles() {
  const { connect } = await import("@tursodatabase/serverless")

  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (!url) {
    err("TURSO_DATABASE_URL is required")
    process.exit(1)
  }

  const client = connect({ url, authToken: authToken || undefined })

  const files = readdirSync(BIBLES_DIR).filter((f) => f.endsWith(".sqlite"))
  log(`Found ${files.length} SQLite databases to import`)

  let totalVersions = 0
  let totalBooks = 0
  let totalVerses = 0

  for (const file of files) {
    const dbPath = join(BIBLES_DIR, file)
    const versionId = file.replace(/\.sqlite$/i, "").toLowerCase()
    const db = new Database(dbPath, { readonly: true })

    const metaRows = db.prepare("SELECT key, value FROM metadata").all()
    const meta = {}
    for (const row of metaRows) meta[row.key] = row.value
    const versionName = meta.name || versionId.toUpperCase()

    log(`Importing ${versionId} (${versionName})...`)

    const booksRaw = db.prepare("SELECT * FROM book ORDER BY id").all()
    await executeWithRetry(client,
      "INSERT OR REPLACE INTO bible_versions (id, name, total_books) VALUES (?, ?, ?)",
      [versionId, versionName, booksRaw.length]
    )

    let versionBookCount = 0
    let versionVerseCount = 0

    for (const book of booksRaw) {
      const appMeta = BOOK_META[book.id]
      if (!appMeta) {
        log(`  Skipping book id=${book.id} — no mapping`)
        continue
      }

      const testament = book.testament_reference_id === 1 ? "old" : "new"

      const chaptersRaw = db
        .prepare("SELECT DISTINCT chapter FROM verse WHERE book_id = ? ORDER BY chapter")
        .all(book.id)
      const maxChapter = chaptersRaw.length > 0 ? chaptersRaw[chaptersRaw.length - 1].chapter : 0

      await executeWithRetry(client,
        `INSERT OR REPLACE INTO bible_books (id, version_id, name, abbreviation, testament, chapters) VALUES (?, ?, ?, ?, ?, ?)`,
        [appMeta.id, versionId, appMeta.name, appMeta.abbreviation, testament, maxChapter]
      )

      const versesRaw = db
        .prepare("SELECT chapter, verse, text FROM verse WHERE book_id = ? ORDER BY chapter, verse")
        .all(book.id)

      for (let i = 0; i < versesRaw.length; i += BATCH_SIZE) {
        const batch = versesRaw.slice(i, i + BATCH_SIZE)
        const values = batch.map((v) => [
          `${versionId}-${appMeta.id}-${v.chapter}-${v.verse}`,
          versionId,
          appMeta.id,
          v.chapter,
          v.verse,
          v.text,
        ])
        const placeholders = batch.map(() => "(?, ?, ?, ?, ?, ?)").join(", ")
        const flatArgs = values.flat()

        await executeWithRetry(client,
          `INSERT OR REPLACE INTO bible_verses (id, version_id, book_id, chapter, verse, text) VALUES ${placeholders}`,
          flatArgs
        )
      }

      versionBookCount++
      versionVerseCount += versesRaw.length
      log(`  ${appMeta.id}: ${versesRaw.length} verses`)
    }

    db.close()

    totalVersions++
    totalBooks += versionBookCount
    totalVerses += versionVerseCount
    log(`  Done — ${versionBookCount} books, ${versionVerseCount} verses\n`)
  }

  log("=".repeat(50))
  log(`Import complete!`)
  log(`  Versions: ${totalVersions}`)
  log(`  Books: ${totalBooks}`)
  log(`  Verses: ${totalVerses}`)
}

importBibles().catch((e) => {
  err("Import failed: " + e.message)
  process.exit(1)
})
