// Embedded migrations. The browser has no filesystem, so generated SQL is
// inlined here. To add a migration: run `npx drizzle-kit generate`,
// then append a new entry with a unique, monotonic `tag`.
export interface Migration {
  tag: string
  statements: string[]
}

export const MIGRATIONS: Migration[] = [
  {
    tag: "0000_init",
    statements: [
      `CREATE TABLE IF NOT EXISTS \`notes\` (
        \`id\` text PRIMARY KEY NOT NULL,
        \`title\` text,
        \`content\` text DEFAULT '' NOT NULL,
        \`created_at\` integer NOT NULL,
        \`updated_at\` integer NOT NULL,
        \`deleted_at\` integer
      )`,
      `CREATE TABLE IF NOT EXISTS \`note_references\` (
        \`id\` text PRIMARY KEY NOT NULL,
        \`note_id\` text NOT NULL,
        \`bible\` text NOT NULL,
        \`book\` text NOT NULL,
        \`chapter\` integer NOT NULL,
        \`verse_start\` integer NOT NULL,
        \`verse_end\` integer,
        \`order\` integer DEFAULT 0 NOT NULL,
        FOREIGN KEY (\`note_id\`) REFERENCES \`notes\`(\`id\`) ON UPDATE no action ON DELETE cascade
      )`,
      `CREATE INDEX IF NOT EXISTS \`idx_note_references_note_id\` ON \`note_references\` (\`note_id\`)`,
    ],
  },
  {
    tag: "0001_installed_bibles",
    statements: [
      `CREATE TABLE IF NOT EXISTS \`installed_bibles\` (
        \`id\` text PRIMARY KEY NOT NULL,
        \`name\` text NOT NULL,
        \`installed_at\` integer NOT NULL,
        \`version_code\` integer DEFAULT 1 NOT NULL
      )`,
    ],
  },
]

