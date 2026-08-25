import { connect } from "@tursodatabase/serverless";

type TursoClient = ReturnType<typeof connect>;

function createClient(): TursoClient {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("TURSO_DATABASE_URL is required");
  return connect({ url, authToken: authToken || undefined });
}

let _client: TursoClient | null = null;

// Lazy singleton — client is created on first property access, not at module
// load time, so Next.js build succeeds without TURSO_DATABASE_URL in the env.
export const turso = new Proxy({} as TursoClient, {
  get(_, prop: string) {
    if (!_client) _client = createClient();
    return (_client as unknown as Record<string, unknown>)[prop];
  },
});
