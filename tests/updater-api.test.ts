import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { app } from "../lib/api/hono-app";

describe("Tauri Update Proxy API", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    global.fetch = originalFetch;
  });

  it("returns 204 when client version is equal or newer than latest release", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/releases/latest")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            tag_name: "v0.8.2",
            body: "Release 0.8.2 notes",
            html_url: "https://github.com/open-mission/open-bible/releases/tag/v0.8.2",
          }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    }) as any;

    const res = await app.request(
      "/api/updates/tauri?version=0.8.2&target=darwin&arch=aarch64"
    );

    expect(res.status).toBe(204);
  });

  it("returns latest.json data when update is available on stable channel", async () => {
    // Advance timers by 10 minutes to invalidate the cache from the previous test
    vi.advanceTimersByTime(10 * 60 * 1000);

    const mockManifest = {
      version: "0.8.3",
      notes: "Release 0.8.3 notes",
      pub_date: "2026-07-20T18:00:00Z",
      platforms: {
        "darwin-aarch64": {
          signature: "mock-sig",
          url: "https://github.com/open-mission/open-bible/releases/download/v0.8.3/open-bible.app.tar.gz",
        },
      },
    };

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/releases/latest")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            tag_name: "v0.8.3",
            body: "Release 0.8.3 notes",
            html_url: "https://github.com/open-mission/open-bible/releases/tag/v0.8.3",
          }),
        });
      }
      if (url.includes("/releases/download/v0.8.3/latest.json")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockManifest),
        });
      }
      return Promise.reject(new Error("Unknown URL " + url));
    }) as any;

    const res = await app.request(
      "/api/updates/tauri?version=0.8.2&target=darwin&arch=aarch64"
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.version).toBe("0.8.3");
    expect(data.platforms["darwin-aarch64"].signature).toBe("mock-sig");
  });

  it("returns latest beta/pre-release when client is on beta channel", async () => {
    // Advance timers by 10 minutes to invalidate the cache from the previous test
    vi.advanceTimersByTime(10 * 60 * 1000);

    const mockManifest = {
      version: "0.8.4-dev",
      notes: "v0.8.4-dev notes",
      pub_date: "2026-07-20T18:00:00Z",
      platforms: {
        "darwin-aarch64": {
          signature: "mock-sig-dev",
          url: "https://github.com/open-mission/open-bible/releases/download/v0.8.4-dev/open-bible.app.tar.gz",
        },
      },
    };

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.endsWith("/releases")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              tag_name: "v0.8.4-dev",
              draft: false,
              body: "v0.8.4-dev notes",
              html_url: "https://github.com/open-mission/open-bible/releases/tag/v0.8.4-dev",
            },
            {
              tag_name: "v0.8.2",
              draft: false,
              body: "v0.8.2 notes",
              html_url: "https://github.com/open-mission/open-bible/releases/tag/v0.8.2",
            },
          ]),
        });
      }
      if (url.includes("/releases/download/v0.8.4-dev/latest.json")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockManifest),
        });
      }
      return Promise.reject(new Error("Unknown URL " + url));
    }) as any;

    const res = await app.request(
      "/api/updates/tauri?version=0.8.2-dev.3&target=darwin&arch=aarch64",
      {
        headers: {
          "X-Update-Channel": "beta",
        },
      }
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.version).toBe("0.8.4-dev");
  });
});
