"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getAppVersion,
  compareSemver,
  getDismissedUpdateVersion,
  setDismissedUpdateVersion,
  getUpdateCheckCache,
  setUpdateCheckCache,
} from "@/lib/release-notes/version";
import { useServiceWorkerUpdate } from "@/features/service-worker/hooks/use-sw-update";

interface ReleaseNotesContextType {
  hasUpdate: boolean;
  hasPwaUpdate: boolean;
  hasAppUpdate: boolean;
  latestVersion: string;
  changelog: string;
  releaseUrl: string;
  summary: string[];
  dismiss: () => void;
  updatePwa: () => void;
  updateApp: () => void;
}

const ReleaseNotesContext = createContext<ReleaseNotesContextType | undefined>(undefined);

export function ReleaseNotesProvider({ children }: { children: React.ReactNode }) {
  const { isUpdateAvailable: hasPwaUpdate, updateNow } = useServiceWorkerUpdate();
  const [hasAppUpdate, setHasAppUpdate] = useState(false);
  const [latestVersion, setLatestVersion] = useState("0.0.0");
  const [changelog, setChangelog] = useState("");
  const [releaseUrl, setReleaseUrl] = useState("");
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    async function checkVersion() {
      const appVersion = getAppVersion();
      const dismissed = getDismissedUpdateVersion();

      // 1. Verificar cache local de 1 hora
      const cache = getUpdateCheckCache();
      const oneHour = 60 * 60 * 1000;
      const now = Date.now();

      if (cache && now - cache.timestamp < oneHour) {
        const isNewer = compareSemver(cache.version, appVersion) > 0;
        const isNotDismissed = cache.version !== dismissed;

        setLatestVersion(cache.version);
        setChangelog(cache.changelog);
        setReleaseUrl(cache.url);
        setHasAppUpdate(isNewer && isNotDismissed);
        return;
      }

      // 2. Fazer fetch na API do GitHub
      try {
        const response = await fetch(
          "https://api.github.com/repos/open-mission/open-bible/releases/latest"
        );
        if (response.ok) {
          const data = await response.json();
          const remoteVersion = data.tag_name.replace(/^v/, "");
          const changelogText = data.body || "";
          const htmlUrl = data.html_url || "";

          // Salva no cache
          setUpdateCheckCache({
            timestamp: now,
            version: remoteVersion,
            changelog: changelogText,
            url: htmlUrl,
          });

          const isNewer = compareSemver(remoteVersion, appVersion) > 0;
          const isNotDismissed = remoteVersion !== dismissed;

          setLatestVersion(remoteVersion);
          setChangelog(changelogText);
          setReleaseUrl(htmlUrl);
          setHasAppUpdate(isNewer && isNotDismissed);
        }
      } catch (error) {
        console.error("Failed to fetch remote version from GitHub:", error);

        // Fallback para cache se disponível (mesmo expirado)
        if (cache) {
          const isNewer = compareSemver(cache.version, appVersion) > 0;
          const isNotDismissed = cache.version !== dismissed;

          setLatestVersion(cache.version);
          setChangelog(cache.changelog);
          setReleaseUrl(cache.url);
          setHasAppUpdate(isNewer && isNotDismissed);
        }
      }
    }

    checkVersion();
  }, []);

  const hasUpdate = (hasAppUpdate || hasPwaUpdate) && !isDismissed;

  const updatePwa = () => {
    updateNow();
  };

  const updateApp = () => {
    if (hasPwaUpdate) {
      updateNow();
    } else if (releaseUrl) {
      window.open(releaseUrl, "_blank", "noopener,noreferrer");
    }
  };

  const dismiss = () => {
    setDismissedUpdateVersion(latestVersion);
    setIsDismissed(true);
  };

  return (
    <ReleaseNotesContext.Provider
      value={{
        hasUpdate,
        hasPwaUpdate,
        hasAppUpdate,
        latestVersion,
        changelog,
        releaseUrl,
        summary: [],
        dismiss,
        updatePwa,
        updateApp,
      }}
    >
      {children}
    </ReleaseNotesContext.Provider>
  );
}

export function useReleaseNotes() {
  const context = useContext(ReleaseNotesContext);
  if (context === undefined) {
    throw new Error("useReleaseNotes must be used within a ReleaseNotesProvider");
  }
  return context;
}

