export function getAppVersion(): string {
  return process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";
}

export function compareSemver(a: string, b: string): number {
  const clean = (v: string) => {
    const stripped = v.startsWith("v") ? v.slice(1) : v;
    const parts = stripped.split(/[-+]/)[0].split(".");
    return parts.map((p) => parseInt(p, 10) || 0);
  };
  const partsA = clean(a);
  const partsB = clean(b);
  for (let i = 0; i < 3; i++) {
    const na = partsA[i] || 0;
    const nb = partsB[i] || 0;
    if (na !== nb) {
      return na - nb;
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


