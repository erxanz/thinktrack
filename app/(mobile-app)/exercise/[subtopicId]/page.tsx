/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation"; 
import { Button } from "@/components/ui/button";
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiRotateCcw } from "react-icons/fi";

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

  // STATE BARU: Merekam jawaban riil user & Status Review
  const [scores, setScores] = useState<number[]>([]);
  const [userAnswersData, setUserAnswersData] = useState<string[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/exercises/${subtopicId}`);
        const data = await res.json();
        if (data.questions) setQuestions(data.questions);

        const subtopicRes = await fetch(`/api/subtopics/${subtopicId}`);
        const subtopicData = await subtopicRes.json();
        if (subtopicData?.topicId) setTopicId(subtopicData.topicId);

        // Cek apakah user sudah pernah mengerjakan soal ini
        const savedScore = localStorage.getItem(`mastery_${subtopicId}`);
        const savedAnswers = localStorage.getItem(`answers_${subtopicId}`);
        
        if (savedScore && savedAnswers) {
          setIsReviewMode(true);
          setUserAnswersData(JSON.parse(savedAnswers));
        }

      } catch (error) {
        console.error("Gagal memuat data", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [subtopicId]);

  const handleRetake = () => {
    if (confirm("Anda yakin ingin mengulang latihan? Nilai dan riwayat jawaban sebelumnya akan dihapus.")) {
      localStorage.removeItem(`mastery_${subtopicId}`);
      localStorage.removeItem(`answers_${subtopicId}`);
      setIsReviewMode(false);
      setCurrentIndex(0);
      setScores([]);
      setUserAnswersData([]);
      setIsSubmitted(false);
      setSelectedPgOption("");
      setEssayAnswer("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#09090b]"><div className="text-gray-400 text-lg animate-pulse">Memuat soal latihan...</div></div>
    );
  }

  if (!questions.length) {
    return <div className="p-4 text-center text-gray-400 bg-[#09090b] min-h-screen">Belum ada soal untuk materi ini.</div>;
  }

  // ==============================================================
  // TAMPILAN 1: MODE RIWAYAT PEMBAHASAN (Semua soal tampil ke bawah)
  // ==============================================================
  if (isReviewMode) {
    const finalScore = localStorage.getItem(`mastery_${subtopicId}`);
    return (
      <div className="min-h-screen bg-[#09090b] text-gray-100 font-sans p-4 md:p-8 pb-24">
        <div className="max-w-3xl mx-auto">
          {/* Header Review */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-blue-900/20 p-6 rounded-2xl border border-blue-500/30">
            <div>
              <button onClick={() => router.push(`/learn/${topicId}?view=latihan&subtopicId=${subtopicId}`)} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold mb-2 transition-colors">
                <FiArrowLeft /> Kembali ke Analisis AI
              </button>
              <h1 className="text-2xl font-black text-white">Riwayat Pembahasan Soal</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center bg-zinc-900/80 px-6 py-3 rounded-xl border border-white/10 shadow-inner">
                <span className="block text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">Skor Anda</span>
                <span className="text-2xl font-black text-emerald-400">{finalScore}%</span>
              </div>
              <button onClick={handleRetake} className="flex flex-col items-center justify-center bg-red-500/10 text-red-400 border border-red-500/20 p-3 rounded-xl hover:bg-red-500/20 transition-all">
                <FiRotateCcw size={20} className="mb-1" />
                <span className="text-[10px] font-bold uppercase">Ulangi</span>
              </button>
            </div>
          </div>

          {/* List Semua Soal */}
          <div className="space-y-8">
            {questions.map((q, idx) => {
              const isMC = q.type.toLowerCase().includes("ganda");
              const pData = parseQuestionData(q.question);
              const uAnswer = userAnswersData[idx] || "";
              const isCorrectMC = isMC && q.answer.trim().toUpperCase().startsWith(uAnswer.toUpperCase());
              const simScore = !isMC ? calculateSimilarity(uAnswer, q.answer) : 0;

              return (
                <div key={q.id} className="bg-gray-800/80 p-6 md:p-8 rounded-2xl border border-gray-700 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-gray-400">Soal {idx + 1}</span>
                    <span className="text-xs font-bold px-3 py-1 bg-zinc-700 rounded-full text-zinc-300 uppercase">{q.type}</span>
                  </div>
                  
                  <p className="text-lg md:text-xl text-white font-medium whitespace-pre-wrap leading-relaxed mb-6">{pData.mainText}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Jawaban User */}
                    <div className="bg-zinc-900/60 p-5 rounded-xl border border-white/5">
                      <span className="block text-xs text-zinc-500 font-bold uppercase mb-2">Jawaban Anda:</span>
                      <p className="text-white text-base md:text-lg mb-4">{uAnswer || <span className="italic text-zinc-600">Tidak dijawab</span>}</p>
                      
                      {isMC ? (
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold ${isCorrectMC ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {isCorrectMC ? <><FiCheckCircle /> Benar</> : <><FiXCircle /> Salah</>}
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold bg-blue-500/10 text-blue-400">
                          Kemiripan: {simScore}%
                        </div>
                      )}
                    </div>

                    {/* Kunci Jawaban */}
                    <div className="bg-blue-900/10 p-5 rounded-xl border border-blue-500/20">
                      <span className="block text-xs text-blue-400 font-bold uppercase mb-2">Kunci Jawaban AI:</span>
                      <p className="text-blue-100 font-semibold text-base md:text-lg">{q.answer}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <span className="block text-xs text-purple-400 font-bold uppercase mb-2">Penjelasan Evaluasi:</span>
                    <p className="text-gray-300 leading-relaxed text-sm md:text-base">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================
  // TAMPILAN 2: MODE LATIHAN NORMAL 
  // ==============================================================
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
    const answeredText = isMultipleChoice ? selectedPgOption : essayAnswer;

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

    setUserAnswersData((prev) => {
      const newAns = [...prev];
      newAns[currentIndex] = answeredText;
      return newAns;
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
    localStorage.setItem(`answers_${subtopicId}`, JSON.stringify(userAnswersData)); // SIMPAN JAWABAN

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

      <div className="mb-8 flex-grow">
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
                className="w-full min-h-[200px] p-5 md:p-6 bg-gray-800 border-2 border-gray-700 rounded-xl text-gray-100 text-lg md:text-xl placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all resize-y"
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