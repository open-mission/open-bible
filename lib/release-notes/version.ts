export function getAppVersion(): string {
  return process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";
}

export type UpdateChannel = "stable" | "beta";

export function isPrerelease(version: string): boolean {
  return version.includes("-");
}

export function getUpdateChannel(): UpdateChannel {
  if (typeof window === "undefined") {
    return "stable";
  }
  try {
    const stored = window.localStorage.getItem("openbible:update-channel");
    if (stored === "stable" || stored === "beta") {
      return stored;
    }
  } catch (error) {
    console.error("Error reading update-channel from localStorage:", error);
  }
  // Default to beta if the app version itself is a pre-release
  return isPrerelease(getAppVersion()) ? "beta" : "stable";
}

export function setUpdateChannel(channel: UpdateChannel): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem("openbible:update-channel", channel);
  } catch (error) {
    console.error("Error setting update-channel in localStorage:", error);
  }
}

export function compareSemver(a: string, b: string): number {
  const cleanVersion = (v: string) => {
    const s = v.startsWith("v") ? v.slice(1) : v;
    const [withoutBuild] = s.split("+");
    const parts = withoutBuild.split("-");
    const core = parts[0].split(".").map((x) => parseInt(x, 10) || 0);
    const prerelease = parts[1] ? parts[1].split(".") : null;
    return { core, prerelease };
  };

  const va = cleanVersion(a);
  const vb = cleanVersion(b);

  for (let i = 0; i < 3; i++) {
    const na = va.core[i] ?? 0;
    const nb = vb.core[i] ?? 0;
    if (na !== nb) {
      return na - nb;
    }
  }

  // Pre-release version has lower precedence than a normal version
  if (va.prerelease && !vb.prerelease) {
    return -1;
  }
  if (!va.prerelease && vb.prerelease) {
    return 1;
  }
  if (!va.prerelease && !vb.prerelease) {
    return 0;
  }

  // Both are pre-releases
  const pA = va.prerelease!;
  const pB = vb.prerelease!;
  const len = Math.max(pA.length, pB.length);

  for (let i = 0; i < len; i++) {
    const idA = pA[i];
    const idB = pB[i];

    if (idA === undefined) return -1;
    if (idB === undefined) return 1;

    const isNumA = /^\d+$/.test(idA);
    const isNumB = /^\d+$/.test(idB);

    if (isNumA && isNumB) {
      const numA = parseInt(idA, 10);
      const numB = parseInt(idB, 10);
      if (numA !== numB) {
        return numA - numB;
      }
    } else if (!isNumA && !isNumB) {
      if (idA !== idB) {
        return idA < idB ? -1 : 1;
      }
    } else {
      // Numeric identifiers have lower precedence than non-numeric
      return isNumA ? -1 : 1;
    }
  }

  return 0;
}

const STORAGE_KEY = "openbible:last-seen-version";

export function getLastSeenVersion(): string {
  if (typeof window === "undefined") {
    return "0.0.0";
  }
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "0.0.0";
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    return "0.0.0";
  }
}

export function setLastSeenVersion(v: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, v);
  } catch (error) {
    console.error("Error setting localStorage:", error);
  }
}

const PWA_UPDATED_KEY = "openbible:pwa-updated";
const PWA_DISMISSED_KEY = "openbible:pwa-dismissed-version";

export function getPwaUpdatedVersion(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(PWA_UPDATED_KEY);
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    return null;
  }
}

export function setPwaUpdatedVersion(v: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(PWA_UPDATED_KEY, v);
  } catch (error) {
    console.error("Error setting localStorage:", error);
  }
}

export function getPwaDismissedVersion(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(PWA_DISMISSED_KEY);
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    return null;
  }
}

export function setPwaDismissedVersion(v: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(PWA_DISMISSED_KEY, v);
  } catch (error) {
    console.error("Error setting localStorage:", error);
  }
}

const UPDATE_DISMISSED_KEY = "openbible:dismissed-update-version";
const UPDATE_CHECK_CACHE_KEY = "openbible:last-update-check";

export function getDismissedUpdateVersion(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(UPDATE_DISMISSED_KEY);
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    return null;
  }
}

export function setDismissedUpdateVersion(v: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(UPDATE_DISMISSED_KEY, v);
  } catch (error) {
    console.error("Error setting localStorage:", error);
  }
}

export interface UpdateCheckCache {
  timestamp: number;
  version: string;
  changelog: string;
  url: string;
}

export function getUpdateCheckCache(): UpdateCheckCache | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const data = window.localStorage.getItem(UPDATE_CHECK_CACHE_KEY);
    if (!data) {
      return null;
    }
    return JSON.parse(data) as UpdateCheckCache;
  } catch (error) {
    console.error("Error reading update cache:", error);
    return null;
  }
}

export function setUpdateCheckCache(cache: UpdateCheckCache): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(UPDATE_CHECK_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error("Error setting update cache:", error);
  }
}


