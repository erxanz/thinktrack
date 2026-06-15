/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { FiChevronDown, FiBookOpen, FiArrowLeft, FiCpu } from "react-icons/fi";
import Link from "next/link";

export default function CatatanPage() {
  const [cheatsheets, setCheatsheets] = useState<any[]>([]);
  const [openCheatsheetId, setOpenCheatsheetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCheatsheets = async () => {
      try {
        const res = await fetch(`/api/cheatsheets`);
        const data = await res.json();
        if (data.cheatsheets) setCheatsheets(data.cheatsheets);
      } catch (e) {
        console.error("Gagal memuat catatan", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCheatsheets();
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-6 md:p-8 pb-32 font-sans relative">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
        
        {/* NAVIGASI KEMBALI */}
        <Link href="/home" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors font-medium">
          <FiArrowLeft /> Kembali ke Dashboard
        </Link>

        {/* HEADER HALAMAN */}
        <div className="bg-linear-to-br from-orange-900/40 to-zinc-900 border border-orange-500/20 p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-600/20 blur-[60px] rounded-full pointer-events-none"></div>
          <div className="w-14 h-14 bg-orange-500/10 text-orange-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-orange-500/20">
            <FiCpu size={28} />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3 relative z-10">
            Buku Saku Kognitif AI
          </h1>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-xl relative z-10">
            Ini adalah kumpulan <strong className="text-orange-300">Micro-Cheatsheet</strong> eksklusif milikmu. Catatan ini disusun secara otomatis oleh AI berdasarkan celah logika yang berhasil kamu perbaiki selama latihan.
          </p>
        </div>

        {/* LIST CATATAN */}
        {isLoading ? (
          <div className="text-center p-10 text-zinc-500 animate-pulse">Memuat catatan personalmu...</div>
        ) : cheatsheets.length === 0 ? (
          <div className="text-center p-12 bg-zinc-900/40 border border-dashed border-zinc-800 rounded-3xl text-zinc-500">
            <FiBookOpen size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium">Belum ada catatan yang tersimpan.</p>
            <p className="text-sm mt-2 opacity-70">Selesaikan obrolan Socrates AI saat mengevaluasi kuis untuk mendapatkan rangkuman di sini.</p>
          </div>
        ) : (
          <div className="space-y-4 relative z-10">
            {cheatsheets.map((sheet) => (
              <div key={sheet.id} className="bg-zinc-900/60 rounded-2xl border border-white/5 overflow-hidden shadow-lg hover:border-orange-500/30 transition-all duration-300">
                <button 
                  onClick={() => setOpenCheatsheetId(openCheatsheetId === sheet.id ? null : sheet.id)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left"
                >
                  <div className="pr-4">
                    <span className="text-[10px] md:text-xs font-bold text-orange-500 uppercase tracking-wider block mb-1">
                      Catatan Resolusi AI
                    </span>
                    <span className="font-bold text-white text-base md:text-lg">
                      {sheet.subtopic?.title || "Penyelesaian Celah Kognitif"}
                    </span>
                  </div>
                  <div className={`shrink-0 w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center transform transition-transform duration-300 ${openCheatsheetId === sheet.id ? "rotate-180 bg-orange-500/20 text-orange-400" : "text-zinc-400"}`}>
                    <FiChevronDown size={20} />
                  </div>
                </button>
                
                {/* ISI CATATAN YANG TERBUKA */}
                <div 
                  className={`transition-all duration-300 ease-in-out ${
                    openCheatsheetId === sheet.id ? "max-h-500 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-6 text-sm md:text-base text-zinc-300 border-t border-white/5 bg-zinc-950 whitespace-pre-wrap leading-relaxed font-mono">
                    {sheet.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}