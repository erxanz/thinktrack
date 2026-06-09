"use client";

import { useState, useEffect, use } from "react";
import { FiX, FiCheck, FiAlertCircle, FiArrowRight, FiLoader } from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function ExercisePage({ params }: { params: Promise<{ subtopicId: string }> }) {
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
      .then(res => res.json())
      .then(data => {
        setQuestions(data.questions);
        setLoading(false);
      });
  }, [subtopicId]);

  const handleCheck = () => {
    const correct = selectedAnswer === questions[currentIndex].answer;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 20); // 5 soal x 20 = 100
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      // Selesai! Redirect atau tampilkan modal skor
      alert(`Latihan Selesai! Skor Kamu: ${score + (isCorrect ? 20 : 0)}`);
      router.back();
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <FiLoader className="animate-spin text-blue-500" size={40} />
    </div>
  );

  const currentQ = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col">
      {/* Header & Progress */}
      <div className="p-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-zinc-500"><FiX size={24} /></button>
        <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Konten Soal */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
        <h2 className="text-2xl font-bold mb-8">{currentQ.question}</h2>
        
        <div className="space-y-4">
          {currentQ.options.map((opt: string) => (
            <button
              key={opt}
              onClick={() => isCorrect === null && setSelectedAnswer(opt)}
              className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
                selectedAnswer === opt 
                  ? "border-blue-500 bg-blue-500/10" 
                  : "border-white/5 bg-zinc-900/50 hover:bg-zinc-800"
              } ${isCorrect !== null && opt === currentQ.answer ? "border-emerald-500 bg-emerald-500/10" : ""}
                ${isCorrect === false && selectedAnswer === opt ? "border-red-500 bg-red-500/10" : ""}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Check Answer (Fixed Bottom) */}
      <div className={`p-6 border-t border-white/5 ${isCorrect === true ? "bg-emerald-900/20" : isCorrect === false ? "bg-red-900/20" : "bg-[#09090b]"}`}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            {isCorrect === true && <p className="text-emerald-400 font-bold flex items-center gap-2"><FiCheck /> Luar Biasa! Jawaban Benar.</p>}
            {isCorrect === false && <p className="text-red-400 font-bold flex items-center gap-2"><FiAlertCircle /> Kurang Tepat. Jawaban: {currentQ.answer}</p>}
          </div>
          
          {isCorrect === null ? (
            <button 
              disabled={!selectedAnswer}
              onClick={handleCheck}
              className="px-10 py-4 bg-blue-600 disabled:opacity-30 text-white font-bold rounded-2xl transition-all"
            >
              PERIKSA
            </button>
          ) : (
            <button 
              onClick={handleNext}
              className={`px-10 py-4 ${isCorrect ? "bg-emerald-600" : "bg-red-600"} text-white font-bold rounded-2xl flex items-center gap-2`}
            >
              LANJUT <FiArrowRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}