"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  FileText,
  Highlighter,
  X,
  ChevronRight,
  ChevronLeft,
  Settings,
  Sun,
  Moon,
  Plus,
  Link2,
  Link2Off,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { BookList } from "./book-list";
import { ChapterGrid } from "./chapter-grid";
import { useNotes, useHighlights } from "@/lib/store";
import { getBook, getVerses } from "@/lib/bible-data";
import { useAppTheme } from "@/components/theme-provider";
import { BibleVersionSelector } from "./bible-version-selector";
import type { HighlightColor, Note } from "@/lib/types";

type SidebarTab = "bible" | "notes" | "highlights";
type BiblePane = "books" | "chapters";
type NotesView = "list" | "detail" | "new";

const HIGHLIGHT_HEX: Record<string, string> = {
  amber: "#f5c842",
  green: "#6aba7a",
  blue: "#6aabd2",
  rose: "#e87b8c",
};

const HIGHLIGHT_LABEL: Record<string, string> = {
  amber: "Amarelo",
  green: "Verde",
  blue: "Azul",
  rose: "Rosa",
  custom: "Personalizado",
};

function resolveHighlightHex(h: { color: string; customHex?: string }) {
  if (h.color === "custom") return h.customHex ?? "#a78bfa";
  return HIGHLIGHT_HEX[h.color] ?? "#f5c842";
}

function parseVerseId(verseId: string) {
  const match = verseId.match(/^(.+)-(\d+)-(\d+)$/);
  if (!match) return null;
  const [, bookId, chapterStr, verseStr] = match;
  const book = getBook(bookId);
  if (!book) return null;
  const chapter = parseInt(chapterStr, 10);
  const verse = parseInt(verseStr, 10);
  const verseData = getVerses(bookId, chapter).find((v) => v.verse === verse);
  return { bookId, book, chapter, verse, text: verseData?.text ?? "" };
}

interface SidebarProps {
  selectedBookId: string | null;
  selectedChapter: number | null;
  onSelectBook: (bookId: string) => void;
  onSelectChapter: (chapter: number) => void;
  isOpen: boolean;
  onClose: () => void;
  onJumpTo: (bookId: string, chapter: number) => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function Sidebar({
  selectedBookId,
  selectedChapter,
  onSelectBook,
  onSelectChapter,
  isOpen,
  onClose,
  onJumpTo,
  sidebarCollapsed,
  onToggleSidebar,
}: SidebarProps) {
  const [tab, setTab] = useState<SidebarTab>("bible");
  const [biblePane, setBiblePane] = useState<BiblePane>("books");
  const { notes, upsertNote, deleteNote } = useNotes();
  const { highlights } = useHighlights();
  const { isDark, setTheme } = useAppTheme();
  const router = useRouter();

  // Notes tab state
  const [notesView, setNotesView] = useState<NotesView>("list");
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editNoteContent, setEditNoteContent] = useState("");

  function handleSelectBook(bookId: string) {
    onSelectBook(bookId);
    setBiblePane("chapters");
  }

  function handleSelectChapter(chapter: number) {
    onSelectChapter(chapter);
    onClose();
  }

  function openNoteDetail(note: Note) {
    setActiveNoteId(note.id);
    setEditNoteContent(note.content);
    setNotesView("detail");
  }

  function openNewNote() {
    setActiveNoteId(null);
    setNewNoteContent("");
    setNotesView("new");
  }

  function handleSaveNewNote() {
    if (!newNoteContent.trim()) return;
    upsertNote(null, newNoteContent.trim(), []);
    setNotesView("list");
    setNewNoteContent("");
  }

  function handleSaveEdit() {
    if (!activeNoteId || !editNoteContent.trim()) return;
    const note = notes.find((n) => n.id === activeNoteId);
    upsertNote(activeNoteId, editNoteContent.trim(), note?.verseIds ?? []);
    setNotesView("list");
  }

  function handleDeleteNote(noteId: string) {
    deleteNote(noteId);
    setNotesView("list");
    setActiveNoteId(null);
  }

  // Resolve highlight metadata
  const highlightsWithMeta = highlights
    .map((h) => {
      const meta = parseVerseId(h.verseId);
      if (!meta) return null;
      return { highlight: h, ...meta };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        new Date(b!.highlight.createdAt).getTime() -
        new Date(a!.highlight.createdAt).getTime(),
    );

  // Resolve note metadata
  const notesWithMeta = notes
    .map((note) => {
      // Resolve first verse for display
      const firstMeta =
        note.verseIds.length > 0 ? parseVerseId(note.verseIds[0]) : null;
      return { note, firstMeta };
    })
    .sort(
      (a, b) =>
        new Date(b.note.updatedAt).getTime() -
        new Date(a.note.updatedAt).getTime(),
    );

  const activeNote = notes.find((n) => n.id === activeNoteId) ?? null;

  // -------------------------------------------------------------------------
  // Build the shared sidebar content
  // -------------------------------------------------------------------------
  const content = (
    <div className="flex h-full flex-col bg-sidebar">
      {/* ── App title header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3 shrink-0">
        <span className="font-serif text-sm font-semibold text-foreground tracking-wide">
          Open Bible
        </span>
        <div className="flex items-center gap-1">
          {/* Mobile close */}
          <button
            onClick={onClose}
            aria-label="Fechar menu"
            className="md:hidden flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          {/* Desktop collapse toggle */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              aria-label={
                sidebarCollapsed ? "Expandir sidebar" : "Recolher sidebar"
              }
              className="hidden md:flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center border-b border-sidebar-border shrink-0">
        {(["bible", "highlights", "notes"] as SidebarTab[]).map((t) => {
          const icon =
            t === "bible" ? (
              <BookOpen className="h-3.5 w-3.5" />
            ) : t === "highlights" ? (
              <Highlighter className="h-3.5 w-3.5" />
            ) : (
              <FileText className="h-3.5 w-3.5" />
            );
          const label =
            t === "bible"
              ? "Bíblia"
              : t === "highlights"
                ? "Destaques"
                : "Notas";
          const count =
            t === "highlights"
              ? highlights.length
              : t === "notes"
                ? notes.length
                : 0;
          return (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                if (t === "notes") setNotesView("list");
              }}
              aria-selected={tab === t}
              role="tab"
              className={`flex flex-1 items-center justify-center gap-1 py-4 text-xs font-medium transition-colors border-b-2 ${
                tab === t
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {icon}
              {label}
              {count > 0 && (
                <span className="rounded-full bg-accent text-accent-foreground px-1 text-[10px] font-semibold leading-tight">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {/* BIBLE tab */}
        {tab === "bible" && (
          <>
            {biblePane === "books" || !selectedBookId ? (
              <BookList
                selectedBookId={selectedBookId}
                onSelectBook={handleSelectBook}
              />
            ) : (
              <ChapterGrid
                bookId={selectedBookId}
                selectedChapter={selectedChapter}
                onSelectChapter={handleSelectChapter}
                onBack={() => setBiblePane("books")}
              />
            )}
          </>
        )}

        {/* HIGHLIGHTS tab */}
        {tab === "highlights" && (
          <div className="flex-1 overflow-y-auto">
            {highlightsWithMeta.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 px-6 py-12">
                <Highlighter className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-center text-sm text-muted-foreground leading-relaxed">
                  Nenhum destaque. Clique em um versículo para destacar.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {highlightsWithMeta.map((item) => {
                  if (!item) return null;
                  const { highlight, book, chapter, verse, text } = item;
                  const hex = resolveHighlightHex(highlight);
                  const ref = `${book.abbreviation} ${chapter}:${verse}`;
                  return (
                    <li key={highlight.id}>
                      <button
                        onClick={() => {
                          onJumpTo(book.id, chapter);
                          onClose();
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-sidebar-accent transition-colors group"
                        style={{ borderLeft: `3px solid ${hex}` }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="inline-block w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: hex }}
                            />
                            <span className="text-xs font-mono font-medium text-primary">
                              {ref}
                            </span>
                          </div>
                          <ChevronRight className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {text && (
                          <p
                            className="text-xs text-muted-foreground line-clamp-2 font-serif leading-snug"
                            style={{
                              backgroundColor: `${hex}33`,
                              borderRadius: 3,
                              padding: "2px 4px",
                            }}
                          >
                            {text}
                          </p>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {/* NOTES tab — LIST view */}
        {tab === "notes" && notesView === "list" && (
          <div className="flex flex-col flex-1 min-h-0">
            {/* New note button */}
            <div className="shrink-0 px-3 py-2 border-b border-border">
              <button
                onClick={openNewNote}
                className="w-full flex items-center justify-center gap-1.5 rounded-md border border-dashed border-border py-2 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-secondary/40 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Nova nota
              </button>
            </div>

            {notesWithMeta.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-3 px-6 py-12">
                <FileText className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-center text-sm text-muted-foreground leading-relaxed">
                  Nenhuma nota ainda. Clique em um versículo ou em &quot;Nova
                  nota&quot; para começar.
                </p>
              </div>
            ) : (
              <ul className="flex-1 overflow-y-auto divide-y divide-border">
                {notesWithMeta.map(({ note, firstMeta }) => {
                  const verseHighlight =
                    note.verseIds.length > 0
                      ? highlights.find((h) => h.verseId === note.verseIds[0])
                      : undefined;
                  const hlHex = verseHighlight
                    ? resolveHighlightHex(verseHighlight)
                    : undefined;
                  const date = new Date(note.updatedAt).toLocaleDateString(
                    "pt-BR",
                    { day: "2-digit", month: "short" },
                  );
                  return (
                    <li key={note.id}>
                      <button
                        onClick={() => openNoteDetail(note)}
                        className="w-full text-left px-4 py-3 hover:bg-sidebar-accent transition-colors group"
                        style={
                          hlHex
                            ? { borderLeft: `3px solid ${hlHex}` }
                            : undefined
                        }
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {hlHex && (
                              <span
                                className="inline-block w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: hlHex }}
                              />
                            )}
                            {firstMeta ? (
                              <span className="text-xs font-mono font-medium text-primary shrink-0">
                                {firstMeta.book.abbreviation}{" "}
                                {firstMeta.chapter}:{firstMeta.verse}
                                {note.verseIds.length > 1 && (
                                  <span className="ml-1 text-muted-foreground font-sans">
                                    +{note.verseIds.length - 1}
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">
                                Sem versículo
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground/60 shrink-0">
                            <span className="text-[10px]">{date}</span>
                            <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <p className="text-xs text-foreground line-clamp-2 leading-relaxed">
                          {note.content}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {/* NOTES tab — DETAIL view */}
        {tab === "notes" && notesView === "detail" && activeNote && (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Back + delete header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
              <button
                onClick={() => setNotesView("list")}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Notas
              </button>
              <button
                onClick={() => handleDeleteNote(activeNote.id)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Excluir
              </button>
            </div>

            {/* Linked verses */}
            {activeNote.verseIds.length > 0 && (
              <div className="shrink-0 border-b border-border px-3 py-2 space-y-1">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium flex items-center gap-1 mb-1">
                  <Link2 className="h-3 w-3" />
                  Versículos
                </p>
                {activeNote.verseIds.map((vId) => {
                  const meta = parseVerseId(vId);
                  if (!meta) return null;
                  const ref = `${meta.book.abbreviation} ${meta.chapter}:${meta.verse}`;
                  return (
                    <button
                      key={vId}
                      onClick={() => {
                        onJumpTo(meta.book.id, meta.chapter);
                        onClose();
                      }}
                      className="w-full text-left flex items-start gap-2 rounded-md bg-secondary/50 px-2.5 py-1.5 hover:bg-secondary transition-colors group"
                    >
                      <span className="font-mono text-xs text-primary shrink-0 mt-0.5">
                        {ref}
                      </span>
                      <p className="flex-1 font-serif text-xs text-muted-foreground line-clamp-2 leading-snug">
                        {meta.text}
                      </p>
                      <ChevronRight className="h-3 w-3 shrink-0 mt-0.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Editable content */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <textarea
                value={editNoteContent}
                onChange={(e) => setEditNoteContent(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "s") {
                    e.preventDefault();
                    handleSaveEdit();
                  }
                }}
                className="w-full h-full min-h-32 resize-none bg-transparent font-serif text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                spellCheck
              />
            </div>

            {/* Save footer */}
            <div className="flex justify-end border-t border-border px-4 py-2 shrink-0 gap-2">
              <span className="text-xs text-muted-foreground/50 self-center hidden sm:inline">
                Ctrl+S
              </span>
              <button
                onClick={handleSaveEdit}
                disabled={
                  !editNoteContent.trim() ||
                  editNoteContent.trim() === activeNote.content
                }
                className="rounded-md px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Salvar
              </button>
            </div>
          </div>
        )}

        {/* NOTES tab — NEW note view */}
        {tab === "notes" && notesView === "new" && (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
              <button
                onClick={() => setNotesView("list")}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Notas
              </button>
              <span className="text-xs text-muted-foreground">Nova nota</span>
            </div>

            <div className="shrink-0 border-b border-border px-3 py-2">
              <p className="text-xs text-muted-foreground/70 italic">
                Escreva sua nota. Para vincular versículos, selecione-os no
                leitor e use o botão &quot;Nota&quot;.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3">
              <textarea
                autoFocus
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "s") {
                    e.preventDefault();
                    handleSaveNewNote();
                  }
                }}
                placeholder="Escreva sua nota aqui..."
                className="w-full h-full min-h-32 resize-none bg-transparent font-serif text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                spellCheck
              />
            </div>

            <div className="flex justify-end border-t border-border px-4 py-2 shrink-0 gap-2">
              <span className="text-xs text-muted-foreground/50 self-center hidden sm:inline">
                Ctrl+S
              </span>
              <button
                onClick={handleSaveNewNote}
                disabled={!newNoteContent.trim()}
                className="rounded-md px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Salvar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="shrink-0 space-y-1 border-t border-sidebar-border px-2 py-2">
        <BibleVersionSelector />
        <div className="flex items-center justify-between">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={
              isDark ? "Mudar para tema claro" : "Mudar para tema escuro"
            }
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          >
            {isDark ? (
              <Sun className="h-3.5 w-3.5" />
            ) : (
              <Moon className="h-3.5 w-3.5" />
            )}
            {isDark ? "Claro" : "Escuro"}
          </button>
          <button
            onClick={() => {
              router.push("/config");
              onClose();
            }}
            aria-label="Preferencias"
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            Preferencias
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex shrink-0 border-r border-border h-full flex-col overflow-hidden transition-all duration-200 ${sidebarCollapsed ? "w-0 border-0 overflow-hidden" : "w-64"}`}
      >
        {content}
      </aside>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="relative z-50 w-72 h-full flex flex-col shadow-xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
