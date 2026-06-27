import { connect } from "@tursodatabase/serverless";

function getTursoClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error("TURSO_DATABASE_URL is required");
  }

  return connect({
    url,
    authToken: authToken || undefined,
  });
}

export const turso = getTursoClient();
