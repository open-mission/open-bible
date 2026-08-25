"use client";

/**
 * Formerly true only when running inside the Tauri desktop runtime on macOS with titleBarStyle:"Overlay".
 * Since titleBarStyle:"Overlay" has been removed to use native OS borders, this hook always returns false.
 */
export function useIsTauriMacOS(): boolean {
  return false;
}
