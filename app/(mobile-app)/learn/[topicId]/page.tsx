/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import LatexRenderer from "@/components/ui/LatexRenderer";
import { FiSend, FiPlus, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

// Import Keyboard khusus client agar tidak bentrok dengan SSR
const MathKeyboard = dynamic(() => import("@/components/input/MathKeyboard"), {
  ssr: false,
});

export default function LatihanSoalPage({
  params,
}: {
  params: { topicId: string };
}) {
  const [steps, setSteps] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAddStep = () => {
    if (currentInput.trim() !== "") {
      setSteps([...steps, currentInput]);
      setCurrentInput(""); // Kosongkan input setelah ditambah
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/analyze-trace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          steps,
          topicId: params.topicId,
          question: "2x + 4 = 10", // Anda bisa mengambil soal dari database nanti
        }),
      });
      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error("Gagal menganalisis:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-40">
      {/* Header Soal */}
      <div className="bg-zinc-950/50 p-6 border-b border-white/5">
        <h1 className="text-sm text-zinc-500 mb-2 uppercase tracking-widest">
          Selesaikan Soal:
        </h1>
        <div className="text-3xl font-serif text-center py-4 text-white">
          <LatexRenderer content="2x + 4 = 10" />
        </div>
      </div>

      {/* Area Langkah Pengerjaan */}
      <div className="p-4 space-y-4">
        {steps.map((step, index) => {
          const isErrorStep = analysis?.errorStep === index + 1;

          return (
            <div
              key={index}
              className={`p-4 rounded-xl border transition-all duration-300 ${
                isErrorStep
                  ? "bg-red-950/30 border-red-500"
                  : "bg-zinc-900/60 border-white/5"
              }`}>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                    isErrorStep
                      ? "bg-red-500/10 text-red-400"
                      : "bg-blue-500/10 text-blue-500"
                  }`}>
                  Langkah {index + 1}
                </span>

                {isErrorStep && (
                  <FiAlertCircle className="text-red-500 text-lg" />
                )}
              </div>

              <div className="text-lg py-3">
                <LatexRenderer content={step} />
              </div>

              {/* Feedback langsung di langkah yang salah */}
              {isErrorStep && (
                <div className="mt-2 bg-red-900/20 border border-red-800/40 rounded-lg p-3 text-sm text-red-200">
                  {analysis.feedback}
                </div>
              )}
            </div>
          );
        })}

        {/* Jika semua langkah benar */}
        {analysis?.isCorrect && (
          <div className="mt-6 p-4 rounded-xl border bg-emerald-950/20 border-emerald-900/30">
            <h3 className="font-bold mb-2 flex items-center gap-2 text-emerald-400">
              <FiCheckCircle />
              Analisis AI
            </h3>

            <p className="text-sm text-zinc-300">{analysis.feedback}</p>
          </div>
        )}

        {/* Fallback jika AI tidak mengirim errorStep */}
        {analysis && !analysis.isCorrect && !analysis.errorStep && (
          <div className="mt-6 p-4 rounded-xl border bg-red-950/20 border-red-900/30">
            <h3 className="font-bold mb-2 flex items-center gap-2 text-red-400">
              <FiAlertCircle />
              Analisis AI
            </h3>

            <p className="text-sm text-zinc-300">{analysis.feedback}</p>
          </div>
        )}
      </div>

      {/* Sticky Action Footer */}
      <div className="fixed bottom-0 w-full bg-[#09090b]/90 backdrop-blur-md border-t border-white/5 p-4 z-40">
        <div className="flex gap-2">
          <button
            onClick={handleAddStep}
            className="flex-1 bg-zinc-800 py-3 rounded-xl text-sm font-semibold hover:bg-zinc-700">
            + Langkah
          </button>
          <button
            onClick={handleAnalyze}
            disabled={steps.length === 0 || loading}
            className="flex-1 bg-blue-600 py-3 rounded-xl text-sm font-semibold hover:bg-blue-500 disabled:opacity-50">
            {loading ? "Menganalisis..." : "Analisis AI"}
          </button>
        </div>
      </div>

      {/* Keyboard Matematika */}
      <MathKeyboard onInput={(latex) => setCurrentInput(latex)} />
    </div>
  );
}
