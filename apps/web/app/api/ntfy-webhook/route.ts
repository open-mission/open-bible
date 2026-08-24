import { NextResponse } from "next/server"

/**
 * Vercel Deploy Webhook → ntfy.sh notification proxy.
 *
 * Receives Vercel deployment webhook payloads and forwards them as
 * push notifications via ntfy.sh. Uses the NTFY_TOPIC environment
 * variable (set in Vercel dashboard).
 *
 * Configure in Vercel: Settings → Webhooks
 *   - URL: https://openbible-prod.vercel.app/api/ntfy-webhook
 *   - Events: deployment.succeeded, deployment.error, deployment.ready
 */

const NTFY_ENDPOINT = "https://ntfy.sh"

interface VercelWebhookPayload {
  type: string // "deployment.succeeded" | "deployment.error" | "deployment.ready" | ...
  payload: {
    deployment: {
      name: string
      url: string
      state?: string
      meta?: Record<string, string>
    }
    project?: {
      name: string
    }
  }
}

export async function POST(request: Request) {
  const topic = process.env.NTFY_TOPIC
  if (!topic) {
    return NextResponse.json(
      { error: "NTFY_TOPIC not configured" },
      { status: 500 },
    )
  }

  let body: VercelWebhookPayload
  try {
    body = (await request.json()) as VercelWebhookPayload
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { type, payload } = body
  if (!type || !payload?.deployment) {
    return NextResponse.json(
      { error: "Missing type or deployment payload" },
      { status: 400 },
    )
  }

  const { name, url, state, meta } = payload.deployment
  const deployUrl = url ? `https://${url}` : ""

  // Determine emoji and priority based on deployment state
  let emoji: string
  let priority: string
  let titleState: string

  if (type === "deployment.error" || state === "ERROR") {
    emoji = "❌"
    priority = "urgent"
    titleState = "FAILED"
  } else if (
    type === "deployment.succeeded" ||
    state === "READY" ||
    state === "SUCCEEDED"
  ) {
    emoji = "✅"
    priority = "default"
    titleState = "Ready"
  } else if (type === "deployment.ready" || state === "BUILDING") {
    emoji = "🔧"
    priority = "min"
    titleState = "Building"
  } else {
    emoji = "📢"
    priority = "default"
    titleState = state ?? type
  }

  // Build notification body with metadata
  const details = [
    deployUrl ? `**URL:** ${deployUrl}` : null,
    meta?.commitSha ? `**Commit:** \`${meta.commitSha.slice(0, 7)}\`` : null,
  ]
    .filter(Boolean)
    .join(" | ")

  const ntfyHeaders: Record<string, string> = {
    Title: `${emoji} Deploy ${titleState}: ${name}`,
    Tags: "vercel,rocket",
    Priority: priority,
  }

  if (deployUrl) {
    ntfyHeaders.Click = deployUrl
  }

  try {
    const res = await fetch(`${NTFY_ENDPOINT}/${topic}`, {
      method: "POST",
      headers: ntfyHeaders,
      body: details,
    })

    if (!res.ok) {
      console.error(`ntfy.sh returned ${res.status}: ${await res.text()}`)
      return NextResponse.json(
        { error: "Failed to send notification" },
        { status: 502 },
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("ntfy.sh request failed:", err)
    return NextResponse.json(
      { error: "Notification service unreachable" },
      { status: 502 },
    )
  }
}
