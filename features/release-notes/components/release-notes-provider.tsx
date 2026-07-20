"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getAppVersion,
  compareSemver,
  getDismissedUpdateVersion,
  setDismissedUpdateVersion,
  getUpdateCheckCache,
  setUpdateCheckCache,
  getUpdateChannel,
  setUpdateChannel,
  type UpdateChannel,
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
  updateChannel: UpdateChannel;
  setChannel: (channel: UpdateChannel) => void;
  checkForUpdates: (force?: boolean) => Promise<{ success: boolean; hasUpdate: boolean }>;
}

const ReleaseNotesContext = createContext<ReleaseNotesContextType | undefined>(undefined);

interface GitHubRelease {
  tag_name: string;
  draft: boolean;
  body?: string;
  html_url?: string;
}

export function ReleaseNotesProvider({ children }: { children: React.ReactNode }) {
  const { isUpdateAvailable: hasPwaUpdate, updateNow } = useServiceWorkerUpdate();
  const [hasAppUpdate, setHasAppUpdate] = useState(false);
  const [latestVersion, setLatestVersion] = useState("0.0.0");
  const [changelog, setChangelog] = useState("");
  const [releaseUrl, setReleaseUrl] = useState("");
  const [isDismissed, setIsDismissed] = useState(false);
  const [updateChannel, setUpdateChannelState] = useState<UpdateChannel>(() => {
    return getUpdateChannel();
  });

  async function checkVersion(channel: UpdateChannel, force: boolean = false) {
    const appVersion = getAppVersion();
    const dismissed = getDismissedUpdateVersion();

    // 1. Verificar cache local de 1 hora
    const cache = getUpdateCheckCache();
    const oneHour = 60 * 60 * 1000;
    const now = Date.now();

    if (!force && cache && now - cache.timestamp < oneHour) {
      const isNewer = compareSemver(cache.version, appVersion) > 0;
      const isNotDismissed = cache.version !== dismissed;

      setLatestVersion(cache.version);
      setChangelog(cache.changelog);
      setReleaseUrl(cache.url);
      setHasAppUpdate(isNewer && isNotDismissed);
      return { success: true, hasUpdate: isNewer && isNotDismissed };
    }

    // 2. Fazer fetch na API do GitHub
    try {
      let remoteVersion = "";
      let changelogText = "";
      let htmlUrl = "";

      if (channel === "beta") {
        const response = await fetch(
          "https://api.github.com/repos/open-mission/open-bible/releases"
        );
        if (response.ok) {
          const releases = (await response.json()) as GitHubRelease[];
          // Filter out drafts and sort by semver descending
          const validReleases = (releases || [])
            .filter((r) => !r.draft)
            .sort((a, b) => compareSemver(b.tag_name, a.tag_name));

          if (validReleases.length > 0) {
            const latestRelease = validReleases[0];
            remoteVersion = latestRelease.tag_name.replace(/^v/, "");
            changelogText = latestRelease.body || "";
            htmlUrl = latestRelease.html_url || "";
          }
        } else {
          throw new Error("Failed to fetch releases list");
        }
      } else {
        const response = await fetch(
          "https://api.github.com/repos/open-mission/open-bible/releases/latest"
        );
        if (response.ok) {
          const data = await response.json();
          remoteVersion = data.tag_name.replace(/^v/, "");
          changelogText = data.body || "";
          htmlUrl = data.html_url || "";
        } else {
          throw new Error("Failed to fetch latest stable release");
        }
      }

      if (remoteVersion) {
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
        return { success: true, hasUpdate: isNewer && isNotDismissed };
      }
      return { success: false, hasUpdate: false };
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
        return { success: true, hasUpdate: isNewer && isNotDismissed };
      }
      return { success: false, hasUpdate: false };
    }
  }

  useEffect(() => {
    const channel = getUpdateChannel();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkVersion(channel, false);
  }, []);

  const setChannel = (channel: UpdateChannel) => {
    setUpdateChannelState(channel);
    setUpdateChannel(channel);
    // Clear cache to allow immediate check with the new channel parameters
    try {
      window.localStorage.removeItem("openbible:last-update-check");
    } catch {}
    checkVersion(channel, true);
  };

  const checkForUpdates = async (force: boolean = false) => {
    const channel = getUpdateChannel();
    return checkVersion(channel, force);
  };

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
        updateChannel,
        setChannel,
        checkForUpdates,
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

