"use client";

import { APP_ENV, APP_VERSION, ENV_LABEL, isPreRelease } from "@/lib/app-env";

export function DevBanner() {
  if (!isPreRelease) return null;

  const bgColor =
    APP_ENV === "development" ? "bg-red-500/85" : "bg-amber-500/85";
  const textColor = APP_ENV === "development" ? "text-white" : "text-black";
  const label = ENV_LABEL[APP_ENV] ?? "";

  return (
    <aside
      role="banner"
      aria-label={`Ambiente de ${label}`}
      className={`fixed top-0 left-0 right-0 z-50 h-6 ${bgColor} backdrop-blur flex items-center justify-center`}
    >
      <span className={`text-xs font-medium ${textColor} select-none`}>
        {label} · v{APP_VERSION}
      </span>
    </aside>
  );
}
