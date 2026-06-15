"use client";

import { useEffect, useState, use } from "react";
import {
  FiBookOpen,
  FiChevronRight,
  FiLoader,
  FiPieChart,
  FiTrendingUp,
  FiAward,
  FiList,
  FiEye,
  FiCheckCircle,
} from "react-icons/fi";
import { FaGem } from "react-icons/fa";
import Link from "next/link";
import { SocratesChatModal } from "@/components/chat/SocratesChatModal";

export default function LearnPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = use(params);
  const [viewMode, setViewMode] = useState<"materi" | "latihan">("materi");

  const [topicTitle, setTopicTitle] = useState<string>("");
  const [subtopics, setSubtopics] = useState<
    Array<{ id: string; title: string; level: string; content: string }>
  >([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedSubtopicId, setSelectedSubtopicId] = useState<string | null>(null);
  const [dbResults, setDbResults] = useState<any[]>([]);

  // State Adaptive Learning
  const [activeSocratesBug, setActiveSocratesBug] = useState<any | null>(null);

  useEffect(() => {
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
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-56 font-sans relative">
      {/* HEADER TABS */}
      <div className="sticky top-0 z-30 bg-[#09090b]/95 backdrop-blur border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="flex">
            <button
              onClick={() => setViewMode("materi")}
              className={`flex-1 py-4 text-sm font-bold transition-all ${viewMode === "materi" ? "border-b-2 border-blue-500 text-blue-400 bg-blue-500/5" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"}`}
            >
              <div className="flex items-center justify-center gap-2">
                <FiBookOpen size={16} /> Peta Materi
              </div>
            </button>
            <button
              onClick={() => {
                setViewMode("latihan");
                setSelectedSubtopicId(null);
                window.history.pushState({}, "", `/learn/${topicId}?view=latihan`);
              }}
              className={`flex-1 py-4 text-sm font-bold transition-all ${viewMode === "latihan" ? "border-b-2 border-purple-500 text-purple-400 bg-purple-500/5" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"}`}
            >
              <div className="flex items-center justify-center gap-2">
                <FiPieChart size={16} /> Analisis AI Trace
              </div>
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
                <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-5">
                  <FaGem size={26} className="animate-pulse" />
                </div>
                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full inline-block mb-3">
                  Topik Pembelajaran
                </span>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                  {loadingData ? "Memuat..." : topicTitle || "Topik"}
                </h1>
                <p className="text-sm text-zinc-400 mt-4 leading-relaxed">
                  Roadmap pembelajaran terstruktur yang di-dekomposisi khusus
                  untukmu oleh AI.
                </p>
              </div>
            </div>

            <div className="md:w-7/12 w-full relative z-10 flex flex-col gap-4">
              <div className="hidden md:block absolute left-0 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500/10 via-blue-500/30 to-blue-500/10 -ml-px" />
              {loadingData ? (
                <div className="w-full rounded-2xl border border-white/5 bg-zinc-900/50 p-8 flex flex-col items-center justify-center gap-4 text-zinc-400 ml-0 md:ml-8 lg:ml-12">
                  <FiLoader className="animate-spin text-blue-500" size={28} />{" "}
                  Menyiapkan peta konsep...
                </div>
              ) : (
                subtopics.map((item, index) => (
                  <div key={item.id} className="relative group pl-0 md:pl-8 lg:pl-12">
                    <div className="hidden md:block absolute top-1/2 left-0 w-8 lg:w-12 h-0.5 bg-blue-500/20 group-hover:bg-blue-500/60 transition-colors" />
                    <div className="hidden md:block absolute top-1/2 left-0 w-1.5 h-1.5 mt-[-2.5px] -ml-0.5 rounded-full bg-zinc-700 group-hover:bg-blue-500 transition-colors" />

                    <Link
                      href={`/materi-detail/${item.id}`}
                      target="_blank"
                      className="flex items-center gap-4 rounded-2xl border border-white/5 bg-zinc-900/50 p-4 hover:-translate-y-1 hover:border-blue-500/40 transition-all duration-300"
                    >
                      <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all">
                        <FaGem size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-zinc-500 font-bold block mb-0.5 uppercase tracking-wider">
                          Sub Bab {index + 1}
                        </span>
                        <h3 className="font-semibold text-white text-base group-hover:text-blue-400 transition-colors truncate">
                          {item.title}
                        </h3>
                        <p className="text-sm text-zinc-400 truncate mt-0.5">
                          {item.content}
                        </p>
                      </div>
                      <div className="shrink-0 text-zinc-600 group-hover:text-blue-400 transition-colors group-hover:translate-x-1 duration-300">
                        <FiChevronRight size={20} />
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODE ANALISIS (LATIHAN) */}
      {viewMode === "latihan" && (
        <div className="max-w-4xl mx-auto p-5 mt-4 md:mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
          {selectedSubtopicId === null ? (
            /* DAFTAR LIST SUB-BAB (DARI DATABASE) */
            <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <FiList className="text-purple-400" size={24} />{" "}
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  Daftar Penguasaan Materi
                </h2>
              </div>
              <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                Pilih sub-bab untuk melihat roadmap rekomendasi belajar kustom
                dari AI berdasarkan rekam jejak kognitif Anda.
              </p>
              <div className="flex flex-col gap-4">
                {subtopics.map((item, index) => {
                  const currentDBResult = dbResults.find((r) => r.subtopicId === item.id);
                  const scoreNum = currentDBResult && currentDBResult.score !== null ? currentDBResult.score : null;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedSubtopicId(item.id);
                        window.history.pushState({}, "", `/learn/${topicId}?view=latihan&subtopicId=${item.id}`);
                      }}
                      className="w-full flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-zinc-900/40 p-5 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all text-left group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-white text-base group-hover:text-purple-400 transition-colors truncate">
                            {item.title}
                          </h3>
                          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mt-0.5">
                            Sub-Bab Pembelajaran
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-base md:text-lg font-black tracking-wide ${scoreNum !== null ? (scoreNum >= 80 ? "text-green-400" : scoreNum >= 50 ? "text-yellow-400" : "text-red-400") : "text-zinc-600"}`}>
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
            /* DETAIL ROADMAP DINAMIS (HYBRID ADAPTIVE: SKENARIO A & B) */
            (() => {
              const currentSubtopic = subtopics.find((st) => st.id === selectedSubtopicId);
              const currentDBResult = dbResults.find((r) => r.subtopicId === selectedSubtopicId);

              const hasTakenQuiz = !!currentDBResult;
              const scoreNum = hasTakenQuiz ? (currentDBResult.score || 0) : 0;
              
              // PARSING AMAN (Mencegah Crash Layar Putih)
              let parsedAnalysis: any[] = [];
              if (hasTakenQuiz && currentDBResult.detailedAnalysis) {
                try {
                  if (Array.isArray(currentDBResult.detailedAnalysis)) {
                    parsedAnalysis = currentDBResult.detailedAnalysis;
                  } else if (typeof currentDBResult.detailedAnalysis === 'string') {
                    parsedAnalysis = JSON.parse(currentDBResult.detailedAnalysis);
                  }
                } catch (e) {
                  console.error("Gagal parsing detailed analysis", e);
                  parsedAnalysis = []; 
                }
              }

              // FILTER BUGS AMAN
              const localBugs = parsedAnalysis.filter((q: any) => q.resolutionType === "LOCAL_BUG" && (q.isCorrect === false || String(q.isCorrect) === "false"));
              const foundationalGaps = parsedAnalysis.filter((q: any) => q.resolutionType === "FOUNDATIONAL_GAP" && (q.isCorrect === false || String(q.isCorrect) === "false"));
              const correctCount = parsedAnalysis.filter((q: any) => q.isCorrect === true || String(q.isCorrect) === "true").length;
              const totalQuestions = parsedAnalysis.length;

              let category = "Perlu Peningkatan";
              let badgeColor = "bg-red-500/10 text-red-400 border-red-500/20";
              let scoreColor = "from-red-400 to-orange-400";

              if (scoreNum >= 80) {
                category = "Sangat Baik";
                badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                scoreColor = "from-emerald-400 to-teal-400";
              } else if (scoreNum >= 50) {
                category = "Cukup Baik";
                badgeColor = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
                scoreColor = "from-yellow-400 to-amber-400";
              }

              return (
                <div className="space-y-6">
                  <button
                    onClick={() => {
                      setSelectedSubtopicId(null);
                      window.history.pushState({}, "", `/learn/${topicId}?view=latihan`);
                    }}
                    className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                  >
                    ← Kembali ke Daftar Analisis
                  </button>

                  <div className="bg-gradient-to-b from-purple-900/20 to-blue-900/10 border border-purple-500/20 rounded-[2rem] p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] md:w-full h-1/2 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none"></div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2 relative z-10 tracking-tight">
                      Analisis: {currentSubtopic?.title}
                    </h2>
                    <p className="text-zinc-300 text-sm md:text-base max-w-2xl mx-auto relative z-10">
                      Evaluasi cerdas dari AI Evaluator berdasarkan jejak berpikir (Trace) Anda.
                    </p>

                    <div className="mt-8 relative z-10 flex flex-col items-center">
                      <div className={`text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r ${scoreColor} mb-3`}>
                        {hasTakenQuiz ? `${scoreNum}%` : "-"}
                      </div>
                      {hasTakenQuiz && (
                        <div className={`flex items-center gap-2 px-5 py-2 rounded-full border font-bold text-sm tracking-wider uppercase ${badgeColor}`}>
                          <FiAward size={18} /> Kategori: {category}
                        </div>
                      )}
                    </div>

                    <div className="mt-8 relative z-10">
                      <Link
                        href={`/exercise/${selectedSubtopicId}`}
                        className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
                      >
                        <FiEye size={18} /> Lihat Log Ujian (Trace Lama)
                      </Link>
                    </div>
                  </div>

                  {hasTakenQuiz && (
                    <div className="bg-zinc-900/80 border border-white/5 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-blue-500"></div>

                      <div className="mb-8 border-b border-white/5 pb-6">
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 flex items-center gap-3">
                          <FiTrendingUp className="text-purple-400" size={24} /> Hasil Analisis Cognitive Task
                        </h3>
                        <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
                          {totalQuestions > 0 && totalQuestions === correctCount 
                            ? "Sempurna! Tidak ada bug kognitif yang ditemukan pada rekam jejak Anda."
                            : totalQuestions === 0 
                            ? "Gagal memproses data jawaban. Silakan ulangi kuis."
                            : "Sistem menemukan beberapa celah logika (Bug). Selesaikan tantangan di bawah untuk memperbaikinya."}
                        </p>
                      </div>

                      <div className="space-y-10">
                        {/* SKENARIO B: WARP PORTAL (FOUNDATIONAL GAP) */}
                        {foundationalGaps.length > 0 && (
                          <div className="bg-purple-950/40 p-6 rounded-2xl border-2 border-purple-500/60 shadow-[0_0_30px_rgba(168,85,247,0.15)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/20 blur-[50px] rounded-full pointer-events-none"></div>
                            <h3 className="text-xl font-black text-purple-300 flex items-center gap-2 mb-2 relative z-10">
                              🌌 Warp Portal Terbuka! (Foundational Gap)
                            </h3>
                            <p className="text-purple-200/80 text-sm mb-6 relative z-10">
                              AI mendeteksi fondasi yang rapuh pada konsep dasarmu. Melangkah maju sekarang akan sangat menyulitkanmu di masa depan. Mari kembali sebentar!
                            </p>
                            <div className="space-y-3 relative z-10">
                              {foundationalGaps.map((gap: any, idx: number) => (
                                <Link 
                                  key={idx}
                                  href={`/materi-detail/${gap.foundationalTopicTarget || subtopics[0].id}`} 
                                  className="w-full text-left p-4 bg-zinc-900/90 rounded-xl border border-purple-500/30 hover:border-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
                                >
                                  <div>
                                    <span className="block text-xs text-purple-400 font-bold uppercase mb-1">Celah Dasar Terdeteksi:</span>
                                    <span className="font-bold text-zinc-100">{gap.cognitiveBug || "Kelemahan Konsep Dasar"}</span>
                                  </div>
                                  <span className="bg-purple-600 group-hover:bg-purple-500 text-white px-4 py-2 text-sm rounded-lg font-bold transition-colors whitespace-nowrap">
                                    Warp Kembali 🚀
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                       {/* SKENARIO A: SOCRATES CHAT (LOCAL BUGS) */}
                        {localBugs.length > 0 && (
                          (() => {
                            // Ambil nama bug kognitif, bersihkan teks anomali
                            const rawBugs = localBugs.map((b: any) => b.cognitiveBug || b.concept).filter((bug: string) => bug && bug !== "LOCAL_BUG" && bug !== "NONE" && bug.trim() !== "");
                            const uniqueBugs = Array.from(new Set(rawBugs));
                            
                            // Jika benar-benar kosong, beri nama topik default dari subtopik aktif
                            if (uniqueBugs.length === 0) {
                              uniqueBugs.push(currentSubtopic?.title || "Konsep Inti Bab");
                            }

                            const bugNamesString = uniqueBugs.join(", ");

                            return (
                              <div className="bg-orange-950/20 p-6 md:p-8 rounded-3xl border border-orange-500/30 relative overflow-hidden shadow-lg shadow-orange-900/20">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-600/10 blur-[50px] rounded-full pointer-events-none"></div>
                                
                                <h3 className="text-xl md:text-2xl font-bold text-orange-400 flex items-center gap-3 mb-4 relative z-10">
                                  🕵️ Analisis Celah Kognitif
                                </h3>
                                
                                <p className="text-orange-200/80 text-sm md:text-base leading-relaxed mb-4 relative z-10">
                                  Berdasarkan analisis mendalam terhadap rekam jejak pemikiran (*Thinking Trace*) dan coretan jawabanmu, sistem mendeteksi hambatan logika spesifik pada sub-bab ini. Logikamu terdeteksi masih tersandung pada poin-poin materi berikut:
                                </p>

                                {/* RINCIAN POIN-POIN KESALAHAN USER */}
                                <ul className="list-disc list-inside space-y-2 text-orange-300 font-bold mb-6 bg-orange-950/50 p-4 rounded-xl border border-orange-500/10 relative z-10">
                                  {uniqueBugs.map((bug: string, index: number) => (
                                    <li key={index} className="tracking-wide">
                                      ✨ {bug}
                                    </li>
                                  ))}
                                </ul>

                                <p className="text-orange-200/80 text-sm md:text-base leading-relaxed mb-8 relative z-10">
                                  Mari kita diskusikan poin-poin di atas bersama AI Tutor untuk meluruskan pemahamanmu secara menyeluruh dalam satu sesi obrolan. Selesaikan diskusi ini dengan baik, dan dapatkan hadiah <strong className="text-orange-400 font-bold">Micro-Cheatsheet</strong> personal yang akan dipasang di ruang belajarmu!
                                </p>
                                
                                {/* BUTTON DI BAWAH PARAGRAF UNTUK BUKA SOCRATES AI */}
                                <div className="relative z-10">
                                  <button 
                                    onClick={() => setActiveSocratesBug({ cognitiveBug: bugNamesString })} 
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:scale-[1.02]"
                                  >
                                    Mulai Diskusi Socrates Berdasarkan Semua Celah <FiChevronRight size={20} />
                                  </button>
                                </div>
                              </div>
                            );
                          })()
                        )}

                        {/* JIKA BENAR SEMUA */}
                        {totalQuestions > 0 && totalQuestions === correctCount && hasTakenQuiz && (
                          <div className="bg-emerald-950/30 p-8 rounded-2xl border border-emerald-500/30 text-center">
                            <FiCheckCircle className="mx-auto text-emerald-400 mb-4" size={48} />
                            <h3 className="text-xl font-bold text-emerald-400 mb-2">Jejak Kognitif Sempurna!</h3>
                            <p className="text-emerald-200/70 text-sm">
                              Tidak ada Bug Kognitif yang ditemukan. Pertahankan performa ini dan lanjutkan ke sub-bab berikutnya!
                            </p>
                          </div>
                        )}

                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* RENDER MODAL SOCRATES JIKA AKTIF */}
      {activeSocratesBug && (
        <SocratesChatModal 
          bugData={activeSocratesBug}
          userId={dbResults[0]?.userId || "user-id-placeholder"}
          subtopicId={selectedSubtopicId!}
          onClose={() => setActiveSocratesBug(null)}
          onComplete={() => {
            alert("🎉 Hebat! Micro-Cheatsheet berhasil ditambahkan di ujung Ruang Belajar.");
          }}
        />
      )}
    </div>
  );
}