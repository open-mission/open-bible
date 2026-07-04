# PWA Update System — Design Spec

## Context

The Open Bible PWA currently has a service worker (`public/sw.js`) that caches static assets and Bible data. When a new build is deployed, there is no mechanism to notify users or prompt them to update. Users may remain on stale app versions indefinitely. This spec adds a standard "prompt-then-promote" update flow.

**Scope**: App shell only (SW, JS, CSS). Bible data (IndexedDB) is managed separately via the existing `bible-db.ts` download/remove flow and is not affected.

## Goal

When a new service worker version is detected (browser finds byte-different `sw.js`), show a toast prompting the user to reload. On accept, the new SW activates and the page reloads.

## Approach

Standard PWA pattern — no IndexedDB version comparison needed. The browser's SW lifecycle handles detection natively.

## Files to Modify

| File | Change |
|------|--------|
| `public/sw.js` | Add `skipWaiting()` on install, `clients.claim()` on activate, listen for `SKIP_WAITING` message |
| `lib/use-sw-update.ts` | **New file** — React hook exposing `{ isUpdateAvailable, updateNow }` |
| `components/update-toast.tsx` | **New file** — Toast UI that uses the hook |
| `app/layout.tsx` | Render `<UpdateToast />` alongside `<ServiceWorkerRegister />` |

## Detailed Design

### 1. `public/sw.js`

```js
const CACHE_NAME = "openbible-v1"

const STATIC_URLS = [
  "/",
  "/config",
  "/manifest.json",
  "/data/bibles/index.json",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_URLS).catch(() => {})
    })
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    })
  )
  self.clients.claim()
})

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

self.addEventListener("fetch", (event) => {
  // ... unchanged
})
```

Key changes:
- `self.clients.claim()` in `activate` — takes control of open tabs after activation
- `message` listener — responds to `SKIP_WAITING` from the client
- No `skipWaiting()` in `install` — the SW stays in "waiting" state until the user explicitly triggers activation via the prompt

**Note**: The SW installs normally and waits. The `message` listener is registered during install, so it's ready to receive `SKIP_WAITING` from the client when the user clicks "Atualizar".

### 2. `lib/use-sw-update.ts`

```ts
"use client"

import { useState, useEffect, useCallback } from "react"

interface UseServiceWorkerUpdate {
  isUpdateAvailable: boolean
  updateNow: () => void
}

export function useServiceWorkerUpdate(): UseServiceWorkerUpdate {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [waitingSW, setWaitingSW] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    navigator.serviceWorker.ready.then((registration) => {
      // Check if a SW is already waiting
      if (registration.waiting) {
        setIsUpdateAvailable(true)
        setWaitingSW(registration.waiting)
      }

      registration.addEventListener("updatefound", () => {
        const newSW = registration.installing
        if (!newSW) return

        newSW.addEventListener("statechange", (event) => {
          const target = event.target as ServiceWorker
          if (target.state === "installed") {
            setIsUpdateAvailable(true)
            setWaitingSW(target)
          }
        })
      })
    })
  }, [])

  const updateNow = useCallback(() => {
    if (!waitingSW) return

    waitingSW.postMessage("SKIP_WAITING")

    const onControllerChange = () => {
      window.location.reload()
    }

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange)

    // Safety timeout — if controllerchange doesn't fire in 2s, force reload
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  }, [waitingSW])

  return { isUpdateAvailable, updateNow }
}
```

Key behaviors:
- Checks `registration.waiting` on page load (catches ignored updates from previous sessions)
- Listens for `updatefound` → `state: installed` to detect new deployments
- `updateNow()` sends `SKIP_WAITING` message, then reloads on `controllerchange`
- Safety timeout of 2s prevents stuck state

### 3. `components/update-toast.tsx`

```tsx
"use client"

import { useEffect } from "react"
import { useServiceWorkerUpdate } from "@/lib/use-sw-update"
import { useToast } from "@/lib/use-toast"

export function UpdateToast() {
  const { isUpdateAvailable, updateNow } = useServiceWorkerUpdate()
  const { toast } = useToast()

  useEffect(() => {
    if (isUpdateAvailable) {
      toast({
        title: "Nova versão disponível",
        description: "Clique para atualizar o app.",
        action: {
          label: "Atualizar",
          onClick: updateNow,
        },
        duration: Infinity, // stays until user acts or navigates away
      })
    }
  }, [isUpdateAvailable, toast, updateNow])

  return null
}
```

Key behaviors:
- Renders nothing — purely a side-effect component
- Shows toast with infinite duration (stays visible until user interacts)
- Toast has "Atualizar" button that triggers `updateNow()`
- Uses existing `useToast()` system — no new UI components needed

### 4. `app/layout.tsx`

Add `<UpdateToast />` inside the provider tree (after `<ServiceWorkerRegister />`):

```tsx
<ServiceWorkerRegister />
<UpdateToast />
```

## Data Flow

```
User navigates → browser checks sw.js (byte comparison)
  → New sw.js detected → updatefound event → state: installed
    → Hook sets isUpdateAvailable = true
      → Toast appears: "Nova versão disponível"
        → User clicks "Atualizar"
          → postMessage("SKIP_WAITING") to new SW
            → New SW activates → controllerchange event
              → window.location.reload()
```

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| User ignores toast | Toast stays visible (infinite duration). Next page load also detects waiting SW |
| Multiple tabs open | Each tab shows its own toast. All tabs reload after skipWaiting |
| SW fails to install | `statechange` never reaches `installed` — no toast shown |
| Dev mode | SW registration may fail — hook handles this gracefully |
| First visit | No SW registered yet — hook does nothing |

## What This Does NOT Change

- Bible data (IndexedDB) — no modifications
- Offline caching strategy — unchanged
- `next.config.mjs` — already has correct `Cache-Control: no-cache` for `sw.js`
- No new dependencies

## Testing

1. Run `pnpm dev` — verify no toast in dev (SW may not register)
2. Build and serve locally (`pnpm build && pnpm start`) — verify SW registers
3. Make a code change, rebuild — verify toast appears
4. Click "Atualizar" — verify page reloads with new content
5. Open dev tools → Application → Service Workers — verify new SW is active
