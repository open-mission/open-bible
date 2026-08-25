import { turso } from "@/lib/turso";
import { SCHEMA_SQL } from "./schema";

export async function initializeDatabase() {
  const statements = SCHEMA_SQL.split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    await turso.execute(stmt);
  }
}

export { turso };
