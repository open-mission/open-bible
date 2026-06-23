import type { Book, Verse } from "./types"

export const BOOKS: Book[] = [
  // Old Testament
  { id: "gen", name: "Gênesis", abbreviation: "Gn", testament: "old", chapters: 50 },
  { id: "exo", name: "Êxodo", abbreviation: "Ex", testament: "old", chapters: 40 },
  { id: "lev", name: "Levítico", abbreviation: "Lv", testament: "old", chapters: 27 },
  { id: "num", name: "Números", abbreviation: "Nm", testament: "old", chapters: 36 },
  { id: "deu", name: "Deuteronômio", abbreviation: "Dt", testament: "old", chapters: 34 },
  { id: "jos", name: "Josué", abbreviation: "Js", testament: "old", chapters: 24 },
  { id: "jdg", name: "Juízes", abbreviation: "Jz", testament: "old", chapters: 21 },
  { id: "rut", name: "Rute", abbreviation: "Rt", testament: "old", chapters: 4 },
  { id: "1sa", name: "1 Samuel", abbreviation: "1Sm", testament: "old", chapters: 31 },
  { id: "2sa", name: "2 Samuel", abbreviation: "2Sm", testament: "old", chapters: 24 },
  { id: "1ki", name: "1 Reis", abbreviation: "1Rs", testament: "old", chapters: 22 },
  { id: "2ki", name: "2 Reis", abbreviation: "2Rs", testament: "old", chapters: 25 },
  { id: "1ch", name: "1 Crônicas", abbreviation: "1Cr", testament: "old", chapters: 29 },
  { id: "2ch", name: "2 Crônicas", abbreviation: "2Cr", testament: "old", chapters: 36 },
  { id: "ezr", name: "Esdras", abbreviation: "Ed", testament: "old", chapters: 10 },
  { id: "neh", name: "Neemias", abbreviation: "Ne", testament: "old", chapters: 13 },
  { id: "est", name: "Ester", abbreviation: "Et", testament: "old", chapters: 10 },
  { id: "job", name: "Jó", abbreviation: "Jó", testament: "old", chapters: 42 },
  { id: "psa", name: "Salmos", abbreviation: "Sl", testament: "old", chapters: 150 },
  { id: "pro", name: "Provérbios", abbreviation: "Pv", testament: "old", chapters: 31 },
  { id: "ecc", name: "Eclesiastes", abbreviation: "Ec", testament: "old", chapters: 12 },
  { id: "sng", name: "Cânticos", abbreviation: "Ct", testament: "old", chapters: 8 },
  { id: "isa", name: "Isaías", abbreviation: "Is", testament: "old", chapters: 66 },
  { id: "jer", name: "Jeremias", abbreviation: "Jr", testament: "old", chapters: 52 },
  { id: "lam", name: "Lamentações", abbreviation: "Lm", testament: "old", chapters: 5 },
  { id: "ezk", name: "Ezequiel", abbreviation: "Ez", testament: "old", chapters: 48 },
  { id: "dan", name: "Daniel", abbreviation: "Dn", testament: "old", chapters: 12 },
  { id: "hos", name: "Oseias", abbreviation: "Os", testament: "old", chapters: 14 },
  { id: "jol", name: "Joel", abbreviation: "Jl", testament: "old", chapters: 3 },
  { id: "amo", name: "Amós", abbreviation: "Am", testament: "old", chapters: 9 },
  { id: "oba", name: "Obadias", abbreviation: "Ob", testament: "old", chapters: 1 },
  { id: "jon", name: "Jonas", abbreviation: "Jn", testament: "old", chapters: 4 },
  { id: "mic", name: "Miquéias", abbreviation: "Mq", testament: "old", chapters: 7 },
  { id: "nam", name: "Naum", abbreviation: "Na", testament: "old", chapters: 3 },
  { id: "hab", name: "Habacuque", abbreviation: "Hc", testament: "old", chapters: 3 },
  { id: "zep", name: "Sofonias", abbreviation: "Sf", testament: "old", chapters: 3 },
  { id: "hag", name: "Ageu", abbreviation: "Ag", testament: "old", chapters: 2 },
  { id: "zec", name: "Zacarias", abbreviation: "Zc", testament: "old", chapters: 14 },
  { id: "mal", name: "Malaquias", abbreviation: "Ml", testament: "old", chapters: 4 },

  // New Testament
  { id: "mat", name: "Mateus", abbreviation: "Mt", testament: "new", chapters: 28 },
  { id: "mrk", name: "Marcos", abbreviation: "Mc", testament: "new", chapters: 16 },
  { id: "luk", name: "Lucas", abbreviation: "Lc", testament: "new", chapters: 24 },
  { id: "jhn", name: "João", abbreviation: "Jo", testament: "new", chapters: 21 },
  { id: "act", name: "Atos", abbreviation: "At", testament: "new", chapters: 28 },
  { id: "rom", name: "Romanos", abbreviation: "Rm", testament: "new", chapters: 16 },
  { id: "1co", name: "1 Coríntios", abbreviation: "1Co", testament: "new", chapters: 16 },
  { id: "2co", name: "2 Coríntios", abbreviation: "2Co", testament: "new", chapters: 13 },
  { id: "gal", name: "Gálatas", abbreviation: "Gl", testament: "new", chapters: 6 },
  { id: "eph", name: "Efésios", abbreviation: "Ef", testament: "new", chapters: 6 },
  { id: "php", name: "Filipenses", abbreviation: "Fp", testament: "new", chapters: 4 },
  { id: "col", name: "Colossenses", abbreviation: "Cl", testament: "new", chapters: 4 },
  { id: "1th", name: "1 Tessalonicenses", abbreviation: "1Ts", testament: "new", chapters: 5 },
  { id: "2th", name: "2 Tessalonicenses", abbreviation: "2Ts", testament: "new", chapters: 3 },
  { id: "1ti", name: "1 Timóteo", abbreviation: "1Tm", testament: "new", chapters: 6 },
  { id: "2ti", name: "2 Timóteo", abbreviation: "2Tm", testament: "new", chapters: 4 },
  { id: "tit", name: "Tito", abbreviation: "Tt", testament: "new", chapters: 3 },
  { id: "phm", name: "Filemon", abbreviation: "Fm", testament: "new", chapters: 1 },
  { id: "heb", name: "Hebreus", abbreviation: "Hb", testament: "new", chapters: 13 },
  { id: "jas", name: "Tiago", abbreviation: "Tg", testament: "new", chapters: 5 },
  { id: "1pe", name: "1 Pedro", abbreviation: "1Pe", testament: "new", chapters: 5 },
  { id: "2pe", name: "2 Pedro", abbreviation: "2Pe", testament: "new", chapters: 3 },
  { id: "1jo", name: "1 João", abbreviation: "1Jo", testament: "new", chapters: 5 },
  { id: "2jo", name: "2 João", abbreviation: "2Jo", testament: "new", chapters: 1 },
  { id: "3jo", name: "3 João", abbreviation: "3Jo", testament: "new", chapters: 1 },
  { id: "jud", name: "Judas", abbreviation: "Jd", testament: "new", chapters: 1 },
  { id: "rev", name: "Apocalipse", abbreviation: "Ap", testament: "new", chapters: 22 },
]

// Mock verse data — replace with real DB content later
const GENESIS_1: Omit<Verse, "bookId">[] = [
  { id: "gen-1-1", chapter: 1, verse: 1, text: "No princípio, Deus criou os céus e a terra." },
  { id: "gen-1-2", chapter: 1, verse: 2, text: "A terra era sem forma e vazia; havia trevas sobre a face do abismo, e o Espírito de Deus se movia sobre a face das águas." },
  { id: "gen-1-3", chapter: 1, verse: 3, text: "Disse Deus: Haja luz. E houve luz." },
  { id: "gen-1-4", chapter: 1, verse: 4, text: "Deus viu que a luz era boa e a separou das trevas." },
  { id: "gen-1-5", chapter: 1, verse: 5, text: "Deus chamou a luz de dia e às trevas chamou noite. Houve tarde e manhã: o primeiro dia." },
  { id: "gen-1-6", chapter: 1, verse: 6, text: "Disse Deus: Haja um firmamento no meio das águas e que ele separe as águas das águas." },
  { id: "gen-1-7", chapter: 1, verse: 7, text: "Assim Deus fez o firmamento e separou as águas que estavam debaixo do firmamento das que estavam acima. E assim foi." },
  { id: "gen-1-8", chapter: 1, verse: 8, text: "Deus chamou o firmamento de céu. Houve tarde e manhã: o segundo dia." },
  { id: "gen-1-9", chapter: 1, verse: 9, text: "Disse Deus: Ajuntem-se as águas debaixo do céu em um lugar e apareça a parte seca. E assim foi." },
  { id: "gen-1-10", chapter: 1, verse: 10, text: "Deus chamou a parte seca de terra e ao conjunto das águas chamou mar. Deus viu que isso era bom." },
  { id: "gen-1-11", chapter: 1, verse: 11, text: "Disse Deus: Produza a terra relva, ervas que deem semente e árvores frutíferas que deem fruto segundo a sua espécie, com a semente dentro. E assim foi." },
  { id: "gen-1-12", chapter: 1, verse: 12, text: "A terra produziu relva, ervas que davam semente segundo a sua espécie e árvores que davam fruto com a semente dentro, segundo a sua espécie. E Deus viu que isso era bom." },
  { id: "gen-1-13", chapter: 1, verse: 13, text: "Houve tarde e manhã: o terceiro dia." },
  { id: "gen-1-14", chapter: 1, verse: 14, text: "Disse Deus: Haja luminares no firmamento dos céus para separar o dia da noite; sirvam de sinais para as estações, os dias e os anos;" },
  { id: "gen-1-15", chapter: 1, verse: 15, text: "e sirvam de luminares no firmamento dos céus para iluminar a terra. E assim foi." },
  { id: "gen-1-16", chapter: 1, verse: 16, text: "Deus fez os dois grandes luminares: o maior para governar o dia e o menor para governar a noite. Fez também as estrelas." },
  { id: "gen-1-17", chapter: 1, verse: 17, text: "Deus os colocou no firmamento dos céus para iluminar a terra," },
  { id: "gen-1-18", chapter: 1, verse: 18, text: "para governar o dia e a noite e para separar a luz das trevas. E Deus viu que isso era bom." },
  { id: "gen-1-19", chapter: 1, verse: 19, text: "Houve tarde e manhã: o quarto dia." },
  { id: "gen-1-20", chapter: 1, verse: 20, text: "Disse Deus: Produzam as águas abundância de seres vivos, e voem aves sobre a terra, através do firmamento dos céus." },
  { id: "gen-1-21", chapter: 1, verse: 21, text: "Deus criou os grandes animais aquáticos e todos os seres vivos que se movem, com que as águas abundam, segundo a sua espécie, e toda ave segundo a sua espécie. E Deus viu que isso era bom." },
  { id: "gen-1-22", chapter: 1, verse: 22, text: "Deus os abençoou, dizendo: Sede fecundos, multiplicai-vos e enchei as águas dos mares; e as aves se multipliquem na terra." },
  { id: "gen-1-23", chapter: 1, verse: 23, text: "Houve tarde e manhã: o quinto dia." },
  { id: "gen-1-24", chapter: 1, verse: 24, text: "Disse Deus: Produza a terra seres vivos segundo a sua espécie: animais domésticos, répteis e animais selvagens, segundo a sua espécie. E assim foi." },
  { id: "gen-1-25", chapter: 1, verse: 25, text: "Deus fez os animais selvagens segundo a sua espécie, os animais domésticos segundo a sua espécie e todos os répteis do solo segundo a sua espécie. E Deus viu que isso era bom." },
  { id: "gen-1-26", chapter: 1, verse: 26, text: "Disse Deus: Façamos o ser humano à nossa imagem e semelhança. Ele domine sobre os peixes do mar, as aves do céu, os animais domésticos, toda a terra e todos os répteis que rastejam sobre a terra." },
  { id: "gen-1-27", chapter: 1, verse: 27, text: "Deus criou o ser humano à sua imagem, à imagem de Deus o criou, homem e mulher os criou." },
  { id: "gen-1-28", chapter: 1, verse: 28, text: "Deus os abençoou e lhes disse: Sede fecundos, multiplicai-vos, enchei a terra e a dominai; dominai sobre os peixes do mar, as aves do céu e sobre todos os animais que rastejam sobre a terra." },
  { id: "gen-1-29", chapter: 1, verse: 29, text: "Disse Deus: Vejam! Dou-vos todas as ervas que produzem semente sobre a face de toda a terra, e todas as árvores que dão fruto com semente; isso será o vosso alimento." },
  { id: "gen-1-30", chapter: 1, verse: 30, text: "E a todos os animais da terra, a todas as aves do céu e a tudo o que se arrasta sobre a terra e tem em si fôlego de vida, dou como alimento toda erva verde. E assim foi." },
  { id: "gen-1-31", chapter: 1, verse: 31, text: "Deus viu tudo o que havia feito: e era muito bom. Houve tarde e manhã: o sexto dia." },
]

const PSALM_23: Omit<Verse, "bookId">[] = [
  { id: "psa-23-1", chapter: 23, verse: 1, text: "O Senhor é o meu pastor; nada me faltará." },
  { id: "psa-23-2", chapter: 23, verse: 2, text: "Ele me faz repousar em pastos verdejantes; conduz-me para junto das águas tranquilas." },
  { id: "psa-23-3", chapter: 23, verse: 3, text: "Refrigera a minha alma; guia-me pelas veredas da justiça por amor do seu nome." },
  { id: "psa-23-4", chapter: 23, verse: 4, text: "Ainda que eu ande pelo vale da sombra da morte, não temerei mal nenhum, porque tu estás comigo; o teu bordão e o teu cajado me consolam." },
  { id: "psa-23-5", chapter: 23, verse: 5, text: "Preparas uma mesa diante de mim na presença dos meus adversários; unges a minha cabeça com óleo; o meu cálice transborda." },
  { id: "psa-23-6", chapter: 23, verse: 6, text: "Bondade e misericórdia certamente me seguirão todos os dias da minha vida; e habitarei na casa do Senhor por longos dias." },
]

const JOHN_1: Omit<Verse, "bookId">[] = [
  { id: "jhn-1-1", chapter: 1, verse: 1, text: "No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus." },
  { id: "jhn-1-2", chapter: 1, verse: 2, text: "Ele estava no princípio com Deus." },
  { id: "jhn-1-3", chapter: 1, verse: 3, text: "Todas as coisas foram feitas por intermédio dele, e sem ele nada do que foi feito se fez." },
  { id: "jhn-1-4", chapter: 1, verse: 4, text: "Nele estava a vida, e a vida era a luz dos homens." },
  { id: "jhn-1-5", chapter: 1, verse: 5, text: "A luz resplandece nas trevas, e as trevas não a compreenderam." },
  { id: "jhn-1-6", chapter: 1, verse: 6, text: "Houve um homem enviado por Deus, cujo nome era João." },
  { id: "jhn-1-7", chapter: 1, verse: 7, text: "Este veio como testemunha, para dar testemunho da luz, a fim de que todos cressem por meio dele." },
  { id: "jhn-1-8", chapter: 1, verse: 8, text: "Não era ele a luz, mas veio para dar testemunho da luz." },
  { id: "jhn-1-9", chapter: 1, verse: 9, text: "Isso era a luz verdadeira, que ilumina a todo ser humano, vindo ao mundo." },
  { id: "jhn-1-10", chapter: 1, verse: 10, text: "Ele estava no mundo, e o mundo foi feito por intermédio dele, mas o mundo não o reconheceu." },
  { id: "jhn-1-11", chapter: 1, verse: 11, text: "Veio para o que era seu, e os seus não o receberam." },
  { id: "jhn-1-12", chapter: 1, verse: 12, text: "Mas a todos quantos o receberam deu-lhes o poder de se tornarem filhos de Deus, a saber, aos que creem no seu nome;" },
  { id: "jhn-1-13", chapter: 1, verse: 13, text: "os quais não nasceram do sangue, nem da vontade da carne, nem da vontade do homem, mas de Deus." },
  { id: "jhn-1-14", chapter: 1, verse: 14, text: "E o Verbo se fez carne e habitou entre nós, e vimos a sua glória, glória como do unigênito do Pai, cheio de graça e de verdade." },
  { id: "jhn-1-15", chapter: 1, verse: 15, text: "João deu testemunho dele, clamando: Este é aquele de quem eu disse: O que vem depois de mim se tornou antes de mim, porque existia antes de mim." },
  { id: "jhn-1-16", chapter: 1, verse: 16, text: "De sua plenitude todos nós recebemos, graça sobre graça." },
  { id: "jhn-1-17", chapter: 1, verse: 17, text: "Porque a lei foi dada por meio de Moisés; a graça e a verdade vieram por meio de Jesus Cristo." },
  { id: "jhn-1-18", chapter: 1, verse: 18, text: "Ninguém jamais viu a Deus; o Deus unigênito, que está no seio do Pai, esse o revelou." },
]

// Generate placeholder verses for chapters without real data
function generatePlaceholderVerses(bookId: string, chapter: number, count: number): Verse[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${bookId}-${chapter}-${i + 1}`,
    bookId,
    chapter,
    verse: i + 1,
    text: `[Versículo ${i + 1}] O conteúdo deste versículo será carregado do banco de dados da Bíblia. Por enquanto, este é um texto de espaço reservado para demonstração da navegação e layout do aplicativo.`,
  }))
}

// Verse count per chapter for placeholder generation
const CHAPTER_VERSE_COUNTS: Record<string, number[]> = {
  gen: [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 55, 32, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 33, 26],
}

export function getVerses(bookId: string, chapter: number): Verse[] {
  // Return real data for mocked chapters
  if (bookId === "gen" && chapter === 1) {
    return GENESIS_1.map((v) => ({ ...v, bookId: "gen" }))
  }
  if (bookId === "psa" && chapter === 23) {
    return PSALM_23.map((v) => ({ ...v, bookId: "psa" }))
  }
  if (bookId === "jhn" && chapter === 1) {
    return JOHN_1.map((v) => ({ ...v, bookId: "jhn" }))
  }

  // Placeholder for everything else
  const counts = CHAPTER_VERSE_COUNTS[bookId]
  const verseCount = counts ? (counts[chapter - 1] ?? 20) : 20
  return generatePlaceholderVerses(bookId, chapter, verseCount)
}

export function getBook(bookId: string): Book | undefined {
  return BOOKS.find((b) => b.id === bookId)
}

export const OLD_TESTAMENT = BOOKS.filter((b) => b.testament === "old")
export const NEW_TESTAMENT = BOOKS.filter((b) => b.testament === "new")
