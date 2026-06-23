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
      return cache.addAll(STATIC_URLS).catch(() => {
        // Some URLs may fail — that's ok
      })
    })
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    })
  )
})

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // Only handle same-origin GET requests
  if (url.origin !== location.origin || event.request.method !== "GET") return

  // Cache bible data files
  if (url.pathname.startsWith("/data/bibles/")) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            cache.put(event.request, response.clone())
            return response
          })
          .catch(() => caches.match(event.request))
      })
    )
    return
  }

  // Network-first for everything else
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const cacheable =
          response.type === "basic" &&
          (url.pathname.startsWith("/_next/") ||
            url.pathname.match(/\.(js|css|woff2?|png|svg)$/))
        if (cacheable) {
          const res = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, res))
        }
        return response
      })
      .catch(() => caches.match(event.request))
  )
})
