import { describe, it, expect } from "vitest";
import { compareSemver, isPrerelease } from "../lib/release-notes/version";

describe("isPrerelease", () => {
  it("detects pre-release versions with hyphen", () => {
    expect(isPrerelease("0.8.2-dev")).toBe(true);
    expect(isPrerelease("1.0.0-beta.1")).toBe(true);
    expect(isPrerelease("2.3.4-rc.2")).toBe(true);
  });

  it("identifies stable versions as not pre-release", () => {
    expect(isPrerelease("0.8.2")).toBe(false);
    expect(isPrerelease("1.0.0")).toBe(false);
    expect(isPrerelease("2.3.4")).toBe(false);
  });
});

describe("compareSemver", () => {
  it("compares stable versions correctly", () => {
    expect(compareSemver("1.0.0", "2.0.0")).toBeLessThan(0);
    expect(compareSemver("2.0.0", "1.0.0")).toBeGreaterThan(0);
    expect(compareSemver("1.2.3", "1.2.4")).toBeLessThan(0);
    expect(compareSemver("1.2.4", "1.2.3")).toBeGreaterThan(0);
    expect(compareSemver("1.2.3", "1.2.3")).toBe(0);
  });

  it("compares pre-release versions to stable versions correctly", () => {
    // Stable has higher precedence than pre-release
    expect(compareSemver("1.0.0-alpha", "1.0.0")).toBeLessThan(0);
    expect(compareSemver("1.0.0", "1.0.0-alpha")).toBeGreaterThan(0);
    expect(compareSemver("1.0.0-beta.2", "1.0.0")).toBeLessThan(0);
    expect(compareSemver("1.0.0", "1.0.0-beta.2")).toBeGreaterThan(0);
  });

  it("compares pre-release versions to pre-release versions correctly", () => {
    // Compare numeric identifiers
    expect(compareSemver("1.0.0-alpha.1", "1.0.0-alpha.2")).toBeLessThan(0);
    expect(compareSemver("1.0.0-alpha.2", "1.0.0-alpha.1")).toBeGreaterThan(0);

    // Compare non-numeric identifiers (lexical)
    expect(compareSemver("1.0.0-alpha", "1.0.0-beta")).toBeLessThan(0);
    expect(compareSemver("1.0.0-beta", "1.0.0-alpha")).toBeGreaterThan(0);
    expect(compareSemver("1.0.0-beta", "1.0.0-rc")).toBeLessThan(0);

    // Numeric vs non-numeric (numeric has lower precedence)
    expect(compareSemver("1.0.0-alpha.1", "1.0.0-alpha.beta")).toBeLessThan(0);
    expect(compareSemver("1.0.0-alpha.beta", "1.0.0-alpha.1")).toBeGreaterThan(0);

    // More identifiers has higher precedence
    expect(compareSemver("1.0.0-alpha", "1.0.0-alpha.1")).toBeLessThan(0);
    expect(compareSemver("1.0.0-alpha.1", "1.0.0-alpha")).toBeGreaterThan(0);
  });

  it("ignores leading v character", () => {
    expect(compareSemver("v1.0.0", "1.0.0")).toBe(0);
    expect(compareSemver("1.0.0", "v1.0.0")).toBe(0);
    expect(compareSemver("v1.0.0-alpha.1", "v1.0.0-alpha.2")).toBeLessThan(0);
  });

  it("ignores build metadata", () => {
    expect(compareSemver("1.0.0+20130313144700", "1.0.0")).toBe(0);
    expect(compareSemver("1.0.0-beta+exp.sha.5114f85", "1.0.0-beta")).toBe(0);
  });
});
