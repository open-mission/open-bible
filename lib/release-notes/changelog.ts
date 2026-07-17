// @ts-expect-error - next raw query import
import changelogSrc from "@/CHANGELOG.md?raw";
import { getAppVersion } from "./version";

export interface ChangelogEntry {
  version: string;
  date: string;
  sections: {
    Added?: string[];
    Changed?: string[];
    Fixed?: string[];
    [key: string]: string[] | undefined;
  };
}

export function parseLatestEntry(src: string): ChangelogEntry {
  const defaultEntry: ChangelogEntry = {
    version: getAppVersion(),
    date: "",
    sections: {},
  };

  if (!src) {
    return defaultEntry;
  }

  const lines = src.split(/\r?\n/);
  let latestHeaderIndex = -1;
  let nextHeaderIndex = -1;
  let version = "";
  let date = "";

  const headerRegex = /^##\s+\[?(\d+\.\d+\.\d+)\]?\s*-\s*(\d{4}-\d{2}-\d{2})/;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(headerRegex);
    if (match) {
      if (latestHeaderIndex === -1) {
        latestHeaderIndex = i;
        version = match[1];
        date = match[2];
      } else {
        nextHeaderIndex = i;
        break;
      }
    }
  }

  if (latestHeaderIndex === -1) {
    return defaultEntry;
  }

  const endLine = nextHeaderIndex !== -1 ? nextHeaderIndex : lines.length;
  const entryLines = lines.slice(latestHeaderIndex + 1, endLine);

  const sections: Record<string, string[]> = {};
  let currentSection = "";

  const sectionRegex = /^###\s+(\w+)/;

  for (const line of entryLines) {
    const secMatch = line.match(sectionRegex);
    if (secMatch) {
      currentSection = secMatch[1];
      sections[currentSection] = [];
      continue;
    }

    if (currentSection) {
      const trimmed = line.trim();
      if (trimmed.startsWith("-")) {
        const bulletText = trimmed.replace(/^-\s*/, "");
        sections[currentSection].push(bulletText);
      } else if (trimmed && sections[currentSection].length > 0) {
        const lastIdx = sections[currentSection].length - 1;
        sections[currentSection][lastIdx] += " " + trimmed;
      }
    }
  }

  return {
    version,
    date,
    sections,
  };
}

export function summarizeLatest(src: string): string[] {
  const entry = parseLatestEntry(src);
  const summary: string[] = [];

  const order = ["Added", "Changed", "Fixed"];
  const labelMap: Record<string, string> = {
    Added: "Adicionado",
    Changed: "Alterado",
    Fixed: "Corrigido",
  };

  for (const sec of order) {
    const list = entry.sections[sec];
    if (list && list.length > 0) {
      const label = labelMap[sec] || sec;
      for (const item of list) {
        summary.push(`${label}: ${item}`);
      }
    }
  }

  if (summary.length === 0) {
    for (const [sec, list] of Object.entries(entry.sections)) {
      if (order.includes(sec)) continue;
      if (list && list.length > 0) {
        for (const item of list) {
          summary.push(`${sec}: ${item}`);
        }
      }
    }
  }

  return summary;
}

export { changelogSrc };
