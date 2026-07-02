// Detects whether the app is running inside a Tauri v2 webview at runtime.
// Tauri v2 injects `window.__TAURI_INTERNALS__` in the webview; it is absent in a
// regular browser. Evaluated on the client only — during SSG/SSR there is no
// `window`, so this is `false` at build time and resolved again in the browser.
export const isTauri =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
