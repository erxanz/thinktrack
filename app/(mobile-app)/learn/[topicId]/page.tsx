"use client";

import { useEffect, useState, use } from "react";
import {
  FiBookOpen,
  FiChevronRight,
  FiLoader,
  FiPieChart,
  FiTarget,
  FiTrendingUp,
  FiAward,
  FiList,
  FiEye,
  FiAlertTriangle
} from "react-icons/fi";
import { FaGem } from "react-icons/fa"; 
import Link from "next/link";

function extractConcept(questionText: string): string {
  if (!questionText) return "Konsep Materi";
  let line = questionText.split('\n')[0].replace(/^[0-9.)\s]*/g, '').trim();
  const indexOpsi = line.search(/[A-D][.)]/);
  if (indexOpsi !== -1) {
    line = line.substring(0, indexOpsi).trim();
  }
  return line.length > 60 ? line.substring(0, 60) + "..." : line;
}

export default function LearnPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = use(params);
  const [viewMode, setViewMode] = useState<"materi" | "latihan">("materi");

  const [topicTitle, setTopicTitle] = useState<string>("");
  const [subtopics, setSubtopics] = useState<Array<{ id: string; title: string; level: string; content: string }>>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedSubtopicId, setSelectedSubtopicId] = useState<string | null>(null);
  const [dbResults, setDbResults] = useState<any[]>([]);

  useEffect(() => {
    // PERBAIKAN TYPO: Menambahkan URLSearchParams dengan benar
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("view") === "latihan") setViewMode("latihan");
    const subId = urlParams.get("subtopicId");
    if (subId) setSelectedSubtopicId(subId);

    const load = async () => {
      try {
        setLoadingData(true);
        const res = await fetch(`/api/topics/${topicId}`);
        if (!res.ok) throw new Error("Gagal memuat topik");
        const data = await res.json();
        setTopicTitle(data?.topic?.title || "");
        setSubtopics(data?.subtopics || []);

        const resultsRes = await fetch(`/api/topics/${topicId}/results`);
        const resultsData = await resultsRes.json();
        if (resultsData.results) {
          setDbResults(resultsData.results);
        }

      } catch {
        setTopicTitle("");
        setSubtopics([]);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [topicId]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-56 font-sans">
      
      {/* HEADER TABS */}
      <div className="sticky top-0 z-30 bg-[#09090b]/95 backdrop-blur border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="flex">
            <button
              onClick={() => setViewMode("materi")}
              className={`flex-1 py-4 text-sm font-bold transition-all ${viewMode === "materi" ? "border-b-2 border-blue-500 text-blue-400 bg-blue-500/5" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"}`}>
              <div className="flex items-center justify-center gap-2"><FiBookOpen size={16} /> Peta Materi</div>
            </button>
            <button
              onClick={() => { setViewMode("latihan"); setSelectedSubtopicId(null); window.history.pushState({}, "", `/learn/${topicId}?view=latihan`); }}
              className={`flex-1 py-4 text-sm font-bold transition-all ${viewMode === "latihan" ? "border-b-2 border-purple-500 text-purple-400 bg-purple-500/5" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"}`}>
              <div className="flex items-center justify-center gap-2"><FiPieChart size={16} /> Analisis AI</div>
            </button>
          </div>
        </div>
      </div>

      {/* MODE MATERI */}
      {viewMode === "materi" && (
        <div className="max-w-6xl mx-auto p-5 mt-4 md:mt-8">
          <div className="flex flex-col md:flex-row items-center relative gap-4 md:gap-0">
            <div className="md:w-5/12 w-full relative z-20 md:pr-8 lg:pr-14 mb-6 md:mb-0">
              <div className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl p-8 text-center shadow-xl shadow-black/40 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl" />
                <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-5 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                  <FaGem size={26} className="animate-pulse" />
                </div>
                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full inline-block mb-3">Topik Pembelajaran</span>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">{loadingData ? "Memuat..." : topicTitle || "Topik"}</h1>
                <p className="text-sm text-zinc-400 mt-4 leading-relaxed">Roadmap pembelajaran terstruktur yang di-dekomposisi khusus untukmu oleh AI.</p>
                <div className="hidden md:block absolute top-1/2 -right-8 lg:-right-14 w-8 lg:w-14 h-0.5 bg-blue-500/40" />
                <div className="hidden md:block absolute top-1/2 -right-8 lg:-right-14 w-2 h-2 -mt-1 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)] z-30" />
              </div>
            </div>

            <div className="md:w-7/12 w-full relative z-10 flex flex-col gap-4">
              <div className="hidden md:block absolute left-0 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500/10 via-blue-500/30 to-blue-500/10 -ml-px" />
              {loadingData ? (
                <div className="w-full rounded-2xl border border-white/5 bg-zinc-900/50 p-8 flex flex-col items-center justify-center gap-4 text-zinc-400 ml-0 md:ml-8 lg:ml-12">
                  <FiLoader className="animate-spin text-blue-500" size={28} /> Menyiapkan peta konsep...
                </div>
              ) : (
                subtopics.map((item, index) => (
                  <div key={item.id} className="relative group pl-0 md:pl-8 lg:pl-12">
                    <div className="hidden md:block absolute top-1/2 left-0 w-8 lg:w-12 h-0.5 bg-blue-500/20 group-hover:bg-blue-500/60 transition-colors" />
                    <div className="hidden md:block absolute top-1/2 left-0 w-1.5 h-1.5 mt-[-2.5px] -ml-0.5 rounded-full bg-zinc-700 group-hover:bg-blue-500 transition-colors" />

                    <Link href={`/materi-detail/${item.id}`} target="_blank" className="flex items-center gap-4 rounded-2xl border border-white/5 bg-zinc-900/50 p-4 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(59,130,246,0.1)] hover:border-blue-500/40 transition-all duration-300">
                      <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all"><FaGem size={20} /></div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-zinc-500 font-bold block mb-0.5 uppercase tracking-wider">Sub Bab {index + 1}</span>
                        <h3 className="font-semibold text-white text-base group-hover:text-blue-400 transition-colors truncate">{item.title}</h3>
                        <p className="text-sm text-zinc-400 truncate mt-0.5">{item.content}</p>
                      </div>
                      <div className="shrink-0 text-zinc-600 group-hover:text-blue-400 transition-colors group-hover:translate-x-1 duration-300"><FiChevronRight size={20} /></div>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODE ANALISIS */}
      {viewMode === "latihan" && (
        <div className="max-w-4xl mx-auto p-5 mt-4 md:mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
          
          {selectedSubtopicId === null ? (
            /* --- DAFTAR LIST SUB-BAB (DARI DATABASE) --- */
            <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-4"><FiList className="text-purple-400" size={24} /> <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Daftar Penguasaan Materi</h2></div>
              <p className="text-zinc-400 text-sm mb-8 leading-relaxed">Pilih sub-bab untuk melihat roadmap rekomendasi belajar kustom dari AI.</p>
              <div className="flex flex-col gap-4">
                {subtopics.map((item, index) => {
                  const currentDBResult = dbResults.find(r => r.subtopicId === item.id);
                  const scoreNum = currentDBResult ? currentDBResult.score : null;

                  return (
                    <button key={item.id} onClick={() => { setSelectedSubtopicId(item.id); window.history.pushState({}, "", `/learn/${topicId}?view=latihan&subtopicId=${item.id}`); }} className="w-full flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-zinc-900/40 p-5 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all text-left group">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 font-bold text-sm">{index + 1}</div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-white text-base group-hover:text-purple-400 transition-colors truncate">{item.title}</h3>
                          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mt-0.5">Sub-Bab Pembelajaran</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-base md:text-lg font-black tracking-wide ${scoreNum !== null ? scoreNum >= 80 ? "text-green-400" : scoreNum >= 50 ? "text-yellow-400" : "text-red-400" : "text-zinc-600"}`}>
                          {scoreNum !== null ? `${scoreNum}%` : "Belum Latihan"}
                        </span>
                        <FiChevronRight size={18} className="text-zinc-600 group-hover:text-purple-400 transition-all" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* --- DETAIL ROADMAP DINAMIS (DARI DATABASE) --- */
            (() => {
              const currentSubtopic = subtopics.find((st) => st.id === selectedSubtopicId);
              const currentDBResult = dbResults.find(r => r.subtopicId === selectedSubtopicId);
              
              const hasTakenQuiz = !!currentDBResult; 
              const scoreNum = hasTakenQuiz ? currentDBResult.score : 0;
              const wrongQuestions = hasTakenQuiz ? currentDBResult.detailedAnalysis.filter((q: any) => q.isCorrect === false) : [];

              let category = "Perlu Peningkatan";
              let badgeColor = "bg-red-500/10 text-red-400 border-red-500/20";
              let recText = `Sistem mendeteksi bahwa pemahaman Anda masih memerlukan penguatan. Selesaikan review konsep di bawah.`;
              let scoreColor = "from-red-400 to-orange-400";

              if (scoreNum >= 80) { category = "Sangat Baik"; badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"; recText = `Luar biasa! Anda menguasai sub-bab ini dengan sangat fantastis.`; scoreColor = "from-emerald-400 to-teal-400"; } 
              else if (scoreNum >= 50) { category = "Cukup Baik"; badgeColor = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"; recText = `Pemahaman Anda sudah lumayan, namun terdapat celah konsep yang terlewat.`; scoreColor = "from-yellow-400 to-amber-400"; }

              return (
                <div className="space-y-6">
                  <button onClick={() => { setSelectedSubtopicId(null); window.history.pushState({}, "", `/learn/${topicId}?view=latihan`); }} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                    ← Kembali ke Daftar Analisis
                  </button>

                  <div className="bg-gradient-to-b from-purple-900/20 to-blue-900/10 border border-purple-500/20 rounded-[2rem] p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] md:w-full h-1/2 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none"></div>
                     <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2 relative z-10 tracking-tight">Analisis: {currentSubtopic?.title}</h2>
                     <p className="text-zinc-300 text-sm md:text-base max-w-2xl mx-auto relative z-10">Rangkuman performa kognitif Anda pada instrumen latihan materi ini.</p>
                     
                     <div className="mt-8 relative z-10 flex flex-col items-center">
                       <div className={`text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r ${scoreColor} mb-3`}>{hasTakenQuiz ? `${scoreNum}%` : "-"}</div>
                       {hasTakenQuiz && (<div className={`flex items-center gap-2 px-5 py-2 rounded-full border font-bold text-sm tracking-wider uppercase ${badgeColor}`}><FiAward size={18} /> Kategori: {category}</div>)}
                     </div>
                     
                     <div className="mt-8 relative z-10">
                        <Link href={`/exercise/${selectedSubtopicId}`} className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105">
                          <FiEye size={18} /> {hasTakenQuiz ? "Lihat Riwayat Jawaban" : "Mulai Kerjakan Latihan"}
                        </Link>
                     </div>
                  </div>

                  {hasTakenQuiz && (
                    <div className="bg-zinc-900/80 border border-white/5 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden">
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-blue-500"></div>
                       <h3 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-3"><FiTrendingUp className="text-purple-400" size={24} /> Roadmap & Rekomendasi Belajar</h3>
                       <p className="text-zinc-400 mb-8 leading-relaxed text-base md:text-lg">{recText}</p>
                       
                       <div className="relative pl-8 md:pl-10 border-l-2 border-purple-500/20 space-y-10">
                         {wrongQuestions.length > 0 ? (
                           <div className="relative group space-y-4">
                             <div className="absolute -left-[41px] md:-left-[49px] top-1 w-5 h-5 rounded-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)] flex items-center justify-center ring-4 ring-[#09090b]"><FiAlertTriangle size={12} className="text-white" /></div>
                             <h4 className="font-bold text-lg md:text-xl text-amber-400">Fokus Utama Pembelajaran Ulang:</h4>
                             <p className="text-zinc-300 text-sm md:text-base leading-relaxed">AI mendeteksi penurunan nilai disebabkan oleh ketidakpahaman pada poin berikut. Klik riwayat untuk meninjau:</p>
                             <ul className="list-disc pl-5 space-y-3 text-zinc-400 text-sm md:text-base">
                               {wrongQuestions.map((q: any, i: number) => (
                                 <li key={i}>Perlu pendalaman: <strong className="text-zinc-100 font-semibold italic">"{extractConcept(q.questionText)}"</strong></li>
                               ))}
                             </ul>
                           </div>
                         ) : (
                           <div className="relative group">
                             <div className="absolute -left-[41px] md:-left-[49px] top-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center ring-4 ring-[#09090b]"><div className="w-1.5 h-1.5 bg-white rounded-full"></div></div>
                             <h4 className="font-bold text-lg md:text-xl text-green-400">1. Sempurna! Pertahankan Performa</h4>
                             <p className="text-zinc-400 mt-2 leading-relaxed">Seluruh butir evaluasi kognitif dijawab dengan akurat. Anda tidak memiliki konsep yang lemah pada sub-topik ini.</p>
                           </div>
                         )}

                         <div className="relative group">
                           <div className="absolute -left-[41px] md:-left-[49px] top-1 w-5 h-5 rounded-full bg-zinc-700 border border-zinc-500 flex items-center justify-center ring-4 ring-[#09090b]"></div>
                           <h4 className="font-bold text-lg md:text-xl text-white group-hover:text-blue-300">2. Konsolidasi via Chat AI Inline</h4>
                           <p className="text-zinc-400 mt-2 leading-relaxed">Jika ada keraguan mengenai penjelasan AI di soal tadi, tanyakan keraguan tersebut pada kolom <strong>Tanya Jawab AI</strong> di lembar materi sub-bab ini.</p>
                         </div>

                         <div className="relative group">
                           <div className="absolute -left-[41px] md:-left-[49px] top-1 w-5 h-5 rounded-full bg-zinc-700 border border-zinc-500 flex items-center justify-center ring-4 ring-[#09090b]"></div>
                           <h4 className="font-bold text-lg md:text-xl text-white group-hover:text-blue-300 flex items-center gap-2">3. Penguasaan Peta Konsep <FiTarget className="text-red-400" /></h4>
                           <p className="text-zinc-400 mt-2 leading-relaxed">Setelah mematangkan materi ini, Anda dipersilakan melanjutkan rute eksplorasi ke sub-bab pembelajaran berikutnya.</p>
                         </div>
                       </div>
                    </div>
                  )}
                </div>
              );
            })()
          )}

        </div>
      )}

    </div>
  );
}