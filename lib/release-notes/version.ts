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
