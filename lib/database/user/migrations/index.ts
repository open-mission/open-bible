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
  {
    tag: "0002_highlights",
    statements: [
      `CREATE TABLE IF NOT EXISTS \`highlight_categories\` (
        \`id\` text PRIMARY KEY NOT NULL,
        \`name\` text NOT NULL,
        \`created_at\` integer NOT NULL
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS \`highlight_categories_name_unique\` ON \`highlight_categories\` (\`name\`)`,
      `CREATE TABLE IF NOT EXISTS \`highlights\` (
        \`id\` text PRIMARY KEY NOT NULL,
        \`color\` text NOT NULL,
        \`category_id\` text,
        \`note_id\` text,
        \`created_at\` integer NOT NULL,
        \`updated_at\` integer NOT NULL,
        FOREIGN KEY (\`category_id\`) REFERENCES \`highlight_categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
        FOREIGN KEY (\`note_id\`) REFERENCES \`notes\`(\`id\`) ON UPDATE no action ON DELETE set null
      )`,
      `CREATE TABLE IF NOT EXISTS \`highlight_verses\` (
        \`id\` text PRIMARY KEY NOT NULL,
        \`highlight_id\` text NOT NULL,
        \`book\` text NOT NULL,
        \`chapter\` integer NOT NULL,
        \`verse\` integer NOT NULL,
        \`bible\` text NOT NULL,
        FOREIGN KEY (\`highlight_id\`) REFERENCES \`highlights\`(\`id\`) ON UPDATE no action ON DELETE cascade
      )`,
      `CREATE INDEX IF NOT EXISTS \`idx_highlight_verses_lookup\` ON \`highlight_verses\` (\`book\`, \`chapter\`, \`verse\`, \`bible\`)`,
      `CREATE INDEX IF NOT EXISTS \`idx_highlight_verses_highlight_id\` ON \`highlight_verses\` (\`highlight_id\`)`,
    ],
  },
  {
    tag: "0003_highlight_content",
    statements: [
      `ALTER TABLE \`highlights\` ADD COLUMN \`content\` text DEFAULT '' NOT NULL`,
    ],
  },
]

