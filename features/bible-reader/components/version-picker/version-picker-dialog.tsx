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
 * Overlay escuro para desktop - envolve o conteúdo com fundo semi-transparente.
 */
function VersionPickerOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      {children}
    </div>
  );
}

/**
 * Portal que renderiza o conteúdo no body (desktop only).
 */
function VersionPickerPortal({ children }: { children: React.ReactNode }) {
  return typeof document !== "undefined"
    ? createPortal(children, document.body)
    : null;
}

/**
 * Lista de abas com estilo padrão - wrapper em torno do TabsList.
 */
function VersionPickerTabsList({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 md:px-6 pt-2 pb-2 shrink-0 z-10 bg-background relative">
      <TabsList className="w-full">{children}</TabsList>
    </div>
  );
}

/**
 * Trigger de aba com contagem automática.
 */
function VersionPickerTabsTrigger({
  value,
  count,
  children,
}: {
  value: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <TabsTrigger value={value}>
      {children} ({count})
    </TabsTrigger>
  );
}

/**
 * Conteúdo da aba com scroll interno - wrapper em torno do TabsContent.
 */
function VersionPickerTabContent({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  return (
    <TabsContent value={value} className="flex-1 min-h-0 mt-0">
      <div className="h-full overflow-y-auto p-4 md:p-0 pt-4 custom-scrollbar">
        {children}
      </div>
    </TabsContent>
  );
}

/**
 * Dialog rico de seleção de versão no estilo do BookChapterDialog: header fixo
 * com busca + abas "Instaladas"/"Disponíveis" + conteúdo rolante. Branch
 * mobile (BottomSheet 95%) x desktop (overlay central).
 *
 * Usa Composition Pattern - os sub-componentes podem ser usados individualmente
 * para customização avançada.
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
        <VersionPickerTabsList>
          <VersionPickerTabsTrigger value="installed" count={installedCount}>
            Instaladas
          </VersionPickerTabsTrigger>
          <VersionPickerTabsTrigger value="available" count={availableCount}>
            Disponíveis
          </VersionPickerTabsTrigger>
        </VersionPickerTabsList>

        <VersionPickerTabContent value="installed">
          <InstalledVersionsTab query={query} onSelect={handleSelect} />
        </VersionPickerTabContent>

        <VersionPickerTabContent value="available">
          <AvailableVersionsTab query={query} />
        </VersionPickerTabContent>
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

  return (
    <VersionPickerPortal>
      <VersionPickerOverlay>
        <div className="bg-background w-full max-w-2xl h-full max-h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-border animate-in fade-in zoom-in-95 duration-200">
          {content}
        </div>
      </VersionPickerOverlay>
    </VersionPickerPortal>
  );
}

/**
 * Composition API - sub-componentes para uso avançado.
 */
VersionPickerDialog.Overlay = VersionPickerOverlay;
VersionPickerDialog.Portal = VersionPickerPortal;
VersionPickerDialog.TabsList = VersionPickerTabsList;
VersionPickerDialog.TabsTrigger = VersionPickerTabsTrigger;
VersionPickerDialog.TabsContent = VersionPickerTabContent;
