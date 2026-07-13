"use client";

import { APP_ENV, APP_VERSION, ENV_LABEL, isPreRelease } from "@/lib/app-env";
import { Badge } from "@/components/ui/badge";

export function VersionLabel() {
  const envLabel = ENV_LABEL[APP_ENV];

  return (
    <span
      aria-hidden="true"
      className="fixed bottom-4 left-4 z-40 hidden md:flex items-center gap-1.5 text-xs text-muted-foreground/40 font-mono select-none pointer-events-none"
    >
      <span>v{APP_VERSION}</span>
      {isPreRelease && envLabel ? (
        <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-medium">
          {envLabel}
        </Badge>
      ) : null}
    </span>
  );
}

