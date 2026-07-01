"use client";

import { APP_ENV, APP_VERSION } from "@/lib/app-env";

export function VersionLabel() {
  if (APP_ENV !== "production") return null;

  return (
    <span
      aria-hidden="true"
      className="fixed bottom-4 left-4 z-40 text-xs text-muted-foreground/40 font-mono select-none"
    >
      v{APP_VERSION}
    </span>
  );
}
