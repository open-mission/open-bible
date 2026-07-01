import { betterAuth } from "better-auth";
import { createClient } from "@libsql/client";
import { LibsqlDialect } from "@libsql/kysely-libsql";

function createAuth() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  });
  const dialect = new LibsqlDialect({ client });
  return betterAuth({
    database: dialect,
    emailAndPassword: {
      enabled: true,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
    },
  });
}

type Auth = ReturnType<typeof createAuth>;
let _auth: Auth | null = null;

// Lazy singleton — defers createClient() to request time so Next.js build
// succeeds without TURSO_DATABASE_URL set in the CI environment.
export const auth = new Proxy({} as Auth, {
  get(_, prop: string) {
    if (!_auth) _auth = createAuth();
    return (_auth as unknown as Record<string, unknown>)[prop];
  },
});
