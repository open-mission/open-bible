"use client";

import { useEffect, useState } from "react";

/**
 * True only when running inside the Tauri desktop runtime on macOS.
 * titleBarStyle:"Overlay" (set in tauri.conf.json) is macOS-only, so the
 * traffic-light inset / drag region must also be macOS+Tauri only.
 */
export function useIsTauriMacOS(): boolean {
  const [isTauriMacOS, setIsTauriMacOS] = useState(false);

  useEffect(() => {
    const isTauri =
      typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
    const isMac =
      typeof navigator !== "undefined" &&
      /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
    setIsTauriMacOS(isTauri && isMac);
  }, []);

  return isTauriMacOS;
}
