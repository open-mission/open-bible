#!/usr/bin/env node

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function initDB() {
  const { connect } = await import("@tursodatabase/serverless");

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error("TURSO_DATABASE_URL is required");
    process.exit(1);
  }

  const client = connect({
    url,
    authToken: authToken || undefined,
  });

  const schemaPath = join(__dirname, "..", "lib", "db", "schema.ts");
  const schemaContent = readFileSync(schemaPath, "utf-8");

  const sqlMatch = schemaContent.match(/SCHEMA_SQL\s*=\s`([\s\S]*?)`/);
  if (!sqlMatch) {
    console.error("Could not find SCHEMA_SQL in schema.ts");
    process.exit(1);
  }

  const sql = sqlMatch[1];
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    console.log(`Executing: ${stmt.substring(0, 60)}...`);
    await client.execute(stmt);
  }

  console.log("Database initialized successfully!");
}

initDB().catch((err) => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});
