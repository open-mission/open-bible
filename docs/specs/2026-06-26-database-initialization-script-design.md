# Database Initialization Script Design

## Overview
Create a Node.js script (`scripts/init-db.mjs`) that initializes the TursoDB database by executing the SQL schema defined in `lib/db/schema.ts`. The script will be added as a `db:init` npm script.

## Requirements
- Read `SCHEMA_SQL` from `lib/db/schema.ts`
- Connect to TursoDB using environment variables `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`
- Execute each SQL statement (split by semicolons) to create tables
- Use `IF NOT EXISTS` to be idempotent
- Log each statement being executed
- Handle errors appropriately

## Approach
We'll use the `@tursodatabase/serverless` client (already a dependency) with the `connect` function. The script will:
1. Dynamically import the client
2. Connect using env vars (fallback to local file for development)
3. Read and parse the schema file
4. Split SQL into statements and execute sequentially
5. Provide clear success/error output

## Components
- **Schema Parser**: Extracts SQL from `SCHEMA_SQL` constant using regex
- **Database Client**: TursoDB connection using `@tursodatabase/serverless`
- **Executor**: Runs each statement and logs progress

## Data Flow
```
schema.ts → readFileSync → regex extract → split by ';' → for each statement → client.execute()
```

## Error Handling
- Exit with code 1 if schema extraction fails
- Catch and log database execution errors
- Continue execution after errors? No: stop on first error (fail fast)

## Testing
- Manual verification: `pnpm db:init`
- Expected output: logs each statement prefix and "Database initialized successfully!"

## Integration
Add `"db:init": "node scripts/init-db.mjs"` to package.json scripts.

## Questions for Review
1. Should we reuse the existing `turso` client from `lib/turso.ts`? It's an ES module; importing it in the script might require transpilation. Simpler to use direct import.
2. Should we add a `--dry-run` flag? Not needed for now.
3. Should we handle SQL statements that contain semicolons inside strings? The schema doesn't have any, so simple split works.

## Approval
- [ ] User approves design
