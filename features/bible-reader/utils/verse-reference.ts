import type { Book, Verse } from "@/lib/types";

/**
 * Agrupa números de versículo (ordenados) em segmentos: contíguos viram
 * "start-end", avulsos viram "n". Ex.: [16, 17, 18, 20] -> ["16-18", "20"].
 */
function groupVerseNumbers(verseNumbers: number[]): string[] {
  if (verseNumbers.length === 0) return [];
  const sorted = [...verseNumbers].sort((a, b) => a - b);
  const segments: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    const n = sorted[i];
    if (n === prev + 1) {
      prev = n;
      continue;
    }
    segments.push(start === prev ? `${start}` : `${start}-${prev}`);
    start = n;
    prev = n;
  }
  segments.push(start === prev ? `${start}` : `${start}-${prev}`);
  return segments;
}

/**
 * Formata a referência: "{nome do livro} {capítulo}:{versículos} ({versão})".
 * Versículos contíguos viram intervalo ("16-18"), avulsos viram vírgula ("16, 18").
 * Ex.: "João 3:16-18, 20 (ARA)".
 */
export function formatVerseReference(
  book: Book,
  chapter: number,
  verses: Verse[],
  versionAbbr: string,
): string {
  const segments = groupVerseNumbers(verses.map((v) => v.verse));
  return `${book.name} ${chapter}:${segments.join(", ")} (${versionAbbr})`;
}

/**
 * Formata o texto copiável: referência na primeira linha + versículos numerados
 * em uma só linha, separados por espaço.
 * Ex.:
 * "João 3:16-18 (ARA)\n16 texto... 17 texto... 18 texto..."
 */
export function formatVerseText(
  book: Book,
  chapter: number,
  verses: Verse[],
  versionAbbr: string,
): string {
  const reference = formatVerseReference(book, chapter, verses, versionAbbr);
  const ordered = [...verses].sort((a, b) => a.verse - b.verse);
  const body = ordered.map((v) => `${v.verse} ${v.text}`).join("\n");
  return `${reference}\n${body}`;
}
