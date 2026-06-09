"use client";

import { useState, useRef, useEffect } from "react";
import { FiSend, FiLoader, FiUser, FiCpu } from "react-icons/fi";

interface MateriInlineChatProps {
  materiTitle?: string;
  materiContent?: string;
}

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function MateriInlineChat({ materiTitle, materiContent }: MateriInlineChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Referensi untuk auto-scroll ke pesan terbawah
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Efek untuk menggulir layar otomatis ke bawah setiap ada pesan/loading baru
  useEffect(() => {
    if (messages.length > 0 || isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const instruction = `Anda adalah asisten tutor AI yang ramah dari ThinkTrack EdTech. 
Tugas Anda adalah menjawab pertanyaan user berdasarkan materi berjudul "${materiTitle}".
Berikut adalah isi materinya:
---
${materiContent}
---
Jawablah pertanyaan user dengan jelas, ringkas, dan mudah dipahami. Jika pertanyaan tidak relevan dengan materi, jawablah secara umum dengan tetap sopan.`;

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
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans">
      
      {/* --- AREA RIWAYAT CHAT (Bisa Digulir bersama Materi) --- */}
      {/* pb-36 memberikan ruang kosong di bawah agar pesan tidak tertutup bar input statis */}
      <div className="mt-12 border-t border-white/5 pt-8 pb-36">
        
        {messages.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            <div className="h-1.5 w-1.5 rounded-full bg-Blue-500 animate-pulse" />
            <h3 className="text-xs font-bold tracking-wider text-Blue-400 uppercase">
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
                    <FiCpu className="text-Blue-400" size={13} />
                    <span className="text-Blue-400">Tutor AI</span>
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

          {/* Animasi Loading AI */}
          {isLoading && (
            <div className="flex items-center gap-3 text-Blue-400 text-sm animate-pulse py-4">
              <FiLoader className="animate-spin" size={16} />
              <span>AI sedang memikirkan jawaban...</span>
            </div>
          )}

          {/* Titik jangkar untuk auto-scroll */}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* --- AREA INPUT CHAT (Statis / Fixed di Bawah Layar) --- */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/90 backdrop-blur-xl border-t border-white/10 px-4 py-4 md:py-6">
        <div className="max-w-3xl mx-auto relative">
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-2 focus-within:border-Blue-500/50 focus-within:ring-1 focus-within:ring-Blue-500/20 transition-all shadow-lg">
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
                placeholder="Tanyakan sesuatu tentang materi ini..."
                className="flex-1 bg-transparent px-3 py-2 text-sm md:text-base text-zinc-200 outline-none placeholder-zinc-600 resize-none max-h-32 min-h-[44px] custom-scrollbar"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="flex items-center justify-center w-11 h-11 rounded-xl bg-white text-black disabled:opacity-20 disabled:bg-zinc-800 disabled:text-zinc-500 hover:bg-zinc-200 transition-colors shrink-0 mb-0.5"
              >
                <FiSend size={18} />
              </button>
            </div>
          </div>
          <div className="text-center text-[10px] text-zinc-500 mt-3">
            AI dapat membuat kesalahan. Evaluasi kembali jawaban untuk pemahaman yang lebih baik.
          </div>
        </div>
      </div>

    </div>
  );
}