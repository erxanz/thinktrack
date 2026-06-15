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

    const mathEquationRegex = /(?:(?:\(?\b[a-zA-Z]{1,2}\b(?:\([a-zA-Z]\))?|\d+|\.\.\.|\bdots\b)[\s\+\-\*\/\^\(\)]*)+\s*=\s*(?:[\s\+\-\*\/\^\(\)]*(?:\b[a-zA-Z]{1,2}\b(?:\([a-zA-Z]\))?|\d+|\.\.\.|\bdots\b)\s*)+/gi;

    let processed = text.replace(mathEquationRegex, (match) => {
      let cleanFormula = match.trim().replace(/\.\.\./g, "\\dots");
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
      <div className="min-h-screen bg-[#FAFAFC] text-gray-900 flex flex-col items-center justify-center gap-4 font-sans">
        <FiLoader className="animate-spin text-[#6D28D9]" size={36} />
        <p className="text-gray-500 font-medium text-sm">Menyiapkan lembaran materi...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[#FAFAFC] text-gray-900 flex flex-col items-center justify-center gap-4 font-sans">
        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 text-center">
          <p className="text-rose-600 font-bold mb-4">{errorMsg}</p>
          <button onClick={() => window.close()} className="text-gray-500 font-semibold text-sm hover:text-gray-800 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm transition-all">
            Tutup Halaman
          </button>
        </div>
      </div>
    );
  }

  const processedContent = preprocessMateriContent(materi?.content || "");

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-gray-900 font-sans selection:bg-[#6D28D9] selection:text-white animate-in fade-in duration-500">
      
      {/* TOP NAVIGATION BAR WITH CTA BUTTON */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 py-3 md:py-4 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => window.close()} 
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#6D28D9] transition-colors"
          >
            <FiArrowLeft size={18} /> Tutup Modul
          </button>
          
          {/* TOMBOL MULAI LATIHAN DIPINDAH KE SINI */}
          <Link 
            href={`/exercise/${subtopicId}`}
            className="flex items-center gap-2 bg-[#FF7849] hover:bg-[#e06336] text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-[0_4px_15px_rgba(255,120,73,0.3)] hover:shadow-[0_6px_20px_rgba(255,120,73,0.4)] hover:-translate-y-0.5"
          >
            Mulai Latihan <FiArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-3xl mx-auto px-5 mt-10 pb-40">
        
        {/* Header Materi */}
        <div className="border-b border-gray-100 pb-8 mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center justify-center w-12 h-12 rounded-[14px] bg-[#6D28D9]/10 border border-[#6D28D9]/10 text-[#6D28D9]">
              <FaGem size={20} />
            </div>
            <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#6D28D9] bg-[#6D28D9]/5 border border-[#6D28D9]/10 rounded-lg shadow-sm">
              {materi?.level || "Mastery Module"}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold font-heading text-gray-900 tracking-tight leading-[1.15]">
            {materi?.title}
          </h1>

          <div className="flex items-center gap-5 text-xs font-semibold text-gray-500 mt-6">
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-sm"><FiClock className="text-[#FF7849]" /> Waktu Bebas</span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-sm"><FiBookOpen className="text-[#6D28D9]" /> Tab Interaktif</span>
          </div>
        </div>

        {/* AREA ISI MATERI */}
        <div className="prose prose-gray max-w-none text-gray-700 text-base md:text-lg leading-relaxed bg-white border border-gray-100 rounded-[32px] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.03)]
          [&_.katex-display]:bg-[#6D28D9]/5 
          [&_.katex-display]:border 
          [&_.katex-display]:border-[#6D28D9]/10 
          [&_.katex-display]:px-6
          [&_.katex-display]:py-6 
          [&_.katex-display]:rounded-[20px] 
          [&_.katex-display]:my-8
          [&_.katex-display]:text-[#6D28D9]
          [&_.katex-display]:font-bold
          [&_.katex-display]:overflow-x-auto 
          [&_.katex-display]:shadow-sm
          [&_p]:mb-6
          [&_h1]:font-heading [&_h1]:text-gray-900
          [&_h2]:font-heading [&_h2]:text-gray-900
          [&_h3]:font-heading [&_h3]:text-gray-800
          [&_strong]:text-gray-900
          [&_code]:bg-gray-50 [&_code]:text-[#FF7849] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm, remarkMath]} 
            rehypePlugins={[rehypeKatex]}
          >
            {processedContent}
          </ReactMarkdown>
        </div>

        {/* --- AREA RIWAYAT TANYA JAWAB --- */}
        <div className="mt-12">
          {messages.length > 0 && (
            <div className="flex items-center gap-2 mb-6 ml-2">
              <div className="h-2 w-2 rounded-full bg-[#FF7849] animate-pulse" />
              <h3 className="text-[11px] font-bold tracking-widest text-[#FF7849] uppercase">
                Diskusi Socrates AI
              </h3>
            </div>
          )}

          <div className="space-y-6">
            {messages.map((msg, index) => (
              <div key={index} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`flex items-center gap-2 mb-2 text-[10px] font-bold tracking-widest uppercase ${msg.role === "user" ? "text-[#6D28D9] mr-2" : "text-gray-500 ml-2"}`}>
                  {msg.role === "user" ? (
                    <>
                      <span>Kamu</span>
                      <FiUser size={12} />
                    </>
                  ) : (
                    <>
                      <FiCpu size={12} />
                      <span>Socrates Tutor</span>
                    </>
                  )}
                </div>
                
                <div className={`text-sm md:text-base leading-relaxed max-w-[85%] ${
                  msg.role === "user" 
                    ? "bg-[#6D28D9] text-white px-6 py-4 rounded-[24px] rounded-tr-sm shadow-[0_8px_20px_rgba(109,40,217,0.15)]" 
                    : "bg-white text-gray-800 px-6 py-5 rounded-[24px] rounded-tl-sm border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
                }
                  [&_.katex-display]:bg-white/10 
                  [&_.katex-display]:border 
                  [&_.katex-display]:border-white/20 
                  [&_.katex-display]:p-4 
                  [&_.katex-display]:rounded-xl 
                  [&_.katex-display]:my-4 
                  [&_.katex-display]:overflow-x-auto`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex items-center gap-3 text-[#6D28D9] text-sm font-semibold bg-white px-5 py-3 rounded-full border border-gray-100 shadow-sm w-fit ml-2 animate-in fade-in">
                <FiLoader className="animate-spin" size={16} />
                <span>AI sedang merumuskan jawaban...</span>
              </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

      </div>

      {/* --- KOTAK INPUT CHAT STATIS (Melayang di Bawah Layar) --- */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-4 py-4 md:py-6 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
        <div className="max-w-3xl mx-auto relative">
          <div className="bg-gray-50 border border-gray-200 rounded-[24px] p-2 focus-within:border-[#6D28D9]/40 focus-within:ring-4 focus-within:ring-[#6D28D9]/10 focus-within:bg-white transition-all shadow-inner">
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
                placeholder="Tanyakan bagian materi yang belum kamu pahami ke AI..."
                className="flex-1 bg-transparent px-4 py-3 text-sm md:text-base text-gray-900 outline-none placeholder-gray-400 resize-none max-h-32 min-h-[48px] custom-scrollbar"
                rows={1}
                disabled={chatLoading}
              />
              <button
                onClick={handleSend}
                disabled={chatLoading || !input.trim()}
                className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#6D28D9] text-white disabled:opacity-50 disabled:bg-gray-300 hover:bg-[#5b21b6] hover:-translate-y-0.5 transition-all shrink-0 mb-0.5 shadow-sm"
              >
                <FiSend size={18} />
              </button>
            </div>
          </div>
          <div className="text-center text-[10px] font-medium text-gray-400 mt-3">
            ThinkTrack AI EdTech Platform • AI dapat membuat kesalahan. Evaluasi kembali jawaban untuk pemahaman terbaik.
          </div>
        </div>
      </div>

    </div>
  );
}