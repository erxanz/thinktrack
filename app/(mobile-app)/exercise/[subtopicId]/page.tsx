/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

// Fungsi untuk mengekstrak A, B, C, D dari teks panjang soal AI
function parseQuestionData(rawText: string) {
  // Mencari pola pemisah seperti "A.", "B.", "C.", "D." atau "A)", "B)", "C)", "D)"
  const parts = rawText.split(/(?=[A-D][.)]\s)/);

  // Jika AI mengembalikan 1 teks soal utama + 4 opsi, kita pisahkan
  if (parts.length >= 5) {
    return {
      mainText: parts[0].trim(),
      options: [
        { id: "A", text: parts[1].trim() },
        { id: "B", text: parts[2].trim() },
        { id: "C", text: parts[3].trim() },
        { id: "D", text: parts[4].trim() },
      ],
    };
  }

  // Jika gagal diekstrak (format AI tidak terduga), kembalikan seperti semula
  return { mainText: rawText, options: null };
}

export default function ExercisePage() {
  const params = useParams();
  const subtopicId = params.subtopicId as string;

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedPgOption, setSelectedPgOption] = useState<string>("");
  const [essayAnswer, setEssayAnswer] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch(`/api/exercises/${subtopicId}`);
        const data = await res.json();
        if (data.questions) {
          setQuestions(data.questions);
        }
      } catch (error) {
        console.error("Gagal memuat soal", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuestions();
  }, [subtopicId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-400 text-lg animate-pulse">
          Memuat soal latihan...
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="p-4 text-center text-gray-400">
        Belum ada soal untuk materi ini.
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isMultipleChoice = currentQuestion.type.toLowerCase().includes("ganda");

  // Ekstrak pertanyaan dan opsi
  const parsedData = parseQuestionData(currentQuestion.question);

  const handleSubmit = () => setIsSubmitted(true);

  const handleNext = () => {
    setIsSubmitted(false);
    setSelectedPgOption("");
    setEssayAnswer("");
    setCurrentIndex((prev) => prev + 1);
  };

  return (
    // Gunakan text-white agar semua teks default menjadi putih (karena background hitam)
    <div className="flex flex-col min-h-screen p-4 pb-20 max-w-md mx-auto text-gray-100">
      {/* Header Progress */}
      <div className="mb-6 flex justify-between items-center text-sm border-b border-gray-700 pb-3">
        <span className="text-gray-400">
          Soal {currentIndex + 1} dari {questions.length}
        </span>
        <span className="uppercase font-bold tracking-wider text-blue-400 bg-blue-900/30 px-3 py-1 rounded-full">
          {currentQuestion.type}
        </span>
      </div>

      {/* Teks Pertanyaan Utama */}
      <div className="bg-gray-800 p-5 rounded-xl shadow-lg mb-6 border border-gray-700">
        <p className="text-lg whitespace-pre-wrap leading-relaxed">
          {parsedData.mainText}
        </p>
      </div>

      {/* AREA INPUT JAWABAN */}
      <div className="mb-6 flex-grow">
        {!isSubmitted ? (
          <>
            {isMultipleChoice ? (
              // INPUT PILIHAN GANDA: Ubah menjadi 1 kolom menurun (grid-cols-1) agar teks panjang muat
              <div className="flex flex-col gap-3">
                {parsedData.options ? (
                  // Jika teks berhasil dipisah, tampilkan opsi beserta isinya
                  parsedData.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedPgOption(opt.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedPgOption === opt.id
                          ? "border-blue-500 bg-blue-900/40 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                          : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-750"
                      }`}>
                      {opt.text}
                    </button>
                  ))
                ) : (
                  // Fallback jika AI gagal memberi format A., B., C., D. secara standar
                  <div className="grid grid-cols-2 gap-3">
                    {["A", "B", "C", "D"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSelectedPgOption(opt)}
                        className={`p-4 rounded-xl border-2 font-bold transition-all ${
                          selectedPgOption === opt
                            ? "border-blue-500 bg-blue-900/40 text-blue-100"
                            : "border-gray-700 bg-gray-800 text-gray-300"
                        }`}>
                        Opsi {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // INPUT ESAI
              <textarea
                value={essayAnswer}
                onChange={(e) => setEssayAnswer(e.target.value)}
                placeholder="Ketik jawaban Anda di sini..."
                className="w-full min-h-[150px] p-4 bg-gray-800 border-2 border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
              />
            )}

            <Button
              onClick={handleSubmit}
              disabled={
                isMultipleChoice ? !selectedPgOption : !essayAnswer.trim()
              }
              className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white p-6 rounded-xl font-bold text-lg transition-colors disabled:bg-gray-700 disabled:text-gray-500">
              Periksa Jawaban
            </Button>
          </>
        ) : (
          // AREA HASIL & PENJELASAN
          <div className="bg-gray-800 p-6 rounded-xl border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
              <h3 className="font-bold text-blue-400 text-lg">Kunci Jawaban</h3>
            </div>
            <p className="font-semibold text-xl mb-6 text-white bg-gray-900 p-3 rounded-lg border border-gray-700">
              {currentQuestion.answer}
            </p>

            <h3 className="font-bold text-gray-400 mb-2">Penjelasan:</h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {currentQuestion.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Tombol Navigasi Lanjut */}
      {isSubmitted && currentIndex < questions.length - 1 && (
        <Button
          onClick={handleNext}
          className="w-full bg-green-600 hover:bg-green-500 text-white p-6 rounded-xl font-bold text-lg mt-4 shadow-lg shadow-green-900/20">
          Soal Selanjutnya
        </Button>
      )}

      {/* Tombol Selesai */}
      {isSubmitted && currentIndex === questions.length - 1 && (
        <Button
          onClick={() => alert("Latihan Selesai!")}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white p-6 rounded-xl font-bold text-lg mt-4 shadow-lg shadow-purple-900/20">
          Selesai Latihan
        </Button>
      )}
    </div>
  );
}
