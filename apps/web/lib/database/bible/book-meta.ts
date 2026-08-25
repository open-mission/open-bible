import type { Testament } from "@/lib/types"

export interface BookMetaEntry {
  id: string
  name: string
  abbreviation: string
}

// Index = integer book id from the source SQLite (1-66). Index 0 is null.
// Copied verbatim from scripts/import-bibles.mjs BOOK_META.
export const BOOK_META: (BookMetaEntry | null)[] = [
  null,
  { id: "gen", name: "Gênesis", abbreviation: "Gn" },
  { id: "exo", name: "Êxodo", abbreviation: "Ex" },
  { id: "lev", name: "Levítico", abbreviation: "Lv" },
  { id: "num", name: "Números", abbreviation: "Nm" },
  { id: "deu", name: "Deuteronômio", abbreviation: "Dt" },
  { id: "jos", name: "Josué", abbreviation: "Js" },
  { id: "jdg", name: "Juízes", abbreviation: "Jz" },
  { id: "rut", name: "Rute", abbreviation: "Rt" },
  { id: "1sa", name: "1 Samuel", abbreviation: "1Sm" },
  { id: "2sa", name: "2 Samuel", abbreviation: "2Sm" },
  { id: "1ki", name: "1 Reis", abbreviation: "1Rs" },
  { id: "2ki", name: "2 Reis", abbreviation: "2Rs" },
  { id: "1ch", name: "1 Crônicas", abbreviation: "1Cr" },
  { id: "2ch", name: "2 Crônicas", abbreviation: "2Cr" },
  { id: "ezr", name: "Esdras", abbreviation: "Ed" },
  { id: "neh", name: "Neemias", abbreviation: "Ne" },
  { id: "est", name: "Ester", abbreviation: "Et" },
  { id: "job", name: "Jó", abbreviation: "Jó" },
  { id: "psa", name: "Salmos", abbreviation: "Sl" },
  { id: "pro", name: "Provérbios", abbreviation: "Pv" },
  { id: "ecc", name: "Eclesiastes", abbreviation: "Ec" },
  { id: "sng", name: "Cânticos", abbreviation: "Ct" },
  { id: "isa", name: "Isaías", abbreviation: "Is" },
  { id: "jer", name: "Jeremias", abbreviation: "Jr" },
  { id: "lam", name: "Lamentações", abbreviation: "Lm" },
  { id: "ezk", name: "Ezequiel", abbreviation: "Ez" },
  { id: "dan", name: "Daniel", abbreviation: "Dn" },
  { id: "hos", name: "Oseias", abbreviation: "Os" },
  { id: "jol", name: "Joel", abbreviation: "Jl" },
  { id: "amo", name: "Amós", abbreviation: "Am" },
  { id: "oba", name: "Obadias", abbreviation: "Ob" },
  { id: "jon", name: "Jonas", abbreviation: "Jn" },
  { id: "mic", name: "Miquéias", abbreviation: "Mq" },
  { id: "nam", name: "Naum", abbreviation: "Na" },
  { id: "hab", name: "Habacuque", abbreviation: "Hc" },
  { id: "zep", name: "Sofonias", abbreviation: "Sf" },
  { id: "hag", name: "Ageu", abbreviation: "Ag" },
  { id: "zec", name: "Zacarias", abbreviation: "Zc" },
  { id: "mal", name: "Malaquias", abbreviation: "Ml" },
  { id: "mat", name: "Mateus", abbreviation: "Mt" },
  { id: "mrk", name: "Marcos", abbreviation: "Mc" },
  { id: "luk", name: "Lucas", abbreviation: "Lc" },
  { id: "jhn", name: "João", abbreviation: "Jo" },
  { id: "act", name: "Atos", abbreviation: "At" },
  { id: "rom", name: "Romanos", abbreviation: "Rm" },
  { id: "1co", name: "1 Coríntios", abbreviation: "1Co" },
  { id: "2co", name: "2 Coríntios", abbreviation: "2Co" },
  { id: "gal", name: "Gálatas", abbreviation: "Gl" },
  { id: "eph", name: "Efésios", abbreviation: "Ef" },
  { id: "php", name: "Filipenses", abbreviation: "Fp" },
  { id: "col", name: "Colossenses", abbreviation: "Cl" },
  { id: "1th", name: "1 Tessalonicenses", abbreviation: "1Ts" },
  { id: "2th", name: "2 Tessalonicenses", abbreviation: "2Ts" },
  { id: "1ti", name: "1 Timóteo", abbreviation: "1Tm" },
  { id: "2ti", name: "2 Timóteo", abbreviation: "2Tm" },
  { id: "tit", name: "Tito", abbreviation: "Tt" },
  { id: "phm", name: "Filemon", abbreviation: "Fm" },
  { id: "heb", name: "Hebreus", abbreviation: "Hb" },
  { id: "jas", name: "Tiago", abbreviation: "Tg" },
  { id: "1pe", name: "1 Pedro", abbreviation: "1Pe" },
  { id: "2pe", name: "2 Pedro", abbreviation: "2Pe" },
  { id: "1jo", name: "1 João", abbreviation: "1Jo" },
  { id: "2jo", name: "2 João", abbreviation: "2Jo" },
  { id: "3jo", name: "3 João", abbreviation: "3Jo" },
  { id: "jud", name: "Judas", abbreviation: "Jd" },
  { id: "rev", name: "Apocalipse", abbreviation: "Ap" },
]

// Reverse map: string id → integer id.
export const BOOK_ID_TO_INT: Record<string, number> = (() => {
  const m: Record<string, number> = {}
  BOOK_META.forEach((b, i) => { if (b) m[b.id] = i })
  return m
})()

// Protestant 66-book canon: ids 1-39 are Old Testament, 40-66 New Testament.
export function testamentForBookInt(bookInt: number): Testament {
  return bookInt <= 39 ? "old" : "new"
}
