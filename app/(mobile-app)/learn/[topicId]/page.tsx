"use client";

import { useEffect, useState, use } from "react";
import dynamic from "next/dynamic";
import LatexRenderer from "@/components/ui/LatexRenderer";

import {
  FiAlertCircle,
  FiCheckCircle,
  FiTrash2,
  FiBookOpen,
  FiEdit3,
  FiChevronRight,
  FiLoader,
} from "react-icons/fi";
import { FaGem } from "react-icons/fa"; // Ikon permata dari FontAwesome
import Link from "next/link"; // Import Link dari Next.js

// semua 

const MathKeyboard = dynamic(() => import("@/components/input/MathKeyboard"), {
  ssr: false,
});

interface AnalysisResult {
  isCorrect: boolean;
  feedback: string;
  errorStep?: number;
}

export default function LearnPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = use(params);
  const [viewMode, setViewMode] = useState<"materi" | "latihan">("materi");

  const [topicTitle, setTopicTitle] = useState<string>("");
  const [subtopics, setSubtopics] = useState<Array<{ id: string; title: string; level: string; content: string }>>([]);
  const [exercisesBySubtopic, setExercisesBySubtopic] = useState<Record<string, Array<{ id: string; type: string; question: string; answer: string; explanation: string }>>>({});
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingData(true);
        const res = await fetch(`/api/topics/${topicId}`);
        if (!res.ok) throw new Error("Gagal memuat topik");
        const data = await res.json();
        setTopicTitle(data?.topic?.title || "");
        setSubtopics(data?.subtopics || []);
        const map: typeof exercisesBySubtopic = {};
        for (const st of data?.subtopics || []) {
          map[st.id] = data?.exercisesBySubtopic?.[st.id] || [];
        }
        setExercisesBySubtopic(map);
      } catch {
        setTopicTitle("");
        setSubtopics([]);
        setExercisesBySubtopic({});
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [topicId]);


  const [steps, setSteps] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const firstSubtopicId = subtopics[0]?.id;
  const firstExercise = firstSubtopicId
    ? exercisesBySubtopic[firstSubtopicId]?.[0]
    : undefined;

  const question = firstExercise?.question || "";

  // explanation belum dipakai di UI saat ini (bisa ditampilkan di future)
  // const activeExerciseExplanation = firstExercise?.explanation || "";

  const sanitizeLatex = (latex: string) =>

    latex.replace(/\\placeholder\{\}/g, "□").replace(/\\placeholder/g, "□");

  const previewContent = sanitizeLatex(currentInput);

  const hasPlaceholder = currentInput.includes("\\placeholder");

  const handleAddStep = () => {
    if (!currentInput.trim()) return;

    setSteps((prev) => [...prev, currentInput]);
    setCurrentInput("");
    setAnalysis(null);
  };

  const removeStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
    setAnalysis(null);
  };

  const handleAnalyze = async () => {
    if (!steps.length) return;

    setLoading(true);

    try {
      const response = await fetch("/api/ai/analyze-trace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          steps,
          topicId,
          question,
        }),
      });

      const data = await response.json();

      setAnalysis(data);
    } catch {
      setAnalysis({
        isCorrect: false,
        feedback: "Gagal menghubungi AI. Silakan coba lagi.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-56">
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-[#09090b]/95 backdrop-blur border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="flex">
            <button
              onClick={() => setViewMode("materi")}
              className={`flex-1 py-4 text-sm font-bold transition ${
                viewMode === "materi"
                  ? "border-b-2 border-blue-500 text-blue-400"
                  : "text-zinc-500"
              }`}>
              <div className="flex items-center justify-center gap-2">
                <FiBookOpen />
                Materi
              </div>
            </button>

            <button
              onClick={() => setViewMode("latihan")}
              className={`flex-1 py-4 text-sm font-bold transition ${
                viewMode === "latihan"
                  ? "border-b-2 border-blue-500 text-blue-400"
                  : "text-zinc-500"
              }`}>
              <div className="flex items-center justify-center gap-2">
                <FiEdit3 />
                Latihan
              </div>
            </button>
          </div>
        </div>
      </div>

{/* MODE MATERI */}
      {viewMode === "materi" && (
        <div className="max-w-6xl mx-auto p-5 mt-4 md:mt-8">
          
          {/* Mengubah 'items-start' menjadi 'items-center' agar Kotak Kiri pas di tengah-tengah tinggi daftar kanan */}
          <div className="flex flex-col md:flex-row items-center relative gap-4 md:gap-0">

            {/* ==================================================== */}
            {/* SISI KIRI: Kotak Judul Utama (Pas di Tengah)         */}
            {/* ==================================================== */}
            <div className="md:w-5/12 w-full relative z-20 md:pr-8 lg:pr-14 mb-6 md:mb-0">
              <div className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl p-8 text-center shadow-xl shadow-black/40 relative">
                {/* Aksen Gradasi */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl" />

                {/* Ikon Permata Besar */}
                <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-5 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                  <FaGem size={26} className="animate-pulse" />
                </div>

                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full inline-block mb-3">
                  Topik Pembelajaran
                </span>

                <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                  {loadingData ? "Memuat..." : topicTitle || "Topik"}
                </h1>
                
                <p className="text-sm text-zinc-400 mt-4 leading-relaxed">
                  Roadmap pembelajaran terstruktur yang di-dekomposisi khusus untukmu oleh AI.
                </p>

                {/* Garis Penghubung Horizontal ke Batang Utama Kanan */}
                <div className="hidden md:block absolute top-1/2 -right-8 lg:-right-14 w-8 lg:w-14 h-0.5 bg-blue-500/40" />
                {/* Titik Sambung */}
                <div className="hidden md:block absolute top-1/2 -right-8 lg:-right-14 w-2 h-2 -mt-[3px] rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)] z-30" />
              </div>
            </div>

            {/* ==================================================== */}
            {/* SISI KANAN: Hanya Daftar Materi (Sub Bab)            */}
            {/* ==================================================== */}
            <div className="md:w-7/12 w-full relative z-10 flex flex-col gap-4">
              
              {/* Garis Vertikal Hubungan (Hanya setinggi list materi) */}
              <div className="hidden md:block absolute left-0 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500/10 via-blue-500/30 to-blue-500/10 -ml-[1px]" />

              {/* Looping List Materi */}
              {loadingData ? (
                <div className="w-full rounded-2xl border border-white/5 bg-zinc-900/50 p-8 flex flex-col items-center justify-center gap-4 text-zinc-400 ml-0 md:ml-8 lg:ml-12">
                  <FiLoader className="animate-spin text-blue-500" size={28} />
                  Menyiapkan peta konsep...
                </div>
              ) : (
                subtopics.map((item, index) => (
                  <div key={item.id} className="relative group pl-0 md:pl-8 lg:pl-12">
                    
                    {/* Garis Cabang dari Batang Utama ke Card */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-8 lg:w-12 h-0.5 bg-blue-500/20 group-hover:bg-blue-500/60 transition-colors" />
                    <div className="hidden md:block absolute top-1/2 left-0 w-1.5 h-1.5 -mt-[2.5px] -ml-[2px] rounded-full bg-zinc-700 group-hover:bg-blue-500 transition-colors" />

                    {/* Card Materi */}
                    <Link
                      href={`/materi-detail/${item.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 rounded-2xl border border-white/5 bg-zinc-900/50 p-4 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(59,130,246,0.1)] hover:border-blue-500/40 transition-all duration-300"
                    >
                      {/* Ikon Permata */}
                      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all">
                        <FaGem size={20} />
                      </div>

                      {/* Konten Judul & Deskripsi 1 Baris */}
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

                      {/* Panah Kanan */}
                      <div className="flex-shrink-0 text-zinc-600 group-hover:text-blue-400 transition-colors group-hover:translate-x-1 duration-300">
                        <FiChevronRight size={20} />
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </div>

          </div> {/* Akhir dari flex kolom kiri-kanan */}

          {/* ==================================================== */}
          {/* BAGIAN BAWAH: Kotak Latihan Memanjang Penuh (w-full) */}
          {/* ==================================================== */}
          <div className="w-full bg-blue-950/20 border border-blue-500/20 rounded-2xl p-6 text-center shadow-lg shadow-blue-900/10 mt-8">
            <h3 className="font-semibold text-blue-400 mb-2 flex items-center justify-center gap-2">
              <FiAlertCircle /> Rekomendasi AI
            </h3>
            <p className="text-sm text-zinc-400 max-w-2xl mx-auto">
              Selesaikan semua materi di atas secara berurutan, lalu klik tombol di bawah untuk mulai menguji pemahaman kognitif Anda melalui latihan soal interaktif.
            </p>
            <button
              onClick={() => setViewMode("latihan")}
              className="mt-5 w-full md:w-auto min-w-[240px] rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all active:scale-95">
              Mulai Latihan Soal
            </button>
          </div>

        </div>
      )}

      {/* MODE LATIHAN */}
      {viewMode === "latihan" && (
        <>
          <div className="border-b border-white/5 bg-zinc-950/50 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="rounded-2xl bg-zinc-900/50 border border-white/5 p-6">
                <div className="flex justify-between mb-4">
                  <span className="text-xs uppercase text-zinc-500 font-bold">
                    Latihan Thinking Trace
                  </span>

                  <span className="px-2 py-1 rounded-full text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    AI Active
                  </span>
                </div>

                <div className="text-center text-3xl">
                  <LatexRenderer content={question} />
                </div>

                {loadingData && (
                  <div className="mt-4 flex items-center gap-2 justify-center text-zinc-400">
                    <FiLoader className="animate-spin" />
                    Memuat latihan...
                  </div>
                )}
              </div>
            </div>
          </div>


          {currentInput && (
            <div className="max-w-4xl mx-auto p-4">
              <div className="rounded-xl border border-blue-900/30 bg-blue-950/20 p-4">
                <div className="text-lg">
                  <LatexRenderer content={previewContent} />
                </div>

                {hasPlaceholder && (
                  <p className="mt-2 text-xs text-amber-400">
                    Lengkapi ekspresi matematika terlebih dahulu.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="max-w-4xl mx-auto p-4 space-y-4">
            {steps.map((step, index) => {
              const isError = analysis?.errorStep === index + 1;

              return (
                <div
                  key={index}
                  className={`rounded-xl border p-4 ${
                    isError
                      ? "border-red-500 bg-red-950/20"
                      : "border-white/5 bg-zinc-900/50"
                  }`}>
                  <div className="flex justify-between mb-3">
                    <span className="text-xs text-zinc-500">
                      Langkah {index + 1}
                    </span>

                    <button onClick={() => removeStep(index)}>
                      <FiTrash2 />
                    </button>
                  </div>

                  <LatexRenderer content={step} />
                </div>
              );
            })}

            {analysis?.isCorrect && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <FiCheckCircle />
                  Analisis AI
                </div>

                <p className="mt-2 text-sm">{analysis.feedback}</p>
              </div>
            )}

            {analysis && !analysis.isCorrect && !analysis.errorStep && (
              <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-4">
                <div className="flex items-center gap-2 text-red-400 font-semibold">
                  <FiAlertCircle />
                  Analisis AI
                </div>

                <p className="mt-2 text-sm">{analysis.feedback}</p>
              </div>
            )}
          </div>

          <div className="fixed bottom-0 left-0 right-0 border-t border-white/5 bg-[#09090b]/90 backdrop-blur">
            <div className="max-w-4xl mx-auto p-4 flex gap-3">
              <button
                onClick={handleAddStep}
                className="flex-1 rounded-xl bg-zinc-800 py-3">
                Tambah Langkah
              </button>

              <button
                onClick={handleAnalyze}
                className="flex-1 rounded-xl bg-blue-600 py-3">
                {loading ? "Menganalisis..." : "Analisis Thinking Trace"}
              </button>
            </div>
          </div>

          <MathKeyboard onInput={(latex) => setCurrentInput(latex)} />
        </>
      )}
    </div>
  );
}
