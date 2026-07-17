"use client";

import { useState } from "react";
import { useReleaseNotes } from "./release-notes-provider";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconSparkles } from "@tabler/icons-react";
import { ConfigDialog } from "@/features/config/components/config-dialog";

export function ReleaseNotesToast() {
  const {
    hasUpdate,
    hasPwaUpdate,
    hasAppUpdate,
    latestVersion,
    summary,
    dismiss,
    updatePwa,
  } = useReleaseNotes();
  const [configOpen, setConfigOpen] = useState(false);
  const [configFocus, setConfigFocus] = useState<"changelog" | undefined>(undefined);

  if (!hasUpdate) return null;

  const handleVerMudancas = () => {
    setConfigFocus("changelog");
    setConfigOpen(true);
  };

  const handleDismiss = () => {
    dismiss();
  };

  // Limit summary items to max 4 as per spec
  const displaySummary = summary.slice(0, 4);

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 md:inset-x-auto md:bottom-4 md:right-4 z-[90] p-4 md:p-0 pointer-events-none animate-in slide-in-from-bottom duration-300">
        <Card size="sm" className="pointer-events-auto w-full md:w-80 border border-border bg-popover/95 text-popover-foreground shadow-lg backdrop-blur-md rounded-t-2xl md:rounded-xl">
          <CardHeader className="flex flex-row items-center gap-2.5 p-4 pb-2 space-y-0">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <IconSparkles className="size-4" />
            </span>
            <CardTitle className="text-sm font-semibold tracking-tight leading-none">
              {hasAppUpdate ? `Nova versão v${latestVersion} disponível` : "Nova versão disponível"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 py-2 hidden md:block">
            {displaySummary.length > 0 ? (
              <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground max-h-[150px] overflow-y-auto custom-scrollbar">
                {displaySummary.map((item, idx) => (
                  <li key={idx} className="line-clamp-3">
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">
                Confira as novidades e melhorias na nova versão.
              </p>
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-end gap-2 p-4 pt-2">
            <Button variant="ghost" size="sm" onClick={handleDismiss} className="text-xs h-8 cursor-pointer">
              Agora não
            </Button>
            {hasAppUpdate && (
              <Button variant="outline" size="sm" onClick={handleVerMudancas} className="text-xs h-8 cursor-pointer">
                Ver mudanças
              </Button>
            )}
            {hasPwaUpdate && (
              <Button size="sm" onClick={updatePwa} className="text-xs h-8 cursor-pointer">
                Atualizar
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <ConfigDialog
        open={configOpen}
        onOpenChange={setConfigOpen}
        focus={configFocus}
      />
    </>
  );
}
