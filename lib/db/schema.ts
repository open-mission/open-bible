export const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS highlights (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    version_id TEXT,
    verse_id TEXT NOT NULL,
    color TEXT NOT NULL,
    custom_hex TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    verse_ids TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bible_versions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    total_books INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bible_books (
    id TEXT PRIMARY KEY,
    version_id TEXT NOT NULL,
    name TEXT NOT NULL,
    abbreviation TEXT NOT NULL,
    testament TEXT NOT NULL,
    chapters INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bible_verses (
    id TEXT PRIMARY KEY,
    version_id TEXT NOT NULL,
    book_id TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    text TEXT NOT NULL
  );
`;
