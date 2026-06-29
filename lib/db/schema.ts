export const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS bible_versions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    total_books INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bible_books (
    id TEXT NOT NULL,
    version_id TEXT NOT NULL,
    name TEXT NOT NULL,
    abbreviation TEXT NOT NULL,
    testament TEXT NOT NULL CHECK(testament IN ('old', 'new')),
    chapters INTEGER NOT NULL,
    FOREIGN KEY (version_id) REFERENCES bible_versions(id),
    PRIMARY KEY (id, version_id)
  );

  CREATE TABLE IF NOT EXISTS bible_verses (
    id TEXT PRIMARY KEY,
    version_id TEXT NOT NULL,
    book_id TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    text TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_verses_version_book ON bible_verses (version_id, book_id, chapter);
  CREATE INDEX IF NOT EXISTS idx_books_version ON bible_books (version_id);
`;
