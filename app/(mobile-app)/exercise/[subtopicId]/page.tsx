/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation"; 
import { Button } from "@/components/ui/button";
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiRotateCcw, FiLoader, FiEdit3 } from "react-icons/fi";
import { SocratesChatModal } from "@/components/chat/SocratesChatModal";

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

  // -- States --
  const [topicId, setTopicId] = useState<string>("");
  const [userId, setUserId] = useState<string>("user-id-placeholder"); // Sebaiknya ambil dari Context/Session
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
  const [dbDetailedAnalysis, setDbDetailedAnalysis] = useState<any[]>([]);

  // State untuk Adaptive Learning (Socrates / Warp Portal)
  const [activeSocratesBug, setActiveSocratesBug] = useState<any | null>(null);

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
          setDbDetailedAnalysis(dbResultData.result.detailedAnalysis || []);
          if (dbResultData.result.userId) setUserId(dbResultData.result.userId);
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
    if (confirm("Ulangi latihan? Nilai dan riwayat sebelumnya akan dihapus.")) {
      setIsLoading(true);
      await fetch(`/api/exercises/${subtopicId}/result`, { method: "DELETE" }); 
      
      setIsReviewMode(false);
      setCurrentIndex(0);
      setScores([]);
      setUserAnswersData([]);
      setAiEvaluationResults([]);
      setDbDetailedAnalysis([]);
      setIsSubmitted(false);
      setSelectedPgOption("");
      setEssayAnswer("");
      setScratchpadText("");
      setIsLoading(false);
    }
  };

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
          scratchpad: isMultipleChoice ? scratchpadText : essayAnswer,
          type: currentQuestion.type
        })
      });
      
      const resData = await res.json();
      const evalData = resData.evaluation ? resData.evaluation : resData;
      
      setIsSubmitted(true);
      setScores((prev) => { const newScores = [...prev]; newScores[currentIndex] = evalData.score || 0; return newScores; });
      setUserAnswersData((prev) => { const newAns = [...prev]; newAns[currentIndex] = answeredText; return newAns; });
      setAiEvaluationResults((prev) => { const newEvals = [...prev]; newEvals[currentIndex] = evalData; return newEvals; });

      setAiEvaluationResults((prev) => { 
        const newEvals = [...prev]; 
        newEvals[currentIndex] = {
           score: evalData.score || 0,
           is_correct: evalData.is_correct || false,
           feedback: evalData.feedback || "Tidak ada feedback dari AI.",
           cognitiveBug: evalData.cognitiveBug || null,
           resolutionType: evalData.resolutionType || "NONE",
           foundationalTopicTarget: evalData.foundationalTopicTarget || null
        }; 
        return newEvals; 
      });
      
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

    // Mapping hasil AI ke format DetailedAnalysis untuk DB
    const detailedAnalysis = questions.map((q, idx) => {
      const aiEval = aiEvaluationResults[idx];
      return { 
        exerciseId: q.id,
        questionText: q.question, 
        isCorrect: aiEval ? aiEval.is_correct : false, 
        // Cadangkan ke q.concept (Misal: Sifat Komutatif) jika AI me-return null
        cognitiveBug: aiEval?.cognitiveBug && aiEval.cognitiveBug !== "LOCAL_BUG" ? aiEval.cognitiveBug : (q.concept || "Prinsip Materi"), 
        concept: q.concept || "Konsep Dasar",
        resolutionType: aiEval?.resolutionType || "LOCAL_BUG",
        foundationalTopicTarget: aiEval?.foundationalTopicTarget || null
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

      // Redirect ke halaman Analisis Learn
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

  if (isLoading) return <div className="flex justify-center items-center h-screen bg-[#09090b]"><FiLoader className="animate-spin text-blue-500" size={32} /></div>;
  if (!questions.length) return <div className="p-4 text-center text-gray-400 bg-[#09090b] min-h-screen">Belum ada soal untuk materi ini.</div>;

  const currentQuestion = questions[currentIndex];
  const isMultipleChoice = currentQuestion.type.toLowerCase().includes("ganda");
  const parsedData = parseQuestionData(currentQuestion.question);

  // ==========================================
  // REVIEW MODE (HASIL DIAGNOSIS SKENARIO A & B)
  // ==========================================
  if (isReviewMode) {
    const localBugs = dbDetailedAnalysis.filter((item: any) => item.resolutionType === "LOCAL_BUG" && !item.isCorrect);
    const foundationalGaps = dbDetailedAnalysis.filter((item: any) => item.resolutionType === "FOUNDATIONAL_GAP" && !item.isCorrect);

    return (
      <div className="min-h-screen bg-[#09090b] text-gray-100 font-sans p-4 md:p-8 pb-24">
        <div className="max-w-3xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-blue-900/20 p-6 rounded-2xl border border-blue-500/30">
            <div>
              <button onClick={() => router.push(`/learn/${topicId}?view=latihan&subtopicId=${subtopicId}`)} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold mb-2 transition-colors">
                <FiArrowLeft /> Kembali ke Dashboard
              </button>
              <h1 className="text-2xl font-black text-white">Laporan Knowledge Tracing</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center bg-zinc-900/80 px-6 py-3 rounded-xl border border-white/10 shadow-inner">
                <span className="block text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">Skor Akhir</span>
                <span className={`text-2xl font-black ${finalDBScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>{finalDBScore}%</span>
              </div>
              <button onClick={handleRetake} className="flex flex-col items-center justify-center bg-red-500/10 text-red-400 border border-red-500/20 p-3 rounded-xl hover:bg-red-500/20 transition-all">
                <FiRotateCcw size={20} className="mb-1" />
                <span className="text-[10px] font-bold uppercase">Ulangi</span>
              </button>
            </div>
          </div>

          {/* Skenario B: WARP PORTAL */}
          {foundationalGaps.length > 0 && (
            <div className="mb-8 bg-purple-900/30 p-6 rounded-2xl border-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
               <h3 className="text-xl font-black text-purple-300 flex items-center gap-2 mb-2">🌌 Warp Portal Terbuka!</h3>
               <p className="text-purple-200 mb-4">
                 AI mendeteksi fondasi yang rapuh pada konsep dasarmu. Melangkah maju sekarang akan sangat menyulitkanmu.
               </p>
               <div className="space-y-3">
                 {foundationalGaps.map((gap: any, idx: number) => (
                    <button key={idx} className="w-full text-left p-4 bg-purple-950/50 rounded-xl border border-purple-500/50 hover:bg-purple-800 transition text-purple-100 flex justify-between items-center">
                       <div>
                         <span className="block text-xs text-purple-400 font-bold uppercase">Bug Terdeteksi:</span>
                         <span className="font-bold">{gap.cognitiveBug}</span>
                       </div>
                       <span className="bg-purple-600 px-3 py-1 text-xs rounded-full font-bold">Warp Kembali 🚀</span>
                    </button>
                 ))}
               </div>
            </div>
          )}

          {/* Skenario A: SOCRATES CHAT */}
          {localBugs.length > 0 && (
            <div className="mb-8 bg-orange-950/30 p-6 rounded-2xl border border-orange-500/40">
              <h3 className="font-bold text-orange-400 text-lg flex items-center gap-2 mb-2">🕵️ Kesalahan Spesifik (Local Bugs)</h3>
              <p className="text-sm text-gray-400 mb-4">Pemahamanmu sedikit tersandung. Mari diskusi dengan AI untuk meluruskan logika ini.</p>
              
              <div className="space-y-3">
                {localBugs.map((bug: any, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveSocratesBug(bug)}
                    className="w-full text-left p-4 bg-zinc-900/80 rounded-xl border border-zinc-700 hover:border-orange-500 transition shadow-md"
                  >
                    <span className="block text-xs text-zinc-500 font-bold mb-1">Diskusi Socrates (Micro-Cheatsheet Reward):</span>
                    <strong className="text-orange-200">{bug.cognitiveBug}</strong>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Render Modal Chat Socrates (Jika Sedang Aktif) */}
          {activeSocratesBug && (
            <SocratesChatModal 
               bugData={activeSocratesBug}
               userId={userId}
               subtopicId={subtopicId}
               onClose={() => setActiveSocratesBug(null)}
               onComplete={() => {
                 alert("Micro-cheatsheet berhasil ditambahkan di Ruang Belajar!");
               }}
            />
          )}

          {/* List Jawaban Detail */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-gray-300 border-b border-gray-800 pb-2">Riwayat Detail Soal</h3>
            {questions.map((q, idx) => {
              const uAnswer = userAnswersData[idx] || "";
              const aiEval = dbDetailedAnalysis[idx] || {};
              const pData = parseQuestionData(q.question);
              let displayAnswer = uAnswer;

              if (q.type.toLowerCase().includes("ganda")) {
                const parts = uAnswer.split(" | Coretan: ");
                displayAnswer = parts.length > 1 ? `Memilih: ${parts[0]}\nJejak: ${parts[1]}` : uAnswer;
              }

              return (
                <div key={q.id} className="bg-gray-800/60 p-6 rounded-xl border border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-gray-400">Soal {idx + 1}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${aiEval.isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {aiEval.isCorrect ? "Benar" : "Salah"}
                    </span>
                  </div>
                  <p className="text-gray-200 mb-4">{pData.mainText}</p>
                  <div className="bg-zinc-900/50 p-4 rounded-lg border border-white/5 mb-4">
                    <span className="block text-xs text-zinc-500 uppercase mb-1">Jawaban Anda:</span>
                    <p className="text-gray-300 whitespace-pre-wrap text-sm">{displayAnswer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MODE MENGERJAKAN SOAL
  // ==========================================
  return (
    <div className="flex flex-col min-h-screen p-6 md:p-8 pb-24 max-w-3xl mx-auto text-gray-100 font-sans">
      <div className="mb-8 flex justify-between items-center border-b border-gray-700 pb-4">
        <span className="text-gray-400 font-medium">Soal {currentIndex + 1} dari {questions.length}</span>
        <span className="uppercase font-bold text-blue-400 bg-blue-900/30 px-4 py-1.5 rounded-full text-sm">
          {currentQuestion.type}
        </span>
      </div>

      <div className="bg-gray-800 p-6 rounded-2xl shadow-xl mb-8 border border-gray-700">
        <p className="text-xl md:text-2xl whitespace-pre-wrap font-medium">{parsedData.mainText}</p>
      </div>

      <div className="mb-8 grow">
        {!isSubmitted ? (
          <>
            {isMultipleChoice ? (
              <div className="flex flex-col gap-6">
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-dashed border-zinc-600">
                  <label className="flex items-center gap-2 text-sm font-bold text-blue-400 mb-3 uppercase">
                    <FiEdit3 /> Ruang Coretan & Logika
                  </label>
                  <textarea
                    value={scratchpadText}
                    onChange={(e) => setScratchpadText(e.target.value)}
                    placeholder="Wajib diisi! AI akan membaca coretan ini..."
                    className="w-full min-h-[100px] bg-transparent text-white placeholder-zinc-600 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  {parsedData.options ? (
                    parsedData.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedPgOption(opt.id)}
                        className={`p-4 rounded-xl border-2 text-left text-lg ${selectedPgOption === opt.id ? "border-blue-500 bg-blue-900/40 text-blue-100" : "border-gray-700 bg-gray-800 text-gray-300"}`}>
                        <span className="font-bold text-blue-400">{opt.id}.</span> {opt.text}
                      </button>
                    ))
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {["A", "B", "C", "D"].map((opt) => (
                        <button key={opt} onClick={() => setSelectedPgOption(opt)} className={`p-4 rounded-xl border-2 font-bold text-lg ${selectedPgOption === opt ? "border-blue-500 bg-blue-900/40 text-blue-100" : "border-gray-700 bg-gray-800"}`}>Opsi {opt}</button>
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
                className="w-full min-h-50 p-5 bg-gray-800 border-2 border-gray-700 rounded-xl text-white text-lg focus:outline-none"
              />
            )}
            <Button
              onClick={handleSubmit}
              disabled={isEvaluating || (isMultipleChoice ? (!selectedPgOption || scratchpadText.trim().length < 3) : !essayAnswer.trim())}
              className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white p-7 rounded-xl font-bold text-lg">
              {isEvaluating ? <FiLoader className="animate-spin mx-auto" /> : "Periksa Logika Jawaban"}
            </Button>
          </>
        ) : (
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-2xl">
             <div className="flex justify-between items-center mb-6">
                <div className={`px-4 py-2 rounded-xl font-bold border-2 ${aiEvaluationResults[currentIndex]?.is_correct ? "bg-green-500/10 text-green-400 border-green-500" : "bg-red-500/10 text-red-400 border-red-500"}`}>
                   {aiEvaluationResults[currentIndex]?.is_correct ? "✅ Logika Valid" : "❌ Terdeteksi Bug Logika"}
                </div>
                <div className="text-right">
                   <span className="block text-xs text-gray-400 font-bold uppercase">Skor AI Evaluator</span>
                   <span className={`text-2xl font-black ${aiEvaluationResults[currentIndex]?.score >= 80 ? 'text-green-400' : 'text-amber-400'}`}>{aiEvaluationResults[currentIndex]?.score}%</span>
                </div>
             </div>

             <div className="bg-purple-900/10 border border-purple-500/20 p-5 rounded-xl mb-8">
                <span className="block text-xs text-purple-400 font-bold uppercase mb-2">Diagnosis (AI):</span>
                <p className="text-gray-200">{aiEvaluationResults[currentIndex]?.feedback}</p>
             </div>

             <div className="flex items-center gap-3 mb-4 mt-2">
               <h3 className="font-extrabold text-blue-400 text-xl uppercase">Kunci Jawaban Resmi</h3>
             </div>
             <p className="font-bold text-lg mb-8 text-white bg-gray-900 p-4 rounded-xl border border-gray-700">{currentQuestion.answer}</p>
          </div>
        )}
      </div>

      {isSubmitted && currentIndex < questions.length - 1 && (
        <Button onClick={handleNext} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-7 rounded-xl font-bold text-xl mt-2">Lanjut ke Soal Selanjutnya</Button>
      )}

      {isSubmitted && currentIndex === questions.length - 1 && (
        <Button onClick={handleFinish} disabled={isSaving} className="w-full bg-purple-600 hover:bg-purple-500 text-white p-7 rounded-xl font-bold text-xl mt-2">
          {isSaving ? <FiLoader className="animate-spin mx-auto" /> : "Selesai Latihan & Lihat Analisis Trace"}
        </Button>
      )}
    </div>
  );
}