// Web (SSR na Vercel) uses relative /api routes; desktop exports use the remote API.
export const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_ORIGIN ??
  (process.env.TAURI_BUILD === "1" ? "https://openbible-prod.vercel.app" : "")
