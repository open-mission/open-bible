"use client";

import { Download, Loader2 } from "lucide-react";
import { useBibleVersion, useDownloadProgress } from "@/features/bible-reader/context/bible-version-context";
import {
  getNotInstalledAvailable,
  filterVersions,
  getVersionSize,
} from "./version-meta";
import { VersionRow } from "./version-row";
import { useVersionInstall } from "./use-version-install";

interface AvailableVersionsTabProps {
  query: string;
}

/**
 * Conteúdo da aba "Disponíveis": lista das versões não-instaladas filtrada por
 * `query`. Botão Baixar dispara a instalação; barra de progresso fixa no rodapé.
 * O ciclo de vida do toast de download é gerenciado por `useVersionInstall`.
 */
export function AvailableVersionsTab({ query }: AvailableVersionsTabProps) {
  const {
    availableVersions,
    installedVersions,
  } = useBibleVersion();
  const { isInstalling, downloadProgress } = useDownloadProgress();
  const notInstalled = getNotInstalledAvailable(
    availableVersions,
    installedVersions,
  );
  const filtered = filterVersions(notInstalled, query);
  const { install, installingName } = useVersionInstall();

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground gap-2">
        <p>
          {query
            ? `Nenhuma versão encontrada para "${query}".`
            : "Todas as versões já estão instaladas."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-2">
        {filtered.map((v) => (
          <VersionRow
            key={v.id}
            abbreviation={v.id}
            name={v.name}
            meta={`${v.totalBooks} livros • ${getVersionSize(v.id)} • SQLite`}
          >
            <button
              onClick={() => install(v.id, v.name)}
              disabled={isInstalling}
              className="rounded-md bg-primary text-primary-foreground text-xs px-3 py-1.5 font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 transition-opacity cursor-pointer"
              aria-label={`Baixar ${v.name}`}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Baixar</span>
            </button>
          </VersionRow>
        ))}
      </div>

      {isInstalling && downloadProgress && (
        <div className="mt-2 pt-3 border-t border-border shrink-0 sticky bottom-0 bg-background">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>
              Baixando {installingName}...{" "}
              {Math.round(
                (downloadProgress.current / downloadProgress.total) * 100,
              )}
              %
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{
                width: `${(downloadProgress.current / downloadProgress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
