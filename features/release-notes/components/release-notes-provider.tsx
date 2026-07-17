"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getAppVersion,
  compareSemver,
  getLastSeenVersion,
  setLastSeenVersion,
  getPwaUpdatedVersion,
  setPwaUpdatedVersion,
  getPwaDismissedVersion,
  setPwaDismissedVersion,
} from "@/lib/release-notes/version";
import { summarizeLatest, changelogSrc } from "@/lib/release-notes/changelog";
import { useServiceWorkerUpdate } from "@/features/service-worker/hooks/use-sw-update";

interface ReleaseNotesContextType {
  hasUpdate: boolean;
  hasPwaUpdate: boolean;
  hasAppUpdate: boolean;
  latestVersion: string;
  summary: string[];
  dismiss: () => void;
  updatePwa: () => void;
}

const ReleaseNotesContext = createContext<ReleaseNotesContextType | undefined>(undefined);

export function ReleaseNotesProvider({ children }: { children: React.ReactNode }) {
  const { isUpdateAvailable: hasPwaUpdate, updateNow } = useServiceWorkerUpdate();
  const [hasAppUpdate, setHasAppUpdate] = useState(false);
  const [latestVersion, setLatestVersion] = useState("0.0.0");
  const [summary, setSummary] = useState<string[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);

  const appVersion = getAppVersion();
  const pwaUpdated = getPwaUpdatedVersion() === appVersion;
  const pwaDismissed = getPwaDismissedVersion() === appVersion;
  const showPwa = hasPwaUpdate && !pwaDismissed && !pwaUpdated;

  useEffect(() => {
    async function checkVersion() {
      const appVersion = getAppVersion();
      let remoteVersion = "";

      try {
        const response = await fetch("/api/version");
        if (response.ok) {
          const data = await response.json();
          remoteVersion = data.version;
        }
      } catch (error) {
        console.error("Failed to fetch remote version:", error);
      }

      const latest =
        remoteVersion && compareSemver(remoteVersion, appVersion) > 0
          ? remoteVersion
          : appVersion;

      setLatestVersion(latest);

      const lastSeen = getLastSeenVersion();

      if (compareSemver(latest, lastSeen) > 0) {
        setHasAppUpdate(true);
        setSummary(summarizeLatest(changelogSrc));
      }
    }

    checkVersion();
  }, []);

  const hasUpdate = (hasAppUpdate || showPwa) && !isDismissed;

  const updatePwa = () => {
    setPwaUpdatedVersion(getAppVersion());
    updateNow();
  };

  const dismiss = () => {
    if (hasAppUpdate) {
      setLastSeenVersion(latestVersion);
    }
    if (hasPwaUpdate) {
      setPwaDismissedVersion(getAppVersion());
    }
    setIsDismissed(true);
  };

  return (
    <ReleaseNotesContext.Provider
      value={{
        hasUpdate,
        hasPwaUpdate,
        hasAppUpdate,
        latestVersion,
        summary,
        dismiss,
        updatePwa,
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
