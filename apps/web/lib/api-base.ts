// Web (SSR na Vercel): "" → rotas /api relativas do próprio site.
// Desktop (Tauri export): NEXT_PUBLIC_API_ORIGIN aponta para a API remota.
export const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN ?? ""
