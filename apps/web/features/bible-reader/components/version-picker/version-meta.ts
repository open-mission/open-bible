import type { VersionMeta, AvailableVersion } from "@/features/bible-reader/context/bible-version-context"

/** Tamanho aproximado (compactado) de cada versão, em MB. */
export const VERSION_SIZES: Record<string, string> = {
  acf: "4.3 MB",
  alm1911: "4.3 MB",
  ara: "4.3 MB",
  arc: "4.3 MB",
  as21: "4.2 MB",
  blivre: "4.3 MB",
  jfaa: "4.3 MB",
  kja: "4.9 MB",
  kjf: "4.5 MB",
  mens: "4.5 MB",
  naa: "4.5 MB",
  nbv: "4.8 MB",
  ntlh: "5.1 MB",
  nvi: "4.3 MB",
  nvt: "4.4 MB",
  ol: "4.5 MB",
  tb: "4.3 MB",
  vfl: "4.6 MB",
}

/** Tamanho formatado de uma versão (fallback "4.5 MB"). */
export function getVersionSize(id: string): string {
  return VERSION_SIZES[id] ?? "4.5 MB"
}

/** Filtra uma lista de versões por nome ou id (case-insensitive). query vazia -> retorna tudo. */
export function filterVersions<T extends { id: string; name: string }>(
  versions: T[],
  query: string
): T[] {
  const q = query.trim().toLowerCase()
  if (!q) return versions
  return versions.filter(
    (v) => v.name.toLowerCase().includes(q) || v.id.toLowerCase().includes(q)
  )
}

/** Versões disponíveis que ainda não estão instaladas. */
export function getNotInstalledAvailable(
  available: AvailableVersion[],
  installed: VersionMeta[]
): AvailableVersion[] {
  return available.filter((av) => !installed.some((iv) => iv.id === av.id))
}
