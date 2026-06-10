/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation"; 
import { Button } from "@/components/ui/button";

// Fungsi untuk mengekstrak A, B, C, D dari teks panjang soal AI
function parseQuestionData(rawText: string) {
  const parts = rawText.split(/(?=[A-D][.)]\s)/);

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

  return { mainText: rawText, options: null };
}

// Fungsi menghitung persentase kemiripan jawaban Esai
function calculateSimilarity(userAnswer: string, expectedAnswer: string): number {
  if (!userAnswer.trim() || !expectedAnswer.trim()) return 0;
  const normalize = (text: string) => text.toLowerCase().replace(/[^\w\s]/gi, '');
  const userWords = normalize(userAnswer).split(/\s+/).filter(w => w.length > 3);
  const aiWords = normalize(expectedAnswer).split(/\s+/).filter(w => w.length > 3);
  
  if (aiWords.length === 0) return 0;
  
  const aiWordSet = new Set(aiWords);
  const userWordSet = new Set(userWords);
  
  let matchCount = 0;
  userWordSet.forEach(word => {
    if (aiWordSet.has(word)) matchCount++;
  });
  
  let score = Math.round((matchCount / aiWordSet.size) * 100 * 1.5);
  return score > 100 ? 100 : score;
}

export default function ExercisePage() {
  const params = useParams();
  const router = useRouter(); 
  const subtopicId = params.subtopicId as string;

  const [topicId, setTopicId] = useState<string>("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedPgOption, setSelectedPgOption] = useState<string>("");
  const [essayAnswer, setEssayAnswer] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Menyimpan skor dari masing-masing soal
  const [scores, setScores] = useState<number[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/exercises/${subtopicId}`);
        const data = await res.json();
        if (data.questions) {
          setQuestions(data.questions);
        }

        const subtopicRes = await fetch(`/api/subtopics/${subtopicId}`);
        const subtopicData = await subtopicRes.json();
        if (subtopicData?.topicId) {
          setTopicId(subtopicData.topicId);
        }
      } catch (error) {
        console.error("Gagal memuat data", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [subtopicId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#09090b]">
        <div className="text-gray-400 text-lg animate-pulse">
          Memuat soal latihan...
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="p-4 text-center text-gray-400 bg-[#09090b] min-h-screen">
        Belum ada soal untuk materi ini.
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isMultipleChoice = currentQuestion.type.toLowerCase().includes("ganda");
  const parsedData = parseQuestionData(currentQuestion.question);

  const checkIsCorrectPG = () => {
    if (!isMultipleChoice || !selectedPgOption) return false;
    return currentQuestion.answer.trim().toUpperCase().startsWith(selectedPgOption.toUpperCase());
  };

  const handleSubmit = () => {
    setIsSubmitted(true);

    let currentScore = 0;
    if (isMultipleChoice) {
      currentScore = checkIsCorrectPG() ? 100 : 0;
    } else {
      currentScore = calculateSimilarity(essayAnswer, currentQuestion.answer);
    }

    setScores((prev) => {
      const newScores = [...prev];
      newScores[currentIndex] = currentScore;
      return newScores;
    });
  };

  const handleNext = () => {
    setIsSubmitted(false);
    setSelectedPgOption("");
    setEssayAnswer("");
    setCurrentIndex((prev) => prev + 1);
  };

  const handleFinish = () => {
    const total = scores.reduce((acc, curr) => acc + curr, 0);
    const avg = questions.length > 0 ? Math.round(total / questions.length) : 0;

    localStorage.setItem(`mastery_${subtopicId}`, avg.toString());

    if (topicId) {
      router.push(`/learn/${topicId}?view=latihan&subtopicId=${subtopicId}`);
    } else {
      alert(`Latihan Selesai! Skor Penguasaan Anda: ${avg}%`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6 md:p-8 pb-24 max-w-3xl mx-auto text-gray-100 font-sans">
      <div className="mb-8 flex justify-between items-center text-base md:text-lg border-b border-gray-700 pb-4">
        <span className="text-gray-400 font-medium">
          Soal {currentIndex + 1} dari {questions.length}
        </span>
        <span className="uppercase font-bold tracking-wider text-blue-400 bg-blue-900/30 px-4 py-1.5 rounded-full text-sm">
          {currentQuestion.type}
        </span>
      </div>

      <div className="bg-gray-800 p-6 md:p-8 rounded-2xl shadow-xl mb-8 border border-gray-700 relative overflow-hidden">
        <p className="text-xl md:text-2xl whitespace-pre-wrap leading-relaxed font-medium text-white">
          {parsedData.mainText}
        </p>
      </div>

      <div className="mb-8 grow">
        {!isSubmitted ? (
          <>
            {isMultipleChoice ? (
              <div className="flex flex-col gap-4">
                {parsedData.options ? (
                  parsedData.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedPgOption(opt.id)}
                      className={`p-5 md:p-6 rounded-xl border-2 text-left transition-all text-lg md:text-xl ${
                        selectedPgOption === opt.id
                          ? "border-blue-500 bg-blue-900/40 text-blue-100 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                          : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50"
                      }`}>
                      {opt.text}
                    </button>
                  ))
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {["A", "B", "C", "D"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSelectedPgOption(opt)}
                        className={`p-5 md:p-6 rounded-xl border-2 font-bold transition-all text-lg md:text-xl ${
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
              <textarea
                value={essayAnswer}
                onChange={(e) => setEssayAnswer(e.target.value)}
                placeholder="Ketik jawaban Anda di sini secara detail..."
                className="w-full min-h-50 p-5 md:p-6 bg-gray-800 border-2 border-gray-700 rounded-xl text-gray-100 text-lg md:text-xl placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all resize-y"
              />
            )}

            <Button
              onClick={handleSubmit}
              disabled={isMultipleChoice ? !selectedPgOption : !essayAnswer.trim()}
              className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white p-7 rounded-xl font-bold text-lg md:text-xl transition-colors disabled:bg-gray-800 disabled:text-gray-600">
              Periksa Jawaban
            </Button>
          </>
        ) : (
          <div className="bg-gray-800 p-6 md:p-8 rounded-2xl border border-gray-700 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            
            {/* INDIKATOR BENAR / SALAH */}
            {isMultipleChoice ? (
               <div className={`p-5 mb-8 rounded-xl font-bold flex items-center gap-3 text-lg md:text-xl border-2 ${
                 checkIsCorrectPG() 
                   ? "bg-green-500/10 text-green-400 border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.1)]" 
                   : "bg-red-500/10 text-red-400 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
               }`}>
                 {checkIsCorrectPG() ? "✅ Hebat! Jawaban Kamu Benar" : "❌ Sayang Sekali, Jawaban Kamu Kurang Tepat"}
               </div>
            ) : (
               <div className="p-5 md:p-6 mb-8 rounded-xl bg-blue-500/10 border-2 border-blue-500/30">
                  <div className="flex justify-between items-center mb-4">
                     <span className="font-bold text-blue-300 text-base md:text-lg">Analisis Kemiripan Esai:</span>
                     <span className="font-extrabold text-blue-400 text-2xl md:text-3xl">
                       {calculateSimilarity(essayAnswer, currentQuestion.answer)}%
                     </span>
                  </div>
                  <div className="w-full bg-gray-900 h-4 rounded-full overflow-hidden border border-gray-700">
                     <div 
                       className={`h-full transition-all duration-1000 ${
                          calculateSimilarity(essayAnswer, currentQuestion.answer) > 70 ? 'bg-green-500' :
                          calculateSimilarity(essayAnswer, currentQuestion.answer) > 40 ? 'bg-yellow-500' : 'bg-red-500'
                       }`}
                       style={{ width: `${calculateSimilarity(essayAnswer, currentQuestion.answer)}%` }}
                     ></div>
                  </div>
               </div>
            )}

            <div className="flex items-center gap-3 mb-4 mt-2">
              <div className="w-2 h-7 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
              <h3 className="font-extrabold text-blue-400 text-xl tracking-wide uppercase">Kunci Jawaban</h3>
            </div>
            <p className="font-bold text-xl md:text-2xl mb-8 text-white bg-gray-900 p-4 md:p-5 rounded-xl border border-gray-700 shadow-inner">
              {currentQuestion.answer}
            </p>

            <h3 className="font-bold text-gray-400 mb-3 text-lg">Penjelasan:</h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-base md:text-lg">
              {currentQuestion.explanation}
            </p>
          </div>
        )}
      </div>

      {isSubmitted && currentIndex < questions.length - 1 && (
        <Button
          onClick={handleNext}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-7 rounded-xl font-bold text-lg md:text-xl mt-2 shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02]">
          Lanjut ke Soal Selanjutnya
        </Button>
      )}

      {isSubmitted && currentIndex === questions.length - 1 && (
        <Button
          onClick={handleFinish}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white p-7 rounded-xl font-bold text-lg md:text-xl mt-2 shadow-lg shadow-purple-900/20 transition-all hover:scale-[1.02]">
          Selesai Latihan & Lihat Analisis
        </Button>
      )}
    </div>
  );
}