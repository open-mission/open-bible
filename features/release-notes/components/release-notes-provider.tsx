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
import { isTauri } from "@/lib/is-tauri";
import * as Sentry from "@sentry/nextjs";
import type { Update } from "@tauri-apps/plugin-updater";

export type TauriUpdaterStatus = "idle" | "checking" | "available" | "no-update" | "downloading" | "downloaded" | "error";

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
  
  // Tauri specific additions
  isTauri: boolean;
  tauriStatus: TauriUpdaterStatus;
  tauriProgress: number;
  tauriError: string;
  tauriDownloadInstall: () => Promise<void>;
  tauriRelaunch: () => Promise<void>;
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

  // Tauri native updater states
  const [tauriStatus, setTauriStatus] = useState<TauriUpdaterStatus>("idle");
  const [tauriProgress, setTauriProgress] = useState<number>(0);
  const [tauriError, setTauriError] = useState<string>("");
  const [tauriUpdateObj, setTauriUpdateObj] = useState<Update | null>(null);

  const tauriDownloadInstall = async () => {
    if (!tauriUpdateObj) return;
    setTauriStatus("downloading");
    setTauriProgress(0);
    setTauriError("");

    Sentry.addBreadcrumb({
      category: "tauri-updater",
      message: "Starting Tauri update download and install from dialog/provider",
      level: "info",
    });

    try {
      await tauriUpdateObj.downloadAndInstall((event: any) => {
        if (event?.event === "Started") {
          setTauriProgress(0);
        } else if (event?.event === "Progress") {
          if (event.data?.contentLength && event.data?.progress != null) {
            const pct = Math.round((event.data.progress / event.data.contentLength) * 100);
            setTauriProgress(pct);
          }
        } else if (event?.event === "Finished") {
          setTauriProgress(100);
        }
      });
      setTauriStatus("downloaded");
      Sentry.captureMessage("Tauri update download and install completed successfully", "info");
    } catch (err: unknown) {
      console.error("Erro ao baixar e instalar atualização do Tauri:", err);
      setTauriStatus("error");
      const errStr = (err instanceof Error ? err : new Error(String(err))).toString();
      setTauriError(errStr);
      Sentry.captureException(err, {
        tags: { context: "tauri_download_install" },
      });
    }
  };

  const tauriRelaunch = async () => {
    Sentry.addBreadcrumb({
      category: "tauri-updater",
      message: "Attempting app relaunch after update",
      level: "info",
    });
    try {
      const { relaunch } = await import("@tauri-apps/plugin-process");
      await relaunch();
    } catch (err) {
      console.error("Erro ao reiniciar o aplicativo:", err);
      Sentry.captureException(err, {
        tags: { context: "tauri_relaunch" },
      });
    }
  };

  async function checkVersion(channel: UpdateChannel, force: boolean = false) {
    const appVersion = getAppVersion();
    const dismissed = getDismissedUpdateVersion();

    if (isTauri) {
      setTauriStatus("checking");
      setTauriError("");
      try {
        const { check } = await import("@tauri-apps/plugin-updater");
        const update = await check({
          headers: {
            "X-Update-Channel": channel
          }
        });
        if (update) {
          setTauriUpdateObj(update);
          setLatestVersion(update.version);
          setChangelog(update.body || "");
          setTauriStatus("available");
          setHasAppUpdate(true);
          Sentry.captureMessage(`Tauri updater found new version: ${update.version}`, "info");
          return { success: true, hasUpdate: true };
        } else {
          setTauriStatus("no-update");
          setHasAppUpdate(false);
          return { success: true, hasUpdate: false };
        }
      } catch (err: any) {
        console.error("Error in Tauri update check:", err);
        setTauriStatus("error");
        const errStr = (err instanceof Error ? err : new Error(String(err))).toString();
        setTauriError(errStr);
        setHasAppUpdate(false);
        Sentry.captureException(err, {
          tags: { context: "tauri_check_update" },
        });
        return { success: false, hasUpdate: false };
      }
    }

    // 1. Verificar cache local de 1 hora (Para PWA)
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

    // 2. Fazer fetch na API do GitHub (Para PWA)
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
    try {
      window.localStorage.removeItem("openbible:last-update-check");
    } catch {}
    checkVersion(channel, true);
  };

  const checkForUpdates = async (force: boolean = false) => {
    const channel = getUpdateChannel();
    return checkVersion(channel, force);
  };

  // PWA dialog opens ONLY on SW updates. Tauri dialog opens on App updates.
  const hasUpdate = isTauri
    ? (hasAppUpdate && !isDismissed)
    : (hasPwaUpdate && !isDismissed);

  const updatePwa = () => {
    updateNow();
  };

  const updateApp = () => {
    if (hasPwaUpdate) {
      updateNow();
    } else if (isTauri) {
      tauriDownloadInstall();
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
        
        isTauri,
        tauriStatus,
        tauriProgress,
        tauriError,
        tauriDownloadInstall,
        tauriRelaunch,
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

