/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, use, useRef } from "react";
import { FiBookOpen, FiArrowLeft, FiLoader, FiClock, FiSend, FiUser, FiCpu, FiCheckCircle, FiArrowRight } from "react-icons/fi";
import { FaGem } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import Link from "next/link";

interface SubtopicData {
  title: string;
  content: string;
  level?: string;
}

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function MateriDetailPage({ params }: { params: Promise<{ subtopicId: string }> }) {
  const { subtopicId } = use(params);
  const [materi, setMateri] = useState<SubtopicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // State untuk Fitur Tanya Jawab Chat AI
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMateriDetail = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);
        
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

  useEffect(() => {
    if (messages.length > 0 || chatLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, chatLoading]);

  // ====================================================================
  // ADVANCED MATH EXTRACTOR (OTOMATIS MEMISAHKAN RUMUS ANGKA & ALJABAR)
  // ====================================================================
  const preprocessMateriContent = (text: string) => {
    if (!text) return "";

    // Regex super cerdas: Mendeteksi persamaan angka (2 + 3 = 3 + 2) maupun fungsi aljabar f(x) = ...
    // Mengabaikan kata-kata panjang teks bahasa Indonesia agar paragraf penjelasan tidak rusak.
    const mathEquationRegex = /(?:(?:\(?\b[a-zA-Z]{1,2}\b(?:\([a-zA-Z]\))?|\d+|\.\.\.|\bdots\b)[\s\+\-\*\/\^\(\)]*)+\s*=\s*(?:[\s\+\-\*\/\^\(\)]*(?:\b[a-zA-Z]{1,2}\b(?:\([a-zA-Z]\))?|\d+|\.\.\.|\bdots\b)\s*)+/gi;

    let processed = text.replace(mathEquationRegex, (match) => {
      // Bersihkan spasi di ujung dan rapikan tanda titik tiga menjadi dot LaTeX (\dots)
      let cleanFormula = match.trim().replace(/\.\.\./g, "\\dots");
      
      // Memaksa enter ganda (\n\n) dan membungkus rumus dengan $$ agar otomatis membuat kotak blok lebar terpisah
      return `\n\n$$\n${cleanFormula}\n$$\n\n`;
    });

    return processed;
  };

  const handleSend = async () => {
    if (!input.trim() || chatLoading || !materi) return;

    const userMessage = input.trim();
    setInput("");
    
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setChatLoading(true);

    try {
      const instruction = `Anda adalah asisten tutor AI yang ramah dari ThinkTrack EdTech. 
Tugas Anda adalah menjawab pertanyaan user berdasarkan materi berjudul "${materi.title}".
Berikut adalah isi materinya:
---
${materi.content}
---
Jawablah dengan jelas, ringkas, dan informatif. WAJIB selalu gunakan format blok LaTeX ganda ($$) untuk menuliskan contoh hitungan angka atau rumus persamaan agar tampil rapi dalam kotak terpisah pada layar pengguna.`;

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: userMessage,
          instruction: instruction,
        }),
      });

      if (!response.ok) throw new Error("Gagal mengambil respon AI");

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "ai", content: data.text }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Maaf, terjadi kesalahan saat menghubungi AI. Silakan coba lagi nanti." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center gap-4">
        <FiLoader className="animate-spin text-blue-500" size={36} />
        <p className="text-zinc-400 text-sm">Membuka lembaran materi...</p>
      </div>
    );
  }

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

  // Mengubah plain text materi menjadi format terstruktur kaya matematika
  const processedContent = preprocessMateriContent(materi?.content || "");

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      
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
      <div className="max-w-3xl mx-auto px-5 mt-10 pb-36">
        
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

        {/* AREA ISI MATERI DENGAN BLOCK KOTAK RUMUS SUPER EKSTETIK */}
        <div className="prose prose-invert max-w-none text-zinc-300 text-base md:text-lg leading-relaxed bg-zinc-900/20 border border-white/5 rounded-2xl p-6 md:p-8 shadow-inner
          [&_.katex-display]:bg-purple-500/10 
          [&_.katex-display]:border 
          [&_.katex-display]:border-purple-500/20 
          [&_.katex-display]:px-6
          [&_.katex-display]:py-5 
          [&_.katex-display]:rounded-2xl 
          [&_.katex-display]:my-6
          [&_.katex-display]:text-purple-300
          [&_.katex-display]:font-bold
          [&_.katex-display]:overflow-x-auto 
          [&_.katex-display]:shadow-[0_0_25px_rgba(168,85,247,0.06)]
          [&_p]:mb-5">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm, remarkMath]} 
            rehypePlugins={[rehypeKatex]}
          >
            {processedContent}
          </ReactMarkdown>
        </div>

        {/* --- SECTION BARU: CALL TO ACTION LATIHAN --- */}
        <div className="mt-16 mb-12 p-10 md:p-14 rounded-[2.5rem] bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 text-center shadow-2xl shadow-blue-900/20 relative overflow-hidden">
           {/* Efek glow tambahan di latar belakang agar lebih estetik */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none"></div>
           
           {/* Ikon Check Lebih Besar */}
           <div className="relative z-10 inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-500/20 text-blue-400 mb-6 ring-4 ring-blue-500/10">
              <FiCheckCircle size={44} className="md:w-12 md:h-12" />
           </div>
           
           {/* Teks Judul Lebih Besar */}
           <h3 className="relative z-10 text-2xl md:text-3xl font-extrabold text-white mb-4 tracking-tight">
             Materi Selesai Dibaca!
           </h3>
           
           {/* Teks Deskripsi Lebih Jelas */}
           <p className="relative z-10 text-zinc-300 text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Kamu sudah mempelajari <span className="font-semibold text-white">"{materi?.title}"</span>. Sekarang, uji pemahamanmu dengan latihan soal singkat.
           </p>
           
           {/* Tombol Lebih Raksasa (Full width di HP, normal di PC) */}
           <Link 
              href={`/exercise/${subtopicId}`}
              className="relative z-10 inline-flex items-center justify-center w-full sm:w-auto gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(37,99,235,0.4)]"
           >
              Mulai Latihan Sekarang <FiArrowRight size={20} />
           </Link>
        </div>

        {/* --- AREA RIWAYAT TANYA JAWAB (MENGALIR DI BAWAH MATERI) --- */}
        <div className="mt-12 border-t border-white/5 pt-8">
          {messages.length > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
              <h3 className="text-xs font-bold tracking-wider text-purple-400 uppercase">
                Sesi Tanya Jawab AI
              </h3>
            </div>
          )}

          <div className="space-y-6">
            {messages.map((msg, index) => (
              <div key={index} className="flex flex-col">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold tracking-wider uppercase">
                  {msg.role === "user" ? (
                    <>
                      <FiUser className="text-zinc-500" size={13} />
                      <span className="text-zinc-500">Pertanyaan Kamu</span>
                    </>
                  ) : (
                    <>
                      <FiCpu className="text-purple-400" size={13} />
                      <span className="text-purple-400">Tutor AI</span>
                    </>
                  )}
                </div>
                <div className="text-base leading-relaxed text-zinc-200 
                  [&_.katex-display]:bg-zinc-950 
                  [&_.katex-display]:border 
                  [&_.katex-display]:border-white/5 
                  [&_.katex-display]:p-4 
                  [&_.katex-display]:rounded-xl 
                  [&_.katex-display]:my-4 
                  [&_.katex-display]:overflow-x-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex items-center gap-3 text-purple-400 text-sm animate-pulse py-4">
                <FiLoader className="animate-spin" size={16} />
                <span>AI sedang merumuskan jawaban...</span>
              </div>
            )}

            <div ref={messagesEndRef} className="h-2" />
          </div>
        </div>

      </div>

      {/* --- KOTAK INPUT CHAT STATIS (Melayang di Bawah Layar) --- */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/90 backdrop-blur-xl border-t border-white/10 px-4 py-4 md:py-6">
        <div className="max-w-3xl mx-auto relative">
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-2 focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/20 transition-all shadow-lg">
            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Tanyakan bagian materi yang belum kamu pahami..."
                className="flex-1 bg-transparent px-3 py-2 text-sm md:text-base text-zinc-200 outline-none placeholder-zinc-600 resize-none max-h-32 min-h-[44px] custom-scrollbar"
                rows={1}
                disabled={chatLoading}
              />
              <button
                onClick={handleSend}
                disabled={chatLoading || !input.trim()}
                className="flex items-center justify-center w-11 h-11 rounded-xl bg-white text-black disabled:opacity-20 disabled:bg-zinc-800 disabled:text-zinc-500 hover:bg-zinc-200 transition-colors shrink-0 mb-0.5"
              >
                <FiSend size={18} />
              </button>
            </div>
          </div>
          <div className="text-center text-[10px] text-zinc-500 mt-3">
            ThinkTrack AI EdTech Platform • AI dapat membuat kesalahan. Evaluasi kembali jawaban untuk pemahaman terbaik.
          </div>
        </div>
      </div>

    </div>
  );
}