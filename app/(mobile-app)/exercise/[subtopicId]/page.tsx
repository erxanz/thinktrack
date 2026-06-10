/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, use } from "react";
import {
  FiX,
  FiCheck,
  FiAlertCircle,
  FiArrowRight,
  FiLoader,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

export default function ExercisePage({
  params,
}: {
  params: Promise<{ subtopicId: string }>;
}) {
  const { subtopicId } = use(params);
  const router = useRouter();

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/exercises/${subtopicId}`)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data?.questions || []);
      })
      .catch((err) => {
        console.error("Gagal mengambil data soal:", err);
        setQuestions([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [subtopicId]);

  const handleCheck = () => {
    if (!selectedAnswer) return;

    const correct = selectedAnswer === questions[currentIndex]?.answer;

    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 20);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      return;
    }

    alert(`🎉 Latihan Selesai!\n\nSkor Kamu: ${score}`);
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <FiLoader className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center">
        <FiAlertCircle size={48} className="text-zinc-500 mb-4" />

        <h2 className="text-xl font-bold mb-2">Soal Tidak Ditemukan</h2>

        <p className="text-zinc-400 mb-6">
          Belum ada soal latihan untuk materi ini atau terjadi kesalahan pada
          server.
        </p>

        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-colors">
          Kembali
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  if (!currentQ) {
    return null;
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-zinc-500 hover:text-white transition-colors">
          <FiX size={24} />
        </button>

        <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Soal */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
        <div className="markdown-preview mb-8">
          <ReactMarkdown>{currentQ.question || ""}</ReactMarkdown>
        </div>

        {/* Pilihan Jawaban */}
        <div className="space-y-4">
          {currentQ.options?.map((opt: string, index: number) => (
            <button
              key={`${index}-${opt}`}
              onClick={() => isCorrect === null && setSelectedAnswer(opt)}
              disabled={isCorrect !== null}
              className={`w-full p-5 rounded-2xl border-2 text-left transition-all
                ${
                  selectedAnswer === opt
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-white/5 bg-zinc-900/50 hover:bg-zinc-800"
                }
                ${
                  isCorrect !== null && opt === currentQ.answer
                    ? "border-emerald-500 bg-emerald-500/10"
                    : ""
                }
                ${
                  isCorrect === false && selectedAnswer === opt
                    ? "border-red-500 bg-red-500/10"
                    : ""
                }`}>
              <div className="markdown-preview [&_p]:mb-0">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <span>{children}</span>,
                  }}>
                  {opt}
                </ReactMarkdown>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className={`p-6 border-t border-white/5 ${
          isCorrect === true
            ? "bg-emerald-900/20"
            : isCorrect === false
              ? "bg-red-900/20"
              : "bg-[#09090b]"
        }`}>
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-6">
          <div className="flex-1">
            {isCorrect === true && (
              <p className="text-emerald-400 font-bold flex items-center gap-2">
                <FiCheck />
                Luar Biasa! Jawaban Benar.
              </p>
            )}

            {isCorrect === false && (
              <div>
                <p className="text-red-400 font-bold flex items-center gap-2 mb-2">
                  <FiAlertCircle />
                  Kurang Tepat. Jawaban Benar:
                </p>

                <div className="markdown-preview">
                  <ReactMarkdown>{currentQ.answer || ""}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          {isCorrect === null ? (
            <button
              disabled={!selectedAnswer}
              onClick={handleCheck}
              className="px-10 py-4 bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all">
              PERIKSA
            </button>
          ) : (
            <button
              onClick={handleNext}
              className={`px-10 py-4 ${
                isCorrect
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"
              } text-white font-bold rounded-2xl flex items-center gap-2 transition-colors`}>
              LANJUT
              <FiArrowRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
