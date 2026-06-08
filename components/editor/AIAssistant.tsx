/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/immutability */
"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FiX,
  FiPlus,
  FiFileText,
  FiEdit3,
  FiTarget,
  FiLoader,
  FiCheck,
  FiRefreshCw,
} from "react-icons/fi";

interface AIAssistantProps {
  currentText: string;
  onInsertText: (text: string) => void;
  onReplaceText: (text: string) => void;
  preferredPlacement?: "auto" | "top" | "bottom";
}

type AssistMode = "none" | "continue" | "summarize" | "improve" | "custom";

export default function AIAssistant({
  currentText,
  onInsertText,
  onReplaceText,
  preferredPlacement = "auto",
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AssistMode>("none");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [aiSettings, setAISettings] = useState<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [panelPos, setPanelPos] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
  }>({
    top: 0,
    left: 0,
    width: 340,
    maxHeight: 360,
  });

  const updatePanelPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const width = Math.min(380, Math.max(300, viewportWidth - 16));
    let left = rect.right - width;
    left = Math.max(8, Math.min(left, viewportWidth - width - 8));

    const spaceBelow = viewportHeight - rect.bottom - 16;
    const spaceAbove = rect.top - 16;
    const isTopPlacement =
      preferredPlacement === "top" ||
      (preferredPlacement === "auto" && spaceBelow < 220 && spaceAbove > spaceBelow);

    if (isTopPlacement) {
      const bottom = Math.max(8, viewportHeight - rect.top + 8);
      const maxHeight = Math.max(240, Math.min(520, spaceAbove));

      setPanelPos({ bottom, left, width, maxHeight });
      return;
    }

    const top = Math.max(8, rect.bottom + 8);
    const maxHeight = Math.max(240, Math.min(520, spaceBelow));

    setPanelPos({ top, left, width, maxHeight });
  };

  useEffect(() => {
    fetchAISettings();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      setMode("none");
      setError("");
      setResult("");
      setIsOpen(false);
    };

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    updatePanelPosition();

    const handleLayout = () => updatePanelPosition();

    window.addEventListener("resize", handleLayout);
    window.addEventListener("scroll", handleLayout, true);

    return () => {
      window.removeEventListener("resize", handleLayout);
      window.removeEventListener("scroll", handleLayout, true);
    };
  }, [isOpen]);

  const fetchAISettings = async () => {
    try {
      const response = await fetch("/api/ai-settings");

      if (response.ok) {
        const data = await response.json();
        setAISettings(data);
      }
    } catch (err) {
      console.error("Failed to fetch AI settings:", err);
    }
  };

  const buildInstruction = (mode: AssistMode): string => {
    const instructions: Record<AssistMode, string> = {
      none: "",
      continue: "Lanjutkan tulisan ini dengan gaya yang sama dan natural.",
      summarize:
        "Ringkas tulisan berikut menjadi poin-poin utama yang singkat dan jelas.",
      improve:
        "Perbaiki tulisan berikut agar lebih baik dari segi bahasa, struktur, dan kejelasan.",
      custom: customPrompt,
    };

    return instructions[mode];
  };

  const handleAssist = async (selectedMode: AssistMode) => {
    if (!currentText.trim()) {
      setError("Tulisan masih kosong. Ketik sesuatu terlebih dahulu.");
      return;
    }

    if (!aiSettings) {
      setError(
        "Konfigurasi AI belum diatur. Silakan ke AI Settings terlebih dahulu.",
      );
      return;
    }

    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setMode(selectedMode);
    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          provider: aiSettings.activeProvider,
          model: aiSettings.activeModel,
          prompt: currentText,
          instruction: buildInstruction(selectedMode),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || "Failed to get AI response");
      }

      const data = await response.json();

      setResult(data.text || "Tidak ada respons dari AI");
    } catch (err: any) {
      if (err.name === "AbortError") {
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan yang tidak diketahui",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
    if (result) {
      onInsertText(result);

      setResult("");
      setMode("none");
      setIsOpen(false);
    }
  };

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleReplace = () => {
    if (result) {
      onReplaceText(result);

      setResult("");
      setMode("none");
      setIsOpen(false);
    }
  };

  const handleClose = () => {
    abortControllerRef.current?.abort();

    setMode("none");
    setResult("");
    setError("");
    setIsOpen(false);
  };

  return (
    <div className="relative font-sans" ref={wrapperRef}>
      {/* Trigger Button (VS Code Status Bar / Toolbar Style) */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        title="Buka AI Assistant"
        className="group flex h-5 items-center gap-1.5 rounded-md border border-white/5 bg-white/2 px-2.5 text-[11px] font-medium text-zinc-400 transition-all hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-300">
        <FiTarget
          size={13}
          className="text-purple-500 group-hover:text-purple-400"
        />
        <span className="hidden sm:inline">Ask AI</span>
      </button>

      {/* Panel Portal */}
      {isOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <>
            {/* Backdrop */}
            <button
              type="button"
              aria-label="Tutup AI Assistant"
              onClick={handleClose}
              onMouseDown={(event) => event.preventDefault()}
              className="fixed inset-0 z-119 cursor-default bg-black/40 backdrop-blur-sm transition-opacity"
            />

            {/* AI Panel (Notion / Raycast style popup) */}
            <div
              ref={panelRef}
              className="fixed z-120 flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#141414] shadow-2xl backdrop-blur-xl font-sans"
              style={{
                top: panelPos.top,
                bottom: panelPos.bottom,
                left: panelPos.left,
                width: panelPos.width,
                maxHeight: panelPos.maxHeight,
              }}>
              {/* Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-white/5 bg-[#1A1A1A] px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 shadow-inner">
                    <FiTarget size={14} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-semibold text-zinc-100">
                      AI Assistant
                    </h3>
                    <p className="text-[10px] text-zinc-500">
                      {aiSettings?.activeModel || "Model belum dipilih"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-200">
                  <FiX size={14} />
                </button>
              </div>

              {/* Content */}
              <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
                {/* Mode Selection */}
                {mode === "none" && (
                  <div className="space-y-1.5">
                    <p className="mb-3 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                      Pilih Aksi
                    </p>

                    <button
                      onClick={() => handleAssist("continue")}
                      disabled={loading}
                      className="group flex w-full items-center gap-3 rounded-lg border border-white/5 bg-white/2 px-3 py-2.5 text-left transition-all hover:border-purple-500/30 hover:bg-purple-500/10 disabled:opacity-50">
                      <FiPlus
                        size={15}
                        className="text-zinc-400 group-hover:text-purple-400"
                      />
                      <span className="text-[12px] font-medium text-zinc-300 group-hover:text-purple-200">
                        Lanjutkan Tulisan
                      </span>
                    </button>

                    <button
                      onClick={() => handleAssist("summarize")}
                      disabled={loading}
                      className="group flex w-full items-center gap-3 rounded-lg border border-white/5 bg-white/2 px-3 py-2.5 text-left transition-all hover:border-purple-500/30 hover:bg-purple-500/10 disabled:opacity-50">
                      <FiFileText
                        size={15}
                        className="text-zinc-400 group-hover:text-purple-400"
                      />
                      <span className="text-[12px] font-medium text-zinc-300 group-hover:text-purple-200">
                        Ringkas Teks
                      </span>
                    </button>

                    <button
                      onClick={() => handleAssist("improve")}
                      disabled={loading}
                      className="group flex w-full items-center gap-3 rounded-lg border border-white/5 bg-white/2 px-3 py-2.5 text-left transition-all hover:border-purple-500/30 hover:bg-purple-500/10 disabled:opacity-50">
                      <FiEdit3
                        size={15}
                        className="text-zinc-400 group-hover:text-purple-400"
                      />
                      <span className="text-[12px] font-medium text-zinc-300 group-hover:text-purple-200">
                        Perbaiki Tulisan
                      </span>
                    </button>

                    <button
                      onClick={() => setMode("custom")}
                      className="group flex w-full items-center gap-3 rounded-lg border border-white/5 bg-white/2 px-3 py-2.5 text-left transition-all hover:border-purple-500/30 hover:bg-purple-500/10">
                      <FiTarget
                        size={15}
                        className="text-zinc-400 group-hover:text-purple-400"
                      />
                      <span className="text-[12px] font-medium text-zinc-300 group-hover:text-purple-200">
                        Instruksi Custom (Prompt)
                      </span>
                    </button>
                  </div>
                )}

                {/* Custom Prompt Mode */}
                {mode === "custom" && (
                  <div className="space-y-3">
                    <label className="block text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                      Instruksi Custom
                    </label>

                    <textarea
                      autoFocus
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Contoh: Tulis ulang ini agar terdengar lebih profesional..."
                      className="custom-scrollbar w-full resize-none rounded-lg border border-white/10 bg-[#0E0E0E] px-3 py-2.5 text-[12px] text-zinc-200 placeholder-zinc-600 outline-none transition-colors focus:border-purple-500/50 focus:bg-white/2"
                      rows={3}
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAssist("custom")}
                        disabled={loading || !customPrompt.trim()}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-purple-600 py-2 text-[12px] font-medium text-white transition-colors hover:bg-purple-500 disabled:bg-white/10 disabled:text-zinc-500">
                        {loading ? (
                          <>
                            <FiLoader className="animate-spin" size={14} />
                            <span>Memproses...</span>
                          </>
                        ) : (
                          "Kirim Instruksi"
                        )}
                      </button>

                      <button
                        onClick={() => setMode("none")}
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2 text-[12px] font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white">
                        Batal
                      </button>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {loading && mode !== "custom" && (
                  <div className="flex flex-col items-center justify-center py-8 text-purple-400">
                    <FiLoader className="animate-spin mb-2" size={24} />
                    <span className="text-[11px] font-medium text-zinc-400">
                      AI sedang berpikir...
                    </span>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-[12px] text-red-300">
                    {error}
                  </div>
                )}

                {/* Result State */}
                {result && (
                  <div className="space-y-3">
                    <div className="custom-scrollbar max-h-56 overflow-y-auto rounded-lg border border-white/10 bg-[#0E0E0E] p-3 text-[12px] leading-relaxed text-zinc-200 shadow-inner">
                      {result}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleInsert}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2 text-[12px] font-medium text-white transition-colors hover:bg-blue-500">
                        <FiCheck size={14} />
                        Sisipkan (Insert)
                      </button>

                      <button
                        onClick={handleReplace}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 py-2 text-[12px] font-medium text-amber-400 transition-colors hover:bg-amber-500/20">
                        <FiRefreshCw size={14} />
                        Timpa (Replace)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
