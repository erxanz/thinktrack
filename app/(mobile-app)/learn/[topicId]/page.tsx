"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import LatexRenderer from "@/components/ui/LatexRenderer";
import {
  FiPlus,
  FiAlertCircle,
  FiCheckCircle,
  FiTrash2,
  FiCpu,
} from "react-icons/fi";

const MathKeyboard = dynamic(() => import("@/components/input/MathKeyboard"), {
  ssr: false,
});

interface AnalysisResult {
  isCorrect: boolean;
  feedback: string;
  errorStep?: number;
}

export default function LatihanSoalPage({
  params,
}: {
  params: { topicId: string };
}) {
  const [steps, setSteps] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const question = "2x + 4 = 10";

  const sanitizeLatex = (latex: string) => {
    return latex
      .replace(/\\placeholder\{\}/g, "□")
      .replace(/\\placeholder/g, "□");
  };

  const previewContent = sanitizeLatex(currentInput);

  const hasPlaceholder = currentInput.includes("\\placeholder");

  const handleAddStep = () => {
    if (!currentInput.trim()) return;

    setSteps((prev) => [...prev, currentInput]);
    setCurrentInput("");
    setAnalysis(null);
  };

  const removeStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
    setAnalysis(null);
  };

  const handleAnalyze = async () => {
    if (steps.length === 0) return;

    setLoading(true);

    try {
      const response = await fetch("/api/ai/analyze-trace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          steps,
          topicId: params.topicId,
          question,
        }),
      });

      const data = await response.json();

      setAnalysis(data);
    } catch (error) {
      console.error("Gagal menganalisis:", error);

      setAnalysis({
        isCorrect: false,
        feedback:
          "Terjadi kesalahan saat menghubungi AI. Silakan coba kembali.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-56">
      {/* Header */}
      <div className="border-b border-white/5 bg-zinc-950/50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3">
            Thinking Trace Exercise
          </h1>

          <div className="rounded-2xl bg-zinc-900/50 border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-zinc-500 uppercase font-bold">
                Selesaikan Persamaan
              </span>

              <span className="px-2 py-1 rounded-full text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400">
                AI Active
              </span>
            </div>

            <div className="text-center text-3xl font-serif text-white">
              <LatexRenderer content={question} />
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="flex justify-between text-xs text-zinc-500 mb-2">
          <span>Thinking Trace Progress</span>
          <span>{steps.length} langkah</span>
        </div>

        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${Math.min(steps.length * 20, 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Preview Input */}
      {currentInput && (
        <div className="max-w-4xl mx-auto px-4 mt-6">
          <div className="rounded-xl border border-blue-900/30 bg-blue-950/20 p-4">
            <div className="text-[10px] uppercase font-bold text-blue-400 mb-2">
              Langkah Yang Akan Ditambahkan
            </div>

            <div className="text-lg">
              <LatexRenderer content={previewContent} />
            </div>

            {hasPlaceholder && (
              <div className="mt-3 text-xs text-amber-400 flex items-center gap-2">
                ⚠ Lengkapi ekspresi matematika terlebih dahulu
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="max-w-4xl mx-auto px-4 mt-6">
          <div className="rounded-xl border border-blue-900/30 bg-blue-950/20 p-4 animate-pulse">
            <div className="flex items-center gap-2 text-blue-400 font-semibold mb-2">
              <FiCpu />
              AI sedang menganalisis...
            </div>

            <p className="text-sm text-zinc-400">
              Memeriksa jejak berpikir dan mendeteksi miskonsepsi konsep.
            </p>
          </div>
        </div>
      )}

      {/* Langkah */}
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {steps.map((step, index) => {
          const isError = analysis?.errorStep === index + 1;

          return (
            <div
              key={index}
              className={`rounded-xl border p-4 transition-all ${
                isError
                  ? "border-red-500 bg-red-950/20"
                  : "border-white/5 bg-zinc-900/50"
              }`}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold uppercase text-zinc-500">
                  Langkah {index + 1}
                </span>

                <div className="flex items-center gap-3">
                  {isError && (
                    <span className="text-[10px] font-bold uppercase text-red-500">
                      Perlu Perbaikan
                    </span>
                  )}

                  <button
                    onClick={() => removeStep(index)}
                    className="text-zinc-500 hover:text-red-400 transition">
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              <div className="text-lg">
                <LatexRenderer content={step} />
              </div>

              {isError && (
                <div className="mt-4 rounded-lg border border-red-800/50 bg-red-900/20 p-3 text-sm text-red-200">
                  <strong>Analisis AI:</strong> {analysis?.feedback}
                </div>
              )}
            </div>
          );
        })}

        {/* Success */}
        {analysis?.isCorrect && (
          <div className="rounded-xl border border-emerald-900/30 bg-emerald-950/20 p-5">
            <h3 className="mb-3 flex items-center gap-2 font-bold text-emerald-400">
              <FiCheckCircle />
              Analisis AI
            </h3>

            <p className="text-sm text-zinc-300">{analysis.feedback}</p>
          </div>
        )}

        {/* General Error */}
        {analysis && !analysis.isCorrect && !analysis.errorStep && (
          <div className="rounded-xl border border-red-900/30 bg-red-950/20 p-5">
            <h3 className="mb-3 flex items-center gap-2 font-bold text-red-400">
              <FiAlertCircle />
              Analisis AI
            </h3>

            <p className="text-sm text-zinc-300">{analysis.feedback}</p>
          </div>
        )}
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-[#09090b]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex gap-3">
            <button
              onClick={handleAddStep}
              disabled={!currentInput.trim()}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-zinc-800 py-3 text-sm font-semibold hover:bg-zinc-700 disabled:opacity-40">
              <FiPlus />
              Tambah Langkah
            </button>

            <button
              onClick={handleAnalyze}
              disabled={steps.length === 0 || loading}
              className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold hover:bg-blue-500 disabled:opacity-40">
              {loading ? "Menganalisis..." : "Analisis Thinking Trace"}
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard */}
      <MathKeyboard onInput={(latex: string) => setCurrentInput(latex)} />
    </div>
  );
}
