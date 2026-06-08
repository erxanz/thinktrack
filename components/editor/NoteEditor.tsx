/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Editor from "@monaco-editor/react";
import { useRouter } from "next/navigation";
import MarkdownPreview from "@/components/notes/MarkdownPreview";

import {
  FiSave,
  FiEye,
  FiEdit2,
  FiList,
  FiLink,
  FiCode,
  FiType,
  FiHash,
  FiMessageSquare,
  FiLayout,
  FiFileText,
  FiStar,
  FiDownload, // Tambahan Ikon Download
  FiLoader, // Tambahan Ikon Loading
} from "react-icons/fi";

import { toast } from "react-hot-toast";

import AIAssistant from "./AIAssistant";

interface NoteEditorProps {
  noteId: string;
  initialTitle: string;
  initialContent: string;
  editorMode: "text";
  initialPinned: boolean;
  initialStatus: "draft" | "active" | "archived";
  initialTags: string[];
  onToggleEditorMode: (nextMode: "text" | "notion") => void;
}

const SUPPORTED_LANGUAGES = [
  { id: "markdown", name: "Markdown" },
  { id: "javascript", name: "JavaScript" },
  { id: "typescript", name: "TypeScript" },
  { id: "python", name: "Python" },
  { id: "go", name: "Go" },
  { id: "php", name: "PHP" },
  { id: "bash", name: "Bash" },
  { id: "json", name: "JSON" },
  { id: "sql", name: "SQL" },
];

export default function NoteEditor({
  noteId,
  initialTitle,
  initialContent,
  initialPinned,
  initialStatus,
  initialTags,
  onToggleEditorMode,
}: NoteEditorProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // State untuk proses unduh PDF
  const [language, setLanguage] = useState("markdown");
  const [isPreview, setIsPreview] = useState(false);
  const [pinned, setPinned] = useState<boolean>(initialPinned);
  const [status, setStatus] = useState<"draft" | "active" | "archived">(
    initialStatus,
  );
  const [tagsInput, setTagsInput] = useState<string>(initialTags.join(", "));

  useEffect(() => {
    // Keep local state in sync when server-provided initial fields change.
    setPinned((prev) => (prev !== initialPinned ? initialPinned : prev));
    setStatus((prev) => (prev !== initialStatus ? initialStatus : prev));
    setTagsInput((prev) => {
      const next = initialTags.join(", ");
      return prev !== next ? next : prev;
    });
  }, [initialPinned, initialStatus, initialTags]);

  const putNoteFields = async (payload: Record<string, unknown>) => {
    const res = await fetch(`/api/notes/${noteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || `Error: ${res.status} ${res.statusText}`);
    }

    router.refresh();
  };

  const handleTogglePinned = async () => {
    const nextPinned = !pinned;
    setPinned(nextPinned);
    try {
      await putNoteFields({ pinned: nextPinned });
      toast.success(nextPinned ? "Pinned" : "Unpinned");
    } catch {
      setPinned(!nextPinned);
      toast.error("Gagal mengubah pinned");
    }
  };

  const handleSetStatus = async (
    nextStatus: "draft" | "active" | "archived",
  ) => {
    setStatus(nextStatus);
    try {
      await putNoteFields({ status: nextStatus });
      toast.success("Status diperbarui");
    } catch {
      setStatus(status);
      toast.error("Gagal mengubah status");
    }
  };

  const handleApplyTags = async () => {
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await putNoteFields({ tags });
      toast.success("Tags diperbarui");
    } catch {
      toast.error("Gagal mengubah tags");
    }
  };

  // =============== FUNGSI PARSER MARKDOWN UNTUK PDF ===============
  const parseMarkdownToPdfMake = (text: string) => {
    const lines = text.split("\n");
    const contentStructure: any[] = [];
    let isCodeBlock = false;
    let codeContent = "";

    lines.forEach((line) => {
      // Handle Code Block
      if (line.startsWith("```")) {
        if (!isCodeBlock) {
          isCodeBlock = true;
          codeContent = "";
        } else {
          isCodeBlock = false;
          contentStructure.push({
            table: {
              widths: ["*"],
              body: [[{ text: codeContent.trim(), style: "codeBlock" }]],
            },
            layout: "noBorders",
            margin: [0, 5, 0, 10],
          });
        }
        return;
      }

      if (isCodeBlock) {
        codeContent += line + "\n";
        return;
      }

      // Handle Headings
      if (line.startsWith("# ")) {
        contentStructure.push({ text: line.replace("# ", ""), style: "h1", margin: [0, 10, 0, 5] });
      } else if (line.startsWith("## ")) {
        contentStructure.push({ text: line.replace("## ", ""), style: "h2", margin: [0, 8, 0, 4] });
      } else if (line.startsWith("### ")) {
        contentStructure.push({ text: line.replace("### ", ""), style: "h3", margin: [0, 6, 0, 3] });
      } 
      // Handle Lists
      else if (line.startsWith("- ") || line.startsWith("* ")) {
        contentStructure.push({ ul: [line.substring(2)], style: "body", margin: [10, 0, 0, 2] });
      }
      // Handle Quotes
      else if (line.startsWith("> ")) {
        contentStructure.push({ text: line.replace("> ", ""), style: "quote", margin: [15, 5, 0, 5] });
      }
      // Normal Text
      else if (line.trim() !== "") {
        // Simple bold/italic removal for clean text
        const cleanText = line.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1");
        contentStructure.push({ text: cleanText, style: "body", margin: [0, 0, 0, 5] });
      }
    });

    return contentStructure;
  };

  // =============== FUNGSI DOWNLOAD PDF ===============
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    const toastId = toast.loading("Membangun PDF...");

    try {
      const pdfMakeModule = (await import("pdfmake/build/pdfmake")).default;
      const pdfMake: any = pdfMakeModule;
      const pdfFonts: any = (await import("pdfmake/build/vfs_fonts")).default;

      pdfMake.vfs = pdfFonts?.pdfMake?.vfs || pdfFonts?.vfs || pdfFonts;

      const dynamicContent = parseMarkdownToPdfMake(content);

      const docDefinition: any = {
        pageSize: "A4",
        pageMargins: [45, 60, 45, 60],
        content: [
          { text: title || "Untitled Note", style: "docTitle" },
          { canvas: [{ type: "line", x1: 0, y1: 8, x2: 505, y2: 8, lineWidth: 1, lineColor: "#e5e7eb" }] },
          { text: "\n" },
          ...dynamicContent,
        ],
        styles: {
          docTitle: { fontSize: 24, bold: true, color: "#000000" },
          h1: { fontSize: 18, bold: true, color: "#111827" },
          h2: { fontSize: 16, bold: true, color: "#1f2937" },
          h3: { fontSize: 14, bold: true, color: "#374151" },
          body: { fontSize: 11, lineHeight: 1.5, color: "#1f2937" },
          quote: { fontSize: 11, italic: true, color: "#4b5563" },
          codeBlock: { fontSize: 10, color: "#1f2937", fillColor: "#f3f4f6", margin: [8, 8, 8, 8] },
        },
      };

      pdfMake.createPdf(docDefinition).download(`${title || "Note"}.pdf`);
      toast.success("PDF berhasil diunduh!", { id: toastId });
    } catch (error: any) {
      console.error(error);
      toast.error("Gagal mengunduh PDF", { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  // =============== LOGIKA EDITOR LAINNYA ===============
  const editorRef = useRef<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const editorOptions = useMemo(
    () => ({
      minimap: { enabled: false },
      fontSize: 15,
      wordWrap: "on" as const,
      lineHeight: 24,
      padding: { top: 18, bottom: 18 },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: "smooth" as const,
      roundedSelection: true,
      automaticLayout: true,
      renderLineHighlight: "all" as const,
      fontFamily: "'JetBrains Mono', monospace",
      fontLigatures: true,
    }),
    [],
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const updateTouchDevice = () => {
      setIsTouchDevice(coarsePointer.matches || window.innerWidth < 768);
    };
    updateTouchDevice();
    coarsePointer.addEventListener("change", updateTouchDevice);
    return () => coarsePointer.removeEventListener("change", updateTouchDevice);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);

    const res = await fetch(`/api/notes/${noteId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        content,
        editorMode: "text",
      }),
    });

    setIsSaving(false);

    if (res.ok) {
      toast.success("Catatan disimpan!");
      router.refresh();
    } else {
      toast.error("Gagal menyimpan");
    }
  }, [title, content, noteId, router]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener("keydown", down);

    return () => document.removeEventListener("keydown", down);
  }, [handleSave]);

  const handleEditorMount = useCallback((editor: any) => {
    editorRef.current = editor;
  }, []);

  const handleEditorChange = useCallback((value: string | undefined) => {
    setContent(value || "");
  }, []);

  const useSimpleEditor = isMobile || isTouchDevice;

  const insertAtCursor = (text: string, moveCursorLines = 0) => {
    const ed = editorRef.current;

    if (!ed) {
      setContent((c) => c + text);
      return;
    }

    const selection = ed.getSelection();

    ed.executeEdits("my-source", [
      {
        range: selection,
        text,
        forceMoveMarkers: true,
      },
    ]);

    if (moveCursorLines !== 0) {
      const pos = ed.getPosition();

      ed.setPosition({
        lineNumber: pos.lineNumber - moveCursorLines,
        column: 1,
      });
    }

    ed.focus();
  };

  const insertBlock = (type: string) => {
    switch (type) {
      case "h1":
        insertAtCursor("# ");
        break;
      case "h2":
        insertAtCursor("## ");
        break;
      case "code": {
        const lang = language === "markdown" ? "" : language;
        const block = `\n\`\`\`${lang}\n\n\`\`\`\n`;
        insertAtCursor(block, 2);
        break;
      }
      case "inline-code":
        insertAtCursor("`code`");
        break;
      case "ul":
        insertAtCursor("- ");
        break;
      case "quote":
        insertAtCursor("> ");
        break;
      default:
        break;
    }
  };

  const handleAIInsertText = (text: string) => {
    insertAtCursor("\n" + text);
    toast.success("Teks dari AI ditambahkan!");
  };

  const handleAIReplaceText = (text: string) => {
    setContent(text);
    toast.success("Teks diganti dengan hasil dari AI!");
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#0E0E0E] font-sans text-zinc-300 selection:bg-blue-500/30">
      {/* VS CODE TAB BAR (Modernized) */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/5 bg-[#141414]/95 px-2 backdrop-blur-md">
        {/* LEFT: File Tab */}
        <div className="flex h-full items-center">
          <div className="group relative flex h-full max-w-50 items-center gap-2 border-b-2 border-blue-500 bg-[#141414] px-4 sm:max-w-75">
            <FiFileText size={14} className="shrink-0 text-blue-400" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave}
              placeholder="Untitled.md"
              className="w-full truncate bg-transparent text-[13px] font-medium text-zinc-200 outline-none placeholder:text-zinc-600"
            />
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className="custom-scrollbar flex items-center gap-1.5 overflow-x-auto px-2 sm:gap-2">
          {/* Pinned toggle */}
          <button
            type="button"
            onClick={handleTogglePinned}
            title={pinned ? "Unpin" : "Pin"}
            className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition-colors whitespace-nowrap ${
              pinned
                ? "bg-amber-500/10 text-amber-400"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            }`}>
            <FiStar
              size={13}
              className={
                pinned ? "fill-amber-400 text-amber-400" : "text-zinc-500"
              }
            />
            {!isMobile && (pinned ? "Pinned" : "Pin")}
          </button>

          {/* Status dropdown */}
          <select
            value={status}
            onChange={(e) =>
              handleSetStatus(e.target.value as "draft" | "active" | "archived")
            }
            className="hidden h-8 cursor-pointer rounded-md border border-transparent bg-white/5 px-2 text-[11px] font-medium text-zinc-300 outline-none transition-colors hover:bg-white/10 focus:border-white/10 sm:block">
            <option value="draft" className="bg-[#1e1e1e]">
              Draft
            </option>
            <option value="active" className="bg-[#1e1e1e]">
              Active
            </option>
            <option value="archived" className="bg-[#1e1e1e]">
              Archived
            </option>
          </select>

          {/* Tags input */}
          <div className="hidden items-center gap-1.5 pl-1 lg:flex border-l border-white/5 ml-1">
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="tags (comma)"
              className="h-8 w-48 rounded-md bg-white/5 px-2.5 text-[11px] text-zinc-200 placeholder-zinc-600 outline-none transition-colors focus:bg-white/10"
            />
            <button
              type="button"
              onClick={handleApplyTags}
              className="flex h-8 items-center rounded-md bg-white/5 px-3 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/10 whitespace-nowrap">
              Apply
            </button>
          </div>

          {/* Separator */}
          <div className="mx-1 hidden h-4 w-px bg-white/10 lg:block" />

          {/* Editor/Preview Toggles */}
          {language === "markdown" && (
            <button
              onClick={() => setIsPreview(!isPreview)}
              className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition-colors ${
                isPreview
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
              }`}>
              {isPreview ? (
                <>
                  <FiEdit2 size={13} />
                  {!isMobile && "Edit"}
                </>
              ) : (
                <>
                  <FiEye size={13} />
                  {!isMobile && "Preview"}
                </>
              )}
            </button>
          )}

          {/* Tombol PDF Download */}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200 whitespace-nowrap disabled:opacity-50"
            title="Download PDF">
            {isDownloading ? (
              <FiLoader className="animate-spin text-blue-400" size={13} />
            ) : (
              <FiDownload size={13} />
            )}
            {!isMobile && (isDownloading ? "..." : "PDF")}
          </button>

          <button
            onClick={() => onToggleEditorMode("notion")}
            className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200 whitespace-nowrap">
            <FiLayout size={13} />
            {!isMobile && "Notion Block"}
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex h-8 items-center gap-1.5 rounded-md bg-[#007acc] px-3 text-[11px] font-medium text-white shadow-sm transition-colors hover:bg-[#0098ff] disabled:opacity-50 whitespace-nowrap ml-1">
            <FiSave size={13} />
            {!isMobile && (isSaving ? "Saving..." : "Save")}
          </button>
        </div>
      </header>

      {/* EDITOR AREA */}
      <div className="relative flex-1 overflow-hidden bg-[#0E0E0E]">
        {isPreview && language === "markdown" ? (
          /* PREVIEW MODE (Notion Canvas Style) */
          <div className="custom-scrollbar h-full overflow-y-auto bg-[#141414]">
            <div className="mx-auto w-full max-w-4xl px-6 py-10 sm:px-12 lg:py-14">
              {/* <div className="mb-10 border-b border-white/5 pb-8">
                <h1 className="text-4xl font-bold tracking-tight text-zinc-100 sm:text-5xl">
                  {title || "Untitled"}
                </h1>
                <p className="mt-5 flex items-center gap-2 text-xs text-zinc-500">
                  <FiEye size={14} /> Markdown Preview
                </p>
              </div> */}

              <div className="prose prose-zinc prose-invert max-w-none prose-headings:scroll-mt-24 prose-h1:font-bold prose-h2:border-b prose-h2:border-white/5 prose-h2:pb-2 prose-h2:font-semibold prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-blockquote:border-l-4 prose-blockquote:border-white/20 prose-blockquote:bg-white/[0.02] prose-blockquote:py-1 prose-blockquote:pl-4 prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-zinc-400 prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border prose-pre:border-white/10 prose-pre:bg-[#0E0E0E] prose-code:rounded-md prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-normal prose-code:text-sky-300 prose-code:before:content-none prose-code:after:content-none prose-hr:border-white/10">
                <MarkdownPreview content={content} />
              </div>
            </div>
          </div>
        ) : useSimpleEditor ? (
          /* SIMPLE TEXTAREA (Mobile/Touch) */
          <div className="flex h-full flex-col bg-[#0E0E0E] p-4 sm:p-6">
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              onBlur={handleSave}
              className="custom-scrollbar h-full w-full resize-none rounded-xl border border-white/5 bg-[#141414] p-5 font-mono text-[14px] leading-relaxed text-zinc-300 outline-none transition-colors placeholder:text-zinc-600 focus:border-white/10 focus:bg-[#1a1a1a]"
              placeholder="Ketik catatan Markdown di sini..."
              spellCheck={false}
            />
          </div>
        ) : (
          /* MONACO EDITOR (Desktop) */
          <div className="h-full pt-2">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language}
              value={content}
              onChange={handleEditorChange}
              onMount={handleEditorMount}
              options={editorOptions}
            />
          </div>
        )}
      </div>

      {/* VS CODE STATUS BAR */}
      <footer className="flex h-6 shrink-0 items-center justify-between bg-[#007acc] px-3 text-[11px] text-white">
        {/* LEFT: Formatting Tools */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => insertBlock("h1")}
            className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-white/20"
            title="Heading 1">
            <FiHash size={12} />
          </button>
          <button
            onClick={() => insertBlock("h2")}
            className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-white/20"
            title="Heading 2">
            <FiType size={12} />
          </button>
          <button
            onClick={() => insertBlock("code")}
            className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-white/20"
            title="Code Block">
            <FiCode size={12} />
          </button>
          <button
            onClick={() => insertBlock("inline-code")}
            className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-white/20"
            title="Inline Code">
            <FiLink size={12} />
          </button>
          <button
            onClick={() => insertBlock("ul")}
            className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-white/20"
            title="List">
            <FiList size={12} />
          </button>
          <button
            onClick={() => insertBlock("quote")}
            className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-white/20"
            title="Quote">
            <FiMessageSquare size={12} />
          </button>
        </div>

        {/* RIGHT: Metadata & AI */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center border-l border-white/20 pl-2">
            <AIAssistant
              currentText={content}
              onInsertText={handleAIInsertText}
              onReplaceText={handleAIReplaceText}
            />
          </div>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="hidden cursor-pointer bg-transparent text-[10px] text-white outline-none hover:bg-white/20 sm:block rounded px-1 py-0.5">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option
                key={lang.id}
                value={lang.id}
                className="bg-[#1e1e1e] text-white">
                {lang.name}
              </option>
            ))}
          </select>

          <span className="shrink-0 cursor-default px-1 text-[10px]">
            {isSaving ? "Saving..." : "Saved"}
          </span>

          <span className="hidden cursor-default rounded px-1.5 py-0.5 text-[10px] transition hover:bg-white/20 sm:inline">
            UTF-8
          </span>
        </div>
      </footer>
    </div>
  );
}
