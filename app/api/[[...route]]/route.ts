import { app } from "@/lib/api/hono-app"

export const runtime = "nodejs"

export async function GET(request: Request) {
  return app.fetch(request)
}

export async function POST(request: Request) {
  return app.fetch(request)
}
