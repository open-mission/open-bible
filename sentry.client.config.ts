import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring
  tracesSampleRate: 0.2,

  // Session Replay — sample 10% of sessions, capture 100% on errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Only enable in production to avoid noise, or if DSN is explicitly provided for local testing
  enabled: process.env.NODE_ENV === "production" || !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
  enableLogs: true,
})
