"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getAppVersion, compareSemver, getLastSeenVersion, setLastSeenVersion } from "@/lib/release-notes/version";
import { summarizeLatest, changelogSrc } from "@/lib/release-notes/changelog";

interface ReleaseNotesContextType {
  hasUpdate: boolean;
  latestVersion: string;
  summary: string[];
  dismiss: () => void;
}

const ReleaseNotesContext = createContext<ReleaseNotesContextType | undefined>(undefined);

export function ReleaseNotesProvider({ children }: { children: React.ReactNode }) {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [latestVersion, setLatestVersion] = useState("0.0.0");
  const [summary, setSummary] = useState<string[]>([]);

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

      const lastSeen = getLastSeenVersion();

      if (compareSemver(latest, lastSeen) > 0) {
        setHasUpdate(true);
        setLatestVersion(latest);
        setSummary(summarizeLatest(changelogSrc));
      }
    }

    checkVersion();
  }, []);

  const dismiss = () => {
    setLastSeenVersion(latestVersion);
    setHasUpdate(false);
  };

  return (
    <ReleaseNotesContext.Provider value={{ hasUpdate, latestVersion, summary, dismiss }}>
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
