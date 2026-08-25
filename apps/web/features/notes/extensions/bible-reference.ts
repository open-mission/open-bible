import { Node } from "@tiptap/core"

// bibleReference custom node with preview via BibleDatabase and link to leitor
export const BibleReference = Node.create({
  name: "bibleReference",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      bible: { default: "ara" },
      book: { default: "gn" },
      chapter: { default: 1 },
      verseStart: { default: 1 },
      verseEnd: { default: null },
    }
  },
  parseHTML() { return [{ tag: "bible-reference" }] },
  renderHTML({ node }) {
    return ["bible-reference", { "data-bible": node.attrs.bible, "data-book": node.attrs.book }, `${node.attrs.book} ${node.attrs.chapter}:${node.attrs.verseStart}`]
  },
})

export default BibleReference
