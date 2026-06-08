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
  FiBookOpen,
  FiEdit3,
  FiChevronRight,
} from "react-icons/fi";

const MathKeyboard = dynamic(() => import("@/components/input/MathKeyboard"), {
  ssr: false,
});

interface AnalysisResult {
  isCorrect: boolean;
  feedback: string;
  errorStep?: number;
}

export default function LearnPage({ params }: { params: { topicId: string } }) {
  const [viewMode, setViewMode] = useState<"materi" | "latihan">("materi");

  // DATA MATERI SEMENTARA
  const roadmap = [
    {
      id: 1,
      title: "Memahami Persamaan Linear",
      content:
        "Persamaan linear adalah persamaan yang memiliki pangkat tertinggi satu.",
    },
    {
      id: 2,
      title: "Operasi Aljabar Dasar",
      content:
        "Untuk menyelesaikan persamaan, lakukan operasi yang sama pada kedua ruas.",
    },
    {
      id: 3,
      title: "Menyelesaikan Persamaan Linear",
      content: "Pindahkan konstanta ke ruas kanan dan sederhanakan variabel.",
    },
  ];

  const [steps, setSteps] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const question = "2x + 4 = 10";

  const sanitizeLatex = (latex: string) =>
    latex.replace(/\\placeholder\{\}/g, "□").replace(/\\placeholder/g, "□");

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
    if (!steps.length) return;

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
    } catch {
      setAnalysis({
        isCorrect: false,
        feedback: "Gagal menghubungi AI. Silakan coba lagi.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-56">
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-[#09090b]/95 backdrop-blur border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="flex">
            <button
              onClick={() => setViewMode("materi")}
              className={`flex-1 py-4 text-sm font-bold transition ${
                viewMode === "materi"
                  ? "border-b-2 border-blue-500 text-blue-400"
                  : "text-zinc-500"
              }`}>
              <div className="flex items-center justify-center gap-2">
                <FiBookOpen />
                Materi
              </div>
            </button>

            <button
              onClick={() => setViewMode("latihan")}
              className={`flex-1 py-4 text-sm font-bold transition ${
                viewMode === "latihan"
                  ? "border-b-2 border-blue-500 text-blue-400"
                  : "text-zinc-500"
              }`}>
              <div className="flex items-center justify-center gap-2">
                <FiEdit3 />
                Latihan
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* MODE MATERI */}
      {viewMode === "materi" && (
        <div className="max-w-5xl mx-auto p-5">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              Persamaan Linear Satu Variabel
            </h1>

            <p className="text-zinc-400 mt-2">
              Roadmap pembelajaran yang dibuat AI.
            </p>
          </div>

          <div className="space-y-4">
            {roadmap.map((item, index) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/5 bg-zinc-900/50 p-5 hover:border-blue-500/30 transition">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">
                    {index + 1}. {item.title}
                  </h3>

                  <FiChevronRight />
                </div>

                <p className="text-sm text-zinc-400">{item.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-blue-500/20 bg-blue-950/20 p-5">
            <h3 className="font-semibold text-blue-400 mb-2">Rekomendasi AI</h3>

            <p className="text-sm text-zinc-300">
              Pelajari semua sub-materi terlebih dahulu sebelum masuk ke latihan
              soal.
            </p>

            <button
              onClick={() => setViewMode("latihan")}
              className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500">
              Mulai Latihan
            </button>
          </div>
        </div>
      )}

      {/* MODE LATIHAN */}
      {viewMode === "latihan" && (
        <>
          <div className="border-b border-white/5 bg-zinc-950/50 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="rounded-2xl bg-zinc-900/50 border border-white/5 p-6">
                <div className="flex justify-between mb-4">
                  <span className="text-xs uppercase text-zinc-500 font-bold">
                    Latihan Thinking Trace
                  </span>

                  <span className="px-2 py-1 rounded-full text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    AI Active
                  </span>
                </div>

                <div className="text-center text-3xl">
                  <LatexRenderer content={question} />
                </div>
              </div>
            </div>
          </div>

          {currentInput && (
            <div className="max-w-4xl mx-auto p-4">
              <div className="rounded-xl border border-blue-900/30 bg-blue-950/20 p-4">
                <div className="text-lg">
                  <LatexRenderer content={previewContent} />
                </div>

                {hasPlaceholder && (
                  <p className="mt-2 text-xs text-amber-400">
                    Lengkapi ekspresi matematika terlebih dahulu.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="max-w-4xl mx-auto p-4 space-y-4">
            {steps.map((step, index) => {
              const isError = analysis?.errorStep === index + 1;

              return (
                <div
                  key={index}
                  className={`rounded-xl border p-4 ${
                    isError
                      ? "border-red-500 bg-red-950/20"
                      : "border-white/5 bg-zinc-900/50"
                  }`}>
                  <div className="flex justify-between mb-3">
                    <span className="text-xs text-zinc-500">
                      Langkah {index + 1}
                    </span>

                    <button onClick={() => removeStep(index)}>
                      <FiTrash2 />
                    </button>
                  </div>

                  <LatexRenderer content={step} />
                </div>
              );
            })}

            {analysis?.isCorrect && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <FiCheckCircle />
                  Analisis AI
                </div>

                <p className="mt-2 text-sm">{analysis.feedback}</p>
              </div>
            )}

            {analysis && !analysis.isCorrect && !analysis.errorStep && (
              <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-4">
                <div className="flex items-center gap-2 text-red-400 font-semibold">
                  <FiAlertCircle />
                  Analisis AI
                </div>

                <p className="mt-2 text-sm">{analysis.feedback}</p>
              </div>
            )}
          </div>

          <div className="fixed bottom-0 left-0 right-0 border-t border-white/5 bg-[#09090b]/90 backdrop-blur">
            <div className="max-w-4xl mx-auto p-4 flex gap-3">
              <button
                onClick={handleAddStep}
                className="flex-1 rounded-xl bg-zinc-800 py-3">
                Tambah Langkah
              </button>

              <button
                onClick={handleAnalyze}
                className="flex-1 rounded-xl bg-blue-600 py-3">
                {loading ? "Menganalisis..." : "Analisis Thinking Trace"}
              </button>
            </div>
          </div>

          <MathKeyboard onInput={(latex) => setCurrentInput(latex)} />
        </>
      )}
    </div>
  );
}
