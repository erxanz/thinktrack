/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation"; 
import { Button } from "@/components/ui/button";
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiRotateCcw, FiLoader, FiEdit3 } from "react-icons/fi";

function parseQuestionData(rawText: string) {
  const parts = rawText.split(/(?=[A-D][.)]\s*)/);
  if (parts.length >= 5) {
    return {
      mainText: parts[0].trim(),
      options: [
        { id: "A", text: parts[1].replace(/^[A-D][.)]\s*/, '').trim() },
        { id: "B", text: parts[2].replace(/^[A-D][.)]\s*/, '').trim() },
        { id: "C", text: parts[3].replace(/^[A-D][.)]\s*/, '').trim() },
        { id: "D", text: parts[4].replace(/^[A-D][.)]\s*/, '').trim() },
      ],
    };
  }
  return { mainText: rawText, options: null };
}

export default function ExercisePage() {
  const params = useParams();
  const router = useRouter(); 
  const subtopicId = params.subtopicId as string;

  const [topicId, setTopicId] = useState<string>("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false); 

  const [selectedPgOption, setSelectedPgOption] = useState<string>("");
  const [essayAnswer, setEssayAnswer] = useState<string>("");
  const [scratchpadText, setScratchpadText] = useState<string>(""); 
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [scores, setScores] = useState<number[]>([]);
  const [userAnswersData, setUserAnswersData] = useState<string[]>([]);
  const [aiEvaluationResults, setAiEvaluationResults] = useState<any[]>([]); 
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [finalDBScore, setFinalDBScore] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/exercises/${subtopicId}`);
        const data = await res.json();
        if (data.questions) setQuestions(data.questions);

        const subtopicRes = await fetch(`/api/subtopics/${subtopicId}`);
        const subtopicData = await subtopicRes.json();
        if (subtopicData?.topicId) setTopicId(subtopicData.topicId);

        const dbResultRes = await fetch(`/api/exercises/${subtopicId}/result`);
        const dbResultData = await dbResultRes.json();
        
        if (dbResultData?.result) {
          setIsReviewMode(true);
          setFinalDBScore(dbResultData.result.score);
          setUserAnswersData(dbResultData.result.userAnswers);
        }
      } catch (error) {
        console.error("Gagal memuat data", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [subtopicId]);

  const handleRetake = async () => {
    if (confirm("Anda yakin ingin mengulang latihan? Nilai dan riwayat jawaban sebelumnya akan dihapus dari Database.")) {
      setIsLoading(true);
      await fetch(`/api/exercises/${subtopicId}/result`, { method: "DELETE" }); 
      
      setIsReviewMode(false);
      setCurrentIndex(0);
      setScores([]);
      setUserAnswersData([]);
      setAiEvaluationResults([]);
      setIsSubmitted(false);
      setSelectedPgOption("");
      setEssayAnswer("");
      setScratchpadText("");
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen bg-[#09090b]"><FiLoader className="animate-spin text-blue-500" size={32} /></div>;
  if (!questions.length) return <div className="p-4 text-center text-gray-400 bg-[#09090b] min-h-screen">Belum ada soal untuk materi ini.</div>;

  const currentQuestion = questions[currentIndex];
  const isMultipleChoice = currentQuestion.type.toLowerCase().includes("ganda");
  const parsedData = parseQuestionData(currentQuestion.question);

  const handleSubmit = async () => {
    setIsEvaluating(true);
    const answeredText = isMultipleChoice ? `${selectedPgOption} | Coretan: ${scratchpadText}` : essayAnswer;

    try {
      const res = await fetch('/api/ai/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion.question,
          expectedAnswer: currentQuestion.answer,
          selectedOption: isMultipleChoice ? selectedPgOption : null,
          scratchpad: isMultipleChoice ? scratchpadText : essayAnswer, // AI mengevaluasi text box coretan/esai secara langsung
          type: currentQuestion.type
        })
      });
      
      const evalData = await res.json();
      
      setIsSubmitted(true);
      setScores((prev) => { const newScores = [...prev]; newScores[currentIndex] = evalData.score || 0; return newScores; });
      setUserAnswersData((prev) => { const newAns = [...prev]; newAns[currentIndex] = answeredText; return newAns; });
      setAiEvaluationResults((prev) => { const newEvals = [...prev]; newEvals[currentIndex] = evalData; return newEvals; });
      
    } catch (error) {
      alert("Gagal menghubungi AI Evaluator.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNext = () => {
    setIsSubmitted(false);
    setSelectedPgOption("");
    setEssayAnswer("");
    setScratchpadText(""); 
    setCurrentIndex((prev) => prev + 1);
  };

  const handleFinish = async () => {
    setIsSaving(true);
    const total = scores.reduce((acc, curr) => acc + curr, 0);
    const avg = questions.length > 0 ? Math.round(total / questions.length) : 0;

    const detailedAnalysis = questions.map((q, idx) => {
      const aiEval = aiEvaluationResults[idx];
      return { 
        questionText: q.question, 
        isCorrect: aiEval ? aiEval.is_correct : false, // Validasi kebenaran berdasarkan keputusan cerdas AI
        concept: q.concept || "Konsep Dasar", 
        cognitiveLevel: q.cognitiveLevel || "C3"
      };
    });

    try {
      await fetch(`/api/exercises/${subtopicId}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: avg,
          userAnswers: userAnswersData,
          detailedAnalysis: detailedAnalysis
        })
      });

      if (topicId) {
        router.push(`/learn/${topicId}?view=latihan&subtopicId=${subtopicId}`);
      } else {
        alert(`Latihan Selesai! Skor Anda: ${avg}%`);
      }
    } catch (e) {
      alert("Terjadi kesalahan saat menyimpan data.");
      setIsSaving(false);
    }
  };

  if (isReviewMode) {
    return (
      <div className="min-h-screen bg-[#09090b] text-gray-100 font-sans p-4 md:p-8 pb-24">
        <div className="max-w-3xl mx-auto">
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
                <span className="text-2xl font-black text-emerald-400">{finalDBScore}%</span>
              </div>
              <button onClick={handleRetake} className="flex flex-col items-center justify-center bg-red-500/10 text-red-400 border border-red-500/20 p-3 rounded-xl hover:bg-red-500/20 transition-all">
                <FiRotateCcw size={20} className="mb-1" />
                <span className="text-[10px] font-bold uppercase">Ulangi</span>
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {questions.map((q, idx) => {
              const isMC = q.type.toLowerCase().includes("ganda");
              const pData = parseQuestionData(q.question);
              const uAnswer = userAnswersData[idx] || "";
              
              let displayAnswer = uAnswer;
              if (isMC) {
                const parts = uAnswer.split(" | Coretan: ");
                const optionOnly = parts[0] || "";
                displayAnswer = parts.length > 1 ? `Memilih: ${optionOnly}\n\nJejak Pemikiran:\n${parts[1]}` : uAnswer;
              }

              return (
                <div key={q.id} className="bg-gray-800/80 p-6 md:p-8 rounded-2xl border border-gray-700 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-gray-400">Soal {idx + 1} <span className="ml-2 text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-md">{q.cognitiveLevel}</span></span>
                    <span className="text-xs font-bold px-3 py-1 bg-zinc-700 rounded-full text-zinc-300 uppercase">{q.type}</span>
                  </div>
                  <p className="text-lg md:text-xl text-white font-medium whitespace-pre-wrap leading-relaxed mb-6">{pData.mainText}</p>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="bg-zinc-900/60 p-5 rounded-xl border border-white/5">
                      <span className="block text-xs text-zinc-500 font-bold uppercase mb-2">Jawaban Tersimpan Anda:</span>
                      <p className="text-white text-base md:text-lg mb-4 whitespace-pre-wrap">{displayAnswer || <span className="italic text-zinc-600">Tidak dijawab</span>}</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <span className="block text-xs text-purple-400 font-bold uppercase mb-2">Penjelasan Tutor AI:</span>
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

  return (
    <div className="flex flex-col min-h-screen p-6 md:p-8 pb-24 max-w-3xl mx-auto text-gray-100 font-sans">
      <div className="mb-8 flex justify-between items-center text-base md:text-lg border-b border-gray-700 pb-4">
        <span className="text-gray-400 font-medium">Soal {currentIndex + 1} dari {questions.length}</span>
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
              <div className="flex flex-col gap-6">
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-dashed border-zinc-600 focus-within:border-blue-500 transition-colors">
                  <label className="flex items-center gap-2 text-sm font-bold text-blue-400 mb-3 uppercase tracking-wider">
                    <FiEdit3 /> Ruang Coretan & Logika
                  </label>
                  <textarea
                    value={scratchpadText}
                    onChange={(e) => setScratchpadText(e.target.value)}
                    placeholder="Wajib diisi! AI akan membaca coretan ini untuk membuktikan kamu tidak sekadar menebak A/B/C/D."
                    className="w-full min-h-[100px] bg-transparent text-white placeholder-zinc-600 focus:outline-none resize-y"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  {parsedData.options ? (
                    parsedData.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedPgOption(opt.id)}
                        className={`p-4 md:p-5 rounded-xl border-2 text-left transition-all text-lg ${selectedPgOption === opt.id ? "border-blue-500 bg-blue-900/40 text-blue-100 shadow-[0_0_20px_rgba(59,130,246,0.2)]" : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50"}`}>
                        <span className="font-bold mr-2 text-blue-400">{opt.id}.</span> {opt.text}
                      </button>
                    ))
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {["A", "B", "C", "D"].map((opt) => (
                        <button key={opt} onClick={() => setSelectedPgOption(opt)} className={`p-4 md:p-5 rounded-xl border-2 font-bold transition-all text-lg ${selectedPgOption === opt ? "border-blue-500 bg-blue-900/40 text-blue-100" : "border-gray-700 bg-gray-800 text-gray-300"}`}>
                          Opsi {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <textarea
                value={essayAnswer}
                onChange={(e) => setEssayAnswer(e.target.value)}
                placeholder="Ketik logika atau hitungan Anda di sini..."
                className="w-full min-h-50 p-5 md:p-6 bg-gray-800 border-2 border-gray-700 rounded-xl text-gray-100 text-lg md:text-xl placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all resize-y"
              />
            )}
            <Button
              onClick={handleSubmit}
              disabled={isEvaluating || (isMultipleChoice ? (!selectedPgOption || scratchpadText.trim().length < 3) : !essayAnswer.trim())}
              className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white p-7 rounded-xl font-bold text-lg md:text-xl transition-colors disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed">
              {isEvaluating ? <FiLoader className="animate-spin mx-auto" size={24} /> : (isMultipleChoice && (!selectedPgOption || scratchpadText.trim().length < 3)) ? "Isi Ruang Coretan & Pilih Opsi" : "Periksa Logika Jawaban"}
            </Button>
          </>
        ) : (
          <div className="bg-gray-800 p-6 md:p-8 rounded-2xl border border-gray-700 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
             <div className="flex justify-between items-center mb-6">
                <div className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm md:text-base border-2 ${aiEvaluationResults[currentIndex]?.is_correct ? "bg-green-500/10 text-green-400 border-green-500/40" : "bg-red-500/10 text-red-400 border-red-500/40"}`}>
                   {aiEvaluationResults[currentIndex]?.is_correct ? "✅ Jejak Kognitif Valid" : "❌ Terdeteksi Bug Logika"}
                </div>
                <div className="text-right">
                   <span className="block text-xs text-gray-400 font-bold uppercase">Skor AI Evaluator</span>
                   <span className={`text-2xl font-black ${aiEvaluationResults[currentIndex]?.score >= 80 ? 'text-green-400' : 'text-amber-400'}`}>{aiEvaluationResults[currentIndex]?.score}%</span>
                </div>
             </div>

             <div className="bg-purple-900/10 border border-purple-500/20 p-5 rounded-xl mb-8">
                <span className="block text-xs text-purple-400 font-bold uppercase mb-2">Diagnosis Coretan & Jawaban (AI):</span>
                <p className="text-gray-200 leading-relaxed text-base md:text-lg">{aiEvaluationResults[currentIndex]?.feedback}</p>
             </div>

             <div className="flex items-center gap-3 mb-4 mt-2">
               <div className="w-2 h-7 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
               <h3 className="font-extrabold text-blue-400 text-xl tracking-wide uppercase">Kunci Jawaban Resmi</h3>
             </div>
             <p className="font-bold text-lg mb-8 text-white bg-gray-900 p-4 md:p-5 rounded-xl border border-gray-700 shadow-inner">{currentQuestion.answer}</p>
          </div>
        )}
      </div>

      {isSubmitted && currentIndex < questions.length - 1 && (
        <Button onClick={handleNext} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-7 rounded-xl font-bold text-lg md:text-xl mt-2 shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02]">Lanjut ke Soal Selanjutnya</Button>
      )}

      {isSubmitted && currentIndex === questions.length - 1 && (
        <Button onClick={handleFinish} disabled={isSaving} className="w-full bg-purple-600 hover:bg-purple-500 text-white p-7 rounded-xl font-bold text-lg md:text-xl mt-2 shadow-lg shadow-purple-900/20 transition-all hover:scale-[1.02]">
          {isSaving ? <FiLoader className="animate-spin mx-auto" /> : "Selesai Latihan & Lihat Analisis Trace"}
        </Button>
      )}
    </div>
  );
}