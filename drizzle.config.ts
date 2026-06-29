import { defineConfig } from "drizzle-kit"

// Dev-only: `npx drizzle-kit generate` produces SQL we hand-embed into
// lib/database/user/migrations/index.ts (the browser has no filesystem).
export default defineConfig({
  dialect: "sqlite",
  schema: "./lib/database/user/schema.ts",
  out: "./lib/database/user/migrations/sql",
})
