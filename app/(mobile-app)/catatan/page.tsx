/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { FiChevronDown, FiBookOpen, FiArrowLeft, FiCpu, FiZap, FiCheckCircle } from "react-icons/fi";
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
    <div className="min-h-screen w-full bg-[#FAFAFC] text-gray-900 font-sans p-6 md:p-10 pb-32 selection:bg-[#6D28D9] selection:text-white">
      <div className="max-w-[1000px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* NAVIGASI KEMBALI */}
        <Link 
          href="/home" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#6D28D9] transition-colors font-semibold text-sm bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm hover:shadow transition-all group w-fit"
        >
          <FiArrowLeft className="group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
        </Link>

        {/* HEADER HALAMAN */}
        <div className="bg-white border border-gray-100 p-8 md:p-10 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden flex flex-col md:flex-row gap-6 items-start justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#6D28D9]/5 to-[#FF7849]/5 blur-[50px] rounded-full pointer-events-none"></div>
          
          <div className="space-y-4 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF7849]/10 rounded-full text-xs font-bold text-[#FF7849]">
              <FiZap size={12} className="animate-pulse" /> Knowledge Synchronization Active
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-gray-900 tracking-tight">
              AI Cognitive <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6]">Pocket Book</span>
            </h1>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed">
              Kumpulan <strong className="text-gray-800 font-semibold">Micro-Cheatsheets</strong> personalisasi milikmu. AI menyusun modul ringkas ini secara otomatis berdasarkan celah logika dan miskonsepsi yang berhasil kamu perbaiki selama latihan soal.
            </p>
          </div>

          <div className="w-14 h-14 bg-[#6D28D9]/10 text-[#6D28D9] rounded-2xl flex items-center justify-center shrink-0 border border-[#6D28D9]/10 relative z-10 hidden md:flex shadow-sm">
            <FiCpu size={26} />
          </div>
        </div>

        {/* METRICS MINI BAR */}
        {!isLoading && cheatsheets.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="p-2 bg-[#6D28D9]/10 text-[#6D28D9] rounded-lg"><FiBookOpen size={16} /></div>
              <div>
                <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Total Modules</div>
                <div className="text-lg font-bold text-gray-800">{cheatsheets.length} Sheets</div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><FiCheckCircle size={16} /></div>
              <div>
                <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Cognitive Status</div>
                <div className="text-lg font-bold text-emerald-600">Aligned</div>
              </div>
            </div>
          </div>
        )}

        {/* LIST CATATAN */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[24px] border border-gray-100 shadow-sm">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-[#6D28D9] rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 font-medium text-sm">Synchronizing your cognitive blueprints...</p>
          </div>
        ) : cheatsheets.length === 0 ? (
          <div className="text-center p-20 bg-white border border-dashed border-gray-200 rounded-[24px] shadow-sm flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-[20px] flex items-center justify-center mb-6 border border-gray-100">
              <FiBookOpen size={36} />
            </div>
            <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Belum ada catatan yang tersimpan</h3>
            <p className="text-gray-500 max-w-md leading-relaxed text-sm">
              Selesaikan evaluasi latihan atau obrolan interaktif bersama Socrates AI. Setiap kali miskonsepsimu berhasil diuraikan, rangkuman logikanya akan langsung muncul di halaman ini.
            </p>
          </div>
        ) : (
          <div className="space-y-4 relative z-10">
            {cheatsheets.map((sheet) => {
              const isOpen = openCheatsheetId === sheet.id;
              return (
                <div 
                  className={`transition-all duration-300 ease-in-out ${
                    openCheatsheetId === sheet.id ? "max-h-500 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <button 
                    onClick={() => setOpenCheatsheetId(isOpen ? null : sheet.id)}
                    className="w-full flex items-center justify-between p-6 md:p-8 text-left bg-white relative overflow-hidden group"
                  >
                    {/* Visual bar left accent */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300 ${isOpen ? "bg-[#6D28D9]" : "bg-transparent group-hover:bg-gray-200"}`}></div>
                    
                    <div className="pr-4 pl-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-[#6D28D9] uppercase tracking-widest bg-[#6D28D9]/5 px-2 py-0.5 rounded-md">
                          Resolution Summary
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="text-[10px] text-gray-400 font-semibold">Active Sync</span>
                      </div>
                      <span className="font-bold font-heading text-gray-900 text-lg md:text-xl leading-tight block group-hover:text-[#6D28D9] transition-colors">
                        {sheet.subtopic?.title || "Penyelesaian Celah Kognitif"}
                      </span>
                    </div>
                    
                    <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isOpen 
                        ? "rotate-180 bg-[#6D28D9]/10 text-[#6D28D9]" 
                        : "bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600"
                    }`}>
                      <FiChevronDown size={22} />
                    </div>
                  </button>
                  
                  {/* CHEATSHEET EXPANDED CONTENT */}
                  <div 
                    className={`transition-all duration-500 ease-in-out ${
                      isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="p-6 md:p-8 bg-gray-50/50 border-t border-gray-100 text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-mono">
                      <div className="bg-white p-6 rounded-[16px] border border-gray-100 shadow-inner overflow-x-auto text-gray-800">
                        {sheet.content}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}