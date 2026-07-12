"use client";

import { useWorkspaceMode } from "@/features/workspace/hooks/use-workspace-mode";
import { SimpleHome } from "@/features/workspace/components/simple-home";
import { AdvancedHome } from "@/features/workspace/components/advanced-home";

/**
 * Home page — delegates to SimpleHome (classic single reader) or AdvancedHome
 * (workspace with tabs) based on the user's reading mode preference. The mode
 * is persisted in localStorage via useWorkspaceMode. Until the mode is loaded
 * (first render), a neutral background is shown to avoid a mode flash.
 */
export default function Home() {
  const { mode, loaded } = useWorkspaceMode();

  if (!loaded) {
    return <div className="h-dvh bg-background" />;
  }

  return mode === "advanced" ? <AdvancedHome /> : <SimpleHome />;
}
