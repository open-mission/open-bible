"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useIsMobile } from "@/lib/use-media-query";
import { useBibleVersion } from "@/features/bible-reader/context/bible-version-context";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { VersionSearchHeader } from "./version-search-header";
import { InstalledVersionsTab } from "./installed-versions-tab";
import { AvailableVersionsTab } from "./available-versions-tab";

interface VersionPickerDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Dialog rico de seleção de versão no estilo do BookChapterDialog: header fixo
 * com busca + abas "Instaladas"/"Disponíveis" + conteúdo rolante. Branch
 * mobile (BottomSheet 95%) x desktop (overlay central).
 */
export function VersionPickerDialog({
  open,
  onClose,
}: VersionPickerDialogProps) {
  const isMobile = useIsMobile();
  const { setVersionId, installedVersions, availableVersions } =
    useBibleVersion();
  const [query, setQuery] = useState("");

  function handleSelect(id: string) {
    setVersionId(id);
    onClose();
  }

  function handleClose() {
    setQuery("");
    onClose();
  }

  const installedCount = installedVersions.length;
  const availableCount = Math.max(0, availableVersions.length - installedCount);

  const content = (
    <div className="relative flex flex-col h-full bg-background overflow-hidden">
      <VersionSearchHeader
        query={query}
        onQueryChange={setQuery}
        onClose={handleClose}
      />

      {/* Fade abaixo do header */}
      <div className="absolute top-14 left-0 right-0 h-6 bg-linear-to-b from-background to-transparent pointer-events-none z-10" />

      <Tabs defaultValue="installed" className="flex-1 min-h-0 flex flex-col">
        <div className="px-4 md:px-6 pt-2 pb-2 shrink-0 z-10 bg-background relative">
          <TabsList className="w-full">
            <TabsTrigger value="installed">
              Instaladas ({installedCount})
            </TabsTrigger>
            <TabsTrigger value="available">
              Disponíveis ({availableCount})
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="installed" className="flex-1 min-h-0 mt-0">
          <div className="h-full overflow-y-auto p-4 md:p-0 pt-4 custom-scrollbar">
            <InstalledVersionsTab query={query} onSelect={handleSelect} />
          </div>
        </TabsContent>
        <TabsContent value="available" className="flex-1 min-h-0 mt-0">
          <div className="h-full overflow-y-auto p-4 md:p-0 pt-4 custom-scrollbar">
            <AvailableVersionsTab query={query} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  if (isMobile) {
    return (
      <BottomSheet open={open} onClose={handleClose} size="95">
        {content}
      </BottomSheet>
    );
  }

  if (!open) return null;

  const dialog = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="bg-background w-full max-w-2xl h-full max-h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-border animate-in fade-in zoom-in-95 duration-200">
        {content}
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(dialog, document.body)
    : dialog;
}
