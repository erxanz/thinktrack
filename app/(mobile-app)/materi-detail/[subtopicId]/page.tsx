"use client";

import { useEffect, useState, use } from "react";
import { FiBookOpen, FiArrowLeft, FiLoader, FiClock } from "react-icons/fi";
import { FaGem } from "react-icons/fa";

interface SubtopicData {
  title: string;
  content: string;
  level?: string;
}

export default function MateriDetailPage({ params }: { params: Promise<{ subtopicId: string }> }) {
  const { subtopicId } = use(params);
  const [materi, setMateri] = useState<SubtopicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // INI ADALAH USEEFFECT UNTUK FILE MATERI DETAIL
  useEffect(() => {
    const fetchMateriDetail = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);
        
        // Memanggil API khusus untuk 1 sub-bab yang diklik
        const res = await fetch(`/api/subtopics/${subtopicId}`);
        
        if (!res.ok) throw new Error("Materi tidak ditemukan atau rute API belum dibuat");
        
        const data = await res.json();
        setMateri(data);
      } catch (error: any) {
        setErrorMsg(error.message || "Gagal memuat detail materi");
      } finally {
        setLoading(false);
      }
    };

    fetchMateriDetail();
  }, [subtopicId]);

  // Tampilan saat Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center gap-4">
        <FiLoader className="animate-spin text-blue-500" size={36} />
        <p className="text-zinc-400 text-sm">Membuka lembaran materi...</p>
      </div>
    );
  }

  // Tampilan saat Error (misal API belum dibuat)
  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-sm">{errorMsg}</p>
        <button onClick={() => window.close()} className="text-zinc-400 underline text-xs hover:text-white">
          Tutup Halaman
        </button>
      </div>
    );
  }

  // Tampilan Sukses Menampilkan Materi
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20">
      
      {/* TOP NAVIGATION BAR */}
      <div className="sticky top-0 z-30 bg-[#09090b]/90 backdrop-blur border-b border-white/5 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => window.close()} 
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <FiArrowLeft /> Tutup Halaman
          </button>
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
            <FiBookOpen className="text-blue-500" /> Modul Pembelajaran AI
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-3xl mx-auto px-5 mt-10">
        
        {/* Header Materi */}
        <div className="border-b border-white/5 pb-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <FaGem size={18} />
            </div>
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
              {materi?.level || "Aktif"}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {materi?.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-zinc-500 mt-4">
            <span className="flex items-center gap-1"><FiClock /> Waktu Baca: Bebas</span>
            <span>Status: Terbuka di Tab Baru</span>
          </div>
        </div>

        {/* Isi Penjelasan Lanjutan Materi */}
        <div className="prose prose-invert max-w-none text-zinc-300 text-base md:text-lg leading-relaxed whitespace-pre-line bg-zinc-900/20 border border-white/5 rounded-2xl p-6 md:p-8 shadow-inner">
          {materi?.content}
        </div>

        {/* Footer Halaman Detail */}
        <div className="mt-12 text-center text-xs text-zinc-600 border-t border-white/5 pt-6">
          ThinkTrack AI EdTech Platform • Gunakan pemahaman ini untuk menjawab Sesi Latihan.
        </div>

      </div>
    </div>
  );
}