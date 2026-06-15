/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation"; 
import { Button } from "@/components/ui/button";
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiRotateCcw, FiLoader, FiEdit3, FiCpu, FiAlertTriangle, FiArrowRight } from "react-icons/fi";
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
  const [userId, setUserId] = useState<string>("user-id-placeholder");
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

    const detailedAnalysis = questions.map((q, idx) => {
      const aiEval = aiEvaluationResults[idx];
      return { 
        exerciseId: q.id,
        questionText: q.question, 
        isCorrect: aiEval ? aiEval.is_correct : false, 
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

  if (isLoading) return <div className="flex justify-center items-center h-screen bg-[#FAFAFC]"><FiLoader className="animate-spin text-[#6D28D9]" size={32} /></div>;
  if (!questions.length) return <div className="p-10 text-center text-gray-500 bg-[#FAFAFC] min-h-screen">Belum ada soal untuk materi ini.</div>;

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
      <div className="min-h-screen bg-[#FAFAFC] text-gray-900 font-sans p-4 md:p-10 pb-32 selection:bg-[#6D28D9] selection:text-white">
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
            <div>
              <button onClick={() => router.push(`/learn/${topicId}?view=latihan&subtopicId=${subtopicId}`)} className="flex items-center gap-2 text-gray-500 hover:text-[#6D28D9] font-bold mb-4 transition-colors">
                <FiArrowLeft /> Kembali ke Dashboard
              </button>
              <h1 className="text-3xl font-extrabold font-heading text-gray-900">Laporan Knowledge Tracing</h1>
              <p className="text-gray-500 mt-2 text-sm">Review detail hasil pengerjaan dan jejak kognitif Anda.</p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-center bg-gray-50 px-6 py-4 rounded-[20px] border border-gray-100 shadow-inner">
                <span className="block text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Skor Akhir</span>
                <span className={`text-3xl font-extrabold font-heading ${finalDBScore >= 80 ? 'text-emerald-500' : finalDBScore >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                  {finalDBScore}%
                </span>
              </div>
              <button onClick={handleRetake} className="flex flex-col items-center justify-center bg-white text-gray-500 border border-gray-200 w-20 h-20 rounded-[20px] hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500 transition-all shadow-sm">
                <FiRotateCcw size={22} className="mb-1.5" />
                <span className="text-[10px] font-bold uppercase">Ulangi</span>
              </button>
            </div>
          </div>

          {/* Skenario B: WARP PORTAL */}
          {foundationalGaps.length > 0 && (
            <div className="bg-rose-50 p-8 rounded-[32px] border border-rose-200 shadow-sm relative overflow-hidden">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/10 blur-[40px] rounded-full pointer-events-none"></div>
               <h3 className="text-xl md:text-2xl font-black font-heading text-rose-700 flex items-center gap-3 mb-3 relative z-10">
                 <FiAlertTriangle size={24} /> Foundational Gap Terdeteksi!
               </h3>
               <p className="text-rose-900/80 mb-6 font-medium text-sm md:text-base relative z-10">
                 AI mendeteksi fondasi yang rapuh pada konsep prasyaratmu. Melangkah maju sekarang akan sangat menyulitkanmu.
               </p>
               <div className="space-y-3 relative z-10">
                 {foundationalGaps.map((gap: any, idx: number) => (
                    <button key={idx} className="w-full text-left p-5 bg-white rounded-[20px] border border-rose-200 hover:border-rose-400 hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group">
                       <div>
                         <span className="block text-[11px] text-rose-500 font-bold uppercase tracking-wider mb-1">Bug Prasyarat Terdeteksi:</span>
                         <span className="font-bold font-heading text-lg text-gray-900">{gap.cognitiveBug}</span>
                       </div>
                       <span className="bg-rose-500 group-hover:bg-rose-600 text-white px-5 py-2.5 text-sm rounded-xl font-bold transition-all shadow-sm">
                         Warp Kembali 🚀
                       </span>
                    </button>
                 ))}
               </div>
            </div>
          )}

          {/* Skenario A: SOCRATES CHAT */}
          {localBugs.length > 0 && (
            <div className="bg-[#FFF8E7] p-8 rounded-[32px] border border-[#FF7849]/20 shadow-sm relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#FF7849]/10 blur-[40px] rounded-full pointer-events-none"></div>
              <h3 className="font-extrabold font-heading text-[#FF7849] text-xl md:text-2xl flex items-center gap-3 mb-3 relative z-10">
                <span className="text-2xl">🕵️</span> Kesalahan Spesifik (Local Bugs)
              </h3>
              <p className="text-sm md:text-base text-gray-700 mb-6 relative z-10">Pemahamanmu sedikit tersandung pada bagian ini. Mari diskusi dengan AI Tutor untuk meluruskan logika tersebut.</p>
              
              <div className="space-y-3 relative z-10">
                {localBugs.map((bug: any, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveSocratesBug(bug)}
                    className="w-full text-left p-5 bg-white rounded-[20px] border border-[#FF7849]/20 hover:border-[#FF7849] transition shadow-sm hover:shadow-md group"
                  >
                    <span className="block text-[11px] text-[#FF7849] font-bold mb-1 uppercase tracking-wider">Diskusi Socrates (Micro-Cheatsheet Reward):</span>
                    <strong className="text-gray-900 font-heading text-lg group-hover:text-[#FF7849] transition-colors">{bug.cognitiveBug}</strong>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Render Modal Chat Socrates */}
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
          <div className="space-y-6 pt-6">
            <h3 className="font-extrabold font-heading text-2xl text-gray-900 border-b border-gray-200 pb-4">Riwayat Detail Evaluasi</h3>
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
                <div key={q.id} className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-extrabold font-heading text-gray-900 text-lg">Soal {idx + 1}</span>
                    <span className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider ${aiEval.isCorrect ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                      {aiEval.isCorrect ? "✅ Benar" : "❌ Salah"}
                    </span>
                  </div>
                  <p className="text-gray-800 mb-6 font-medium text-base md:text-lg leading-relaxed whitespace-pre-wrap">{pData.mainText}</p>
                  <div className="bg-gray-50 p-5 rounded-[16px] border border-gray-200">
                    <span className="block text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-2">Jejak Jawaban Anda:</span>
                    <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed font-mono">{displayAnswer}</p>
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
    <div className="flex flex-col min-h-screen p-6 md:p-10 pb-32 max-w-4xl mx-auto bg-[#FAFAFC] text-gray-900 font-sans selection:bg-[#6D28D9] selection:text-white animate-in fade-in duration-500">
      
      {/* HEADER PROGRESS */}
      <div className="mb-8 flex justify-between items-center bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center font-extrabold font-heading text-gray-400">
            {currentIndex + 1}
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Progress</div>
            <div className="text-sm font-bold text-gray-900">Soal {currentIndex + 1} dari {questions.length}</div>
          </div>
        </div>
        <span className="uppercase font-bold text-[#6D28D9] bg-[#6D28D9]/10 border border-[#6D28D9]/20 px-4 py-2 rounded-xl text-[11px] tracking-wider">
          {currentQuestion.type}
        </span>
      </div>

      {/* QUESTION BOX */}
      <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] mb-8 border border-gray-100">
        <p className="text-xl md:text-2xl whitespace-pre-wrap font-semibold font-heading text-gray-900 leading-relaxed">{parsedData.mainText}</p>
      </div>

      <div className="mb-8 grow">
        {!isSubmitted ? (
          <>
            {isMultipleChoice ? (
              <div className="flex flex-col gap-8">
                {/* SCRATCHPAD */}
                <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-sm focus-within:border-[#6D28D9]/50 focus-within:ring-4 focus-within:ring-[#6D28D9]/10 transition-all">
                  <label className="flex items-center gap-2 text-sm font-bold text-[#6D28D9] mb-4 uppercase tracking-wider">
                    <FiEdit3 size={18} /> Ruang Coretan & Logika
                  </label>
                  <textarea
                    value={scratchpadText}
                    onChange={(e) => setScratchpadText(e.target.value)}
                    placeholder="Wajib diisi! Jelaskan proses berpikirmu di sini agar AI dapat melacak jejak kognitifmu..."
                    className="w-full min-h-[120px] bg-transparent text-gray-900 placeholder-gray-400 text-base md:text-lg focus:outline-none resize-y"
                  />
                </div>
                
                {/* OPTIONS */}
                <div className="flex flex-col gap-4">
                  {parsedData.options ? (
                    parsedData.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedPgOption(opt.id)}
                        className={`p-5 rounded-[20px] border-2 text-left text-base md:text-lg transition-all duration-200 ${
                          selectedPgOption === opt.id 
                            ? "border-[#6D28D9] bg-[#6D28D9]/5 text-[#6D28D9] shadow-sm font-bold" 
                            : "border-gray-200 bg-white text-gray-700 hover:border-[#6D28D9]/30 hover:bg-gray-50"
                        }`}>
                        <span className={`font-extrabold mr-3 ${selectedPgOption === opt.id ? "text-[#6D28D9]" : "text-gray-400"}`}>{opt.id}.</span> 
                        {opt.text}
                      </button>
                    ))
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {["A", "B", "C", "D"].map((opt) => (
                        <button 
                          key={opt} 
                          onClick={() => setSelectedPgOption(opt)} 
                          className={`p-5 rounded-[20px] border-2 font-bold text-lg transition-all ${
                            selectedPgOption === opt 
                              ? "border-[#6D28D9] bg-[#6D28D9]/5 text-[#6D28D9] shadow-sm" 
                              : "border-gray-200 bg-white text-gray-700 hover:border-[#6D28D9]/30"
                          }`}
                        >
                          Opsi {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ESSAY BOX */
              <div className="bg-white p-2 rounded-[24px] border border-gray-200 shadow-sm focus-within:border-[#6D28D9] focus-within:ring-4 focus-within:ring-[#6D28D9]/10 transition-all">
                <textarea
                  value={essayAnswer}
                  onChange={(e) => setEssayAnswer(e.target.value)}
                  placeholder="Ketik logika atau hitungan jawaban Anda di sini secara rinci..."
                  className="w-full min-h-[250px] p-6 bg-transparent text-gray-900 text-lg focus:outline-none resize-y placeholder-gray-400"
                />
              </div>
            )}
            
            <Button
              onClick={handleSubmit}
              disabled={isEvaluating || (isMultipleChoice ? (!selectedPgOption || scratchpadText.trim().length < 3) : !essayAnswer.trim())}
              className="w-full mt-10 bg-[#6D28D9] hover:bg-[#5b21b6] text-white p-8 rounded-[20px] font-bold text-lg shadow-[0_10px_30px_rgba(109,40,217,0.25)] transition-all hover:shadow-[0_15px_40px_rgba(109,40,217,0.35)] hover:-translate-y-1">
              {isEvaluating ? <span className="flex items-center gap-2"><FiLoader className="animate-spin" size={20} /> AI sedang menganalisis logika Anda...</span> : "Kirim & Periksa Logika"}
            </Button>
          </>
        ) : (
          /* ==========================================
             EVALUATION RESULT BOX
             ========================================== */
          <div className="bg-white p-8 md:p-10 rounded-[32px] border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-8 duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-gray-100 pb-6">
                <div className={`px-5 py-2.5 rounded-xl font-bold border-2 flex items-center gap-2 ${aiEvaluationResults[currentIndex]?.is_correct ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-rose-50 text-rose-600 border-rose-200"}`}>
                   {aiEvaluationResults[currentIndex]?.is_correct ? <><FiCheckCircle size={20}/> Logika Valid</> : <><FiXCircle size={20}/> Terdeteksi Bug Logika</>}
                </div>
                <div className="text-left md:text-right flex items-center gap-4 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100">
                   <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm"><FiCpu size={20}/></div>
                   <div>
                     <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest">Skor AI Evaluator</span>
                     <span className={`text-2xl font-black font-heading ${aiEvaluationResults[currentIndex]?.score >= 80 ? 'text-emerald-500' : aiEvaluationResults[currentIndex]?.score >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                       {aiEvaluationResults[currentIndex]?.score}%
                     </span>
                   </div>
                </div>
             </div>

             <div className="bg-[#6D28D9]/5 border border-[#6D28D9]/10 p-6 md:p-8 rounded-[24px] mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#6D28D9]"></div>
                <span className="flex items-center gap-2 text-[11px] text-[#6D28D9] font-bold uppercase tracking-wider mb-3">
                  <FiCpu size={14} /> Diagnosis AI Trace:
                </span>
                <p className="text-gray-800 text-base md:text-lg leading-relaxed">{aiEvaluationResults[currentIndex]?.feedback}</p>
             </div>

             <div className="bg-emerald-50/50 p-6 md:p-8 rounded-[24px] border border-emerald-100">
               <div className="flex items-center gap-2 mb-3">
                 <h3 className="font-extrabold font-heading text-emerald-700 text-lg uppercase tracking-wide">Kunci Jawaban Resmi</h3>
               </div>
               <p className="font-semibold text-lg text-emerald-900 whitespace-pre-wrap">{currentQuestion.answer}</p>
             </div>
          </div>
        )}
      </div>

      {isSubmitted && currentIndex < questions.length - 1 && (
        <Button onClick={handleNext} className="w-full bg-gray-900 hover:bg-black text-white p-8 rounded-[20px] font-bold text-lg mt-4 shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
          Lanjut ke Soal Selanjutnya <FiArrowRight size={20} />
        </Button>
      )}

      {isSubmitted && currentIndex === questions.length - 1 && (
        <Button onClick={handleFinish} disabled={isSaving} className="w-full bg-gradient-to-r from-[#6D28D9] to-[#FF7849] hover:from-[#5b21b6] hover:to-[#e06336] text-white p-8 rounded-[20px] font-extrabold text-lg mt-4 shadow-[0_15px_30px_rgba(109,40,217,0.3)] hover:shadow-[0_20px_40px_rgba(109,40,217,0.4)] hover:-translate-y-1 transition-all">
          {isSaving ? <span className="flex items-center gap-2"><FiLoader className="animate-spin" size={20} /> Menyimpan Jejak Kognitif...</span> : "Selesai Latihan & Lihat Analisis Trace"}
        </Button>
      )}
    </div>
  );
}