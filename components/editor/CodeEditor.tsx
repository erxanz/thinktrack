"use client";

import Editor from "@monaco-editor/react";
import { useState, useEffect, useMemo } from "react";
import { FiCode, FiLoader } from "react-icons/fi";

interface CodeEditorProps {
  initialValue: string;
  onChange: (value: string | undefined) => void;
  language?: string;
}

export default function CodeEditor({
  initialValue,
  onChange,
  language = "markdown",
}: CodeEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const editorOptions = useMemo(
    () => ({
      minimap: {
        enabled: false,
      },
      fontSize: 14,
      wordWrap: "on" as const,
      lineHeight: 24,
      padding: {
        top: 16,
        bottom: 16,
      },
      smoothScrolling: true,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      cursorBlinking: "smooth" as const,
      roundedSelection: true,
      renderLineHighlight: "all" as const,
      fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
      fontLigatures: true,
    }),
    [],
  );

  useEffect(() => {
    const loadMonaco = async () => {
      await import("@monaco-editor/react");
    };

    loadMonaco().then(() => setMounted(true));
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

  if (!mounted) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-[#0E0E0E] shadow-2xl sm:h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-xl bg-white/5 text-zinc-500">
            <FiCode size={24} />
          </div>
          <div className="flex items-center gap-2 text-[13px] font-medium text-zinc-500">
            <FiLoader className="animate-spin" size={14} />
            Loading workspace...
          </div>
        </div>
      </div>
    );
  }

  if (isTouchDevice) {
    return (
      <div className="flex flex-col overflow-hidden rounded-xl border border-white/5 bg-[#0E0E0E] shadow-2xl font-sans">
        {/* MOBILE HEADER */}
        <header className="flex h-11 shrink-0 items-center justify-between border-b border-white/5 bg-[#141414]/95 px-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 opacity-80">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
            </div>
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400">
              <FiCode size={14} />
              <span className="capitalize">{language}</span>
            </div>
          </div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Mobile Editor
          </div>
        </header>

        {/* MOBILE TEXTAREA */}
        <div className="h-[50vh] w-full bg-[#0E0E0E] p-3 sm:h-[70vh] sm:p-4">
          <textarea
            value={initialValue}
            onChange={(event) => onChange(event.target.value)}
            className="custom-scrollbar h-full w-full resize-none rounded-lg border border-white/5 bg-[#141414] p-4 font-mono text-[13px] leading-relaxed text-zinc-300 outline-none transition-colors placeholder:text-zinc-600 focus:border-white/10 focus:bg-white/2"
            placeholder={`Tulis kode ${language} di sini...`}
            spellCheck={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-white/5 bg-[#0E0E0E] shadow-2xl font-sans">
      {/* DESKTOP HEADER (Mac Style Minimalist) */}
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-white/5 bg-[#141414]/95 px-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {/* Mac Window Controls */}
          <div className="flex items-center gap-1.5 opacity-80 transition-opacity hover:opacity-100">
            <div className="h-3 w-3 rounded-full bg-red-500/90 shadow-sm" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/90 shadow-sm" />
            <div className="h-3 w-3 rounded-full bg-green-500/90 shadow-sm" />
          </div>

          {/* Language / File Info */}
          <div className="flex items-center gap-2 border-l border-white/10 pl-4 text-[12px] font-medium text-zinc-400">
            <FiCode size={14} className="text-blue-400" />
            <span className="capitalize">{language} snippet</span>
          </div>
        </div>

        {/* Status Info */}
        <div className="hidden items-center gap-3 text-[11px] font-medium text-zinc-500 sm:flex">
          <span>Monaco Editor</span>
          <span className="h-1 w-1 rounded-full bg-zinc-700"></span>
          <span>UTF-8</span>
        </div>
      </header>

      {/* EDITOR AREA */}
      <div className="h-[50vh] w-full bg-[#0E0E0E] pt-2 sm:h-[70vh]">
        <Editor
          height="100%"
          defaultLanguage={language}
          theme="vs-dark"
          value={initialValue}
          onChange={onChange}
          options={editorOptions}
        />
      </div>

      {/* VS CODE STATUS BAR (Modernized) */}
      <footer className="flex h-6 shrink-0 items-center justify-between bg-[#007acc] px-3 text-[10px] text-white">
        <div className="flex items-center gap-3">
          <span className="flex cursor-default items-center gap-1 rounded px-1.5 py-0.5 capitalize transition-colors hover:bg-white/20">
            <FiCode size={10} />
            {language}
          </span>
          <span className="cursor-default rounded px-1.5 py-0.5 transition-colors hover:bg-white/20">
            VS Dark
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="cursor-default rounded px-1.5 py-0.5 transition-colors hover:bg-white/20">
            UTF-8
          </span>
          <span className="cursor-default rounded px-1.5 py-0.5 transition-colors hover:bg-white/20">
            Ln 1, Col 1
          </span>
        </div>
      </footer>
    </div>
  );
}
