// Main-thread proxy for the OPFS capability check that sqlite-wasm's
// installOpfsSAHPoolVfs() performs inside the worker. The SAHPool VFS needs
// navigator.storage.getDirectory (OPFS root) plus the FileSystem directory handle
// types. The sync access handle itself is worker-only, so we don't test it here —
// any modern engine that exposes the OPFS root also ships createSyncAccessHandle in
// workers. Used to surface a friendly message before the worker fails to boot
// (notably on older WebKitGTK where OPFS may be missing).
export function isOpfsAvailable(): boolean {
  if (typeof window === "undefined") return false
  try {
    return (
      typeof navigator !== "undefined" &&
      typeof navigator.storage?.getDirectory === "function" &&
      typeof FileSystemDirectoryHandle !== "undefined"
    )
  } catch {
    return false
  }
}
