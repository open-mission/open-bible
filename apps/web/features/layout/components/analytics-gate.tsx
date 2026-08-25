"use client"

import { Analytics } from "@vercel/analytics/next"
import { isTauri } from "@/lib/is-tauri"

/**
 * Renders Vercel Analytics only in non-Tauri (web) clients. Inside the Tauri
 * desktop app the analytics endpoint is blocked by the CSP `connect-src` (which
 * only allows `self` and the Bible API origin), so we skip it to avoid console
 * errors and wasted requests. Analytics itself is a no-op outside production.
 */
export function AnalyticsGate() {
  if (isTauri) return null
  return <Analytics />
}
