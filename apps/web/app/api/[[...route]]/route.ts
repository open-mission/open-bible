import { app } from "@/lib/api/hono-app"

export async function GET(request: Request) {
  return app.fetch(request)
}

export async function POST(request: Request) {
  return app.fetch(request)
}

export async function OPTIONS(request: Request) {
  return app.fetch(request)
}
