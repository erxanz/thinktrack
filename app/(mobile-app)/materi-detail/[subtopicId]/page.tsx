/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, use, useRef } from "react";
import { FiBookOpen, FiArrowLeft, FiLoader, FiClock, FiSend, FiUser, FiCpu } from "react-icons/fi";
import { FaGem } from "react-icons/fa";

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
  
  // Referensi DOM untuk auto-scroll ke riwayat pesan terbawah
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // useEffect untuk mengambil data detail materi
  useEffect(() => {
    const fetchMateriDetail = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);
        
        // Memanggil API khusus untuk 1 sub-bab yang aktif
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

  // useEffect untuk menggulir otomatis (auto-scroll) layar ke bawah saat ada pesan baru
  useEffect(() => {
    if (messages.length > 0 || chatLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, chatLoading]);

  // Fungsi untuk mengirim pertanyaan ke endpoint /api/ai
  const handleSend = async () => {
    if (!input.trim() || chatLoading || !materi) return;

    const userMessage = input.trim();
    setInput("");
    
    // Tambah pertanyaan pengguna ke list percakapan
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setChatLoading(true);

    try {
      // Menyusun instruksi sistem kontekstual agar AI menjawab berbasis isi konten materi
      const instruction = `Anda adalah asisten tutor AI yang ramah dari ThinkTrack EdTech. 
Tugas Anda adalah menjawab pertanyaan user berdasarkan materi berjudul "${materi.title}".
Berikut adalah isi materinya:
---
${materi.content}
---
Jawablah pertanyaan user dengan jelas, ringkas, dan menggunakan markdown/bahasa yang mudah dipahami. Jika pertanyaan sama sekali tidak relevan dengan materi, jawablah secara umum dengan tetap sopan.`;

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
      
      // Tambah jawaban AI ke list percakapan
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

  // Tampilan Utama saat Loading Materi
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center gap-4">
        <FiLoader className="animate-spin text-blue-500" size={36} />
        <p className="text-zinc-400 text-sm">Membuka lembaran materi...</p>
      </div>
    );
  }

  // Tampilan Utama saat Terjadi Error
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
      {/* pb-36 memberikan area kosong di bawah agar isi percakapan tidak tertutup bar chat statis */}
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

        {/* Isi Penjelasan Lanjutan Materi */}
        <div className="prose prose-invert max-w-none text-zinc-300 text-base md:text-lg leading-relaxed whitespace-pre-line bg-zinc-900/20 border border-white/5 rounded-2xl p-6 md:p-8 shadow-inner">
          {materi?.content}
        </div>

        {/* --- AREA RIWAYAT TANYA JAWAB (Mengalir dinamis di bawah materi) --- */}
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
                <div className={`text-base leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user" ? "text-zinc-300" : "text-zinc-200"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Animasi Loading Pemrosesan Jawaban AI */}
            {chatLoading && (
              <div className="flex items-center gap-3 text-purple-400 text-sm animate-pulse py-4">
                <FiLoader className="animate-spin" size={16} />
                <span>AI sedang merumuskan jawaban...</span>
              </div>
            )}

            {/* Titik pembatas target penanda scroll otomatis */}
            <div ref={messagesEndRef} className="h-2" />
          </div>
        </div>

      </div>

      {/* --- KOTAK INPUT CHAT STATIS (Fixed menempel di bagian bawah layar) --- */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/90 backdrop-blur-xl border-t border-white/10 px-4 py-4 md:py-6">
        <div className="max-w-3xl mx-auto relative">
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-2 focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/20 transition-all shadow-lg">
            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  // Kirim pesan ketika menekan 'Enter' tanpa kombinasi tombol 'Shift'
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