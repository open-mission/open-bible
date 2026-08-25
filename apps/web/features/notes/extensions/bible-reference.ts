import { Node } from "@tiptap/core"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { BibleReferenceView } from "../components/bible-reference-view"

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
  parseHTML() {
    return [{ tag: "bible-reference" }]
  },
  renderHTML({ node }) {
    return [
      "bible-reference",
      {
        "data-bible": node.attrs.bible,
        "data-book": node.attrs.book,
        "data-chapter": node.attrs.chapter,
        "data-verse-start": node.attrs.verseStart,
        "data-verse-end": node.attrs.verseEnd ?? "",
      },
    ]
  },
  addNodeView() {
    return ReactNodeViewRenderer(BibleReferenceView)
  },
})

export default BibleReference
