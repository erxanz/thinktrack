"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FiSend, FiX, FiCpu, FiUser, FiCheckCircle } from "react-icons/fi";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SocratesChatModalProps {
  bugData: any;
  userId: string;
  subtopicId: string;
  onClose: () => void;
  onComplete: () => void;
}

export function SocratesChatModal({ bugData, userId, subtopicId, onClose, onComplete }: SocratesChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: `Halo! Mari kita bedah bersama celah pemahamanmu mengenai "${bugData.cognitiveBug}". Jangan khawatir, kita akan meluruskan logikanya selangkah demi selangkah. Menurut pandanganmu sendiri, bagian mana dari konsep ini yang paling membingungkan saat pengerjaan soal tadi?` 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (forcedMessage?: string) => {
    const textToSend = forcedMessage || input;
    if (!textToSend.trim()) return;

    // Jika ini bukan pesan paksaan (forced), tambahkan ke UI
    let newMessages = [...messages];
    if (!forcedMessage) {
      newMessages.push({ role: "user", content: textToSend });
      setMessages(newMessages as Message[]);
      setInput("");
    }
    
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/socrates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          subtopicId,
          bugData,
          // Jika dipaksa selesai, tambahkan instruksi rahasia ke AI
          messages: forcedMessage 
            ? [...newMessages, { role: "user", content: "Sistem: Pengguna ingin mengakhiri sesi. Segera berikan kesimpulan penutup, set isResolved menjadi true, dan buatkan rangkuman cheatsheet-nya sekarang." }]
            : newMessages
        })
      });

      const data = await res.json();
      
      // Update UI dengan balasan AI
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }] as Message[]);

      // Pemicu munculnya tombol KLAIM CATATAN
      if (data.isResolved) {
        setIsResolved(true);
      }
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md p-0 md:p-6 md:items-center">
      <div className="w-full md:max-w-4xl bg-zinc-900 border border-zinc-800 md:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] md:h-[80vh] animate-in slide-in-from-bottom-10 duration-300">
        
        {/* HEADER MODAL */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-5 text-white flex justify-between items-center shadow-lg shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
              <FiCpu size={24} className="text-orange-100" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl tracking-tight text-white">Socrates AI Cognitive Tutor</h3>
              <p className="text-xs opacity-90 text-orange-100 mt-0.5 font-medium">
                Resolusi Interaktif: <span className="underline italic">{bugData.cognitiveBug}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-black/10 rounded-xl hover:bg-black/20 text-white transition-all border border-white/10">
            <FiX size={20} />
          </button>
        </div>

        {/* AREA CHAT */}
        <div className="flex-1 p-6 overflow-y-auto bg-zinc-950 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-9 h-9 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0 mt-1">
                  <FiCpu size={18} />
                </div>
              )}
              
              <div className={`max-w-[75%] p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm ${
                msg.role === "user" 
                  ? "bg-blue-600 text-white rounded-tr-none px-5 font-medium" 
                  : "bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-tl-none px-5"
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>

              {msg.role === "user" && (
                <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-1">
                  <FiUser size={18} />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
             <div className="flex gap-4 justify-start">
               <div className="w-9 h-9 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                 <FiCpu size={18} />
               </div>
               <div className="bg-zinc-900 border border-zinc-800 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5 items-center">
                 <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" />
                 <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                 <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]" />
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 shrink-0">
          {/* JIKA AI SUDAH MENYATAKAN SELESAI (ISRESOLVED = TRUE) */}
          {isResolved ? (
            <div className="p-5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-center max-w-2xl mx-auto animate-in zoom-in-95">
              <h4 className="text-emerald-400 font-bold text-lg mb-1">🎉 Pemahaman Kognitif Tercapai!</h4>
              <p className="text-sm text-emerald-300/80 mb-4">
                AI telah selesai memvalidasi logikamu dan menyusun catatan ringkasnya di database. Klik tombol di bawah untuk menyematkannya di Ruang Belajar.
              </p>
              <Button 
                onClick={() => { 
                  onComplete(); 
                  onClose();    
                }} 
                className="w-full max-w-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-4 rounded-xl shadow-xl transition-all hover:scale-105"
              >
                💾 Klaim Catatan Personal AI
              </Button>
            </div>
          ) : (
            /* JIKA MASIH DISKUSI (KOLOM INPUT) */
            <div className="max-w-4xl mx-auto flex gap-3 items-center">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Jawab AI di sini..."
                className="flex-1 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-5 py-3.5 text-sm md:text-base focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                disabled={isLoading}
              />
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleSend()} 
                  disabled={isLoading || !input.trim()} 
                  className="rounded-xl bg-orange-600 hover:bg-orange-500 text-white px-5 py-3.5 h-auto font-bold flex items-center gap-2 shadow-lg shadow-orange-950/50"
                  title="Kirim Balasan ke AI"
                >
                  <span className="hidden md:inline">Kirim</span>
                  <FiSend size={16} />
                </Button>
                
                {/* TOMBOL BARU: MEMAKSA AI MENGAKHIRI CHAT DAN MEMBUAT CATATAN */}
                <Button 
                  onClick={() => handleSend("Paksa Selesai")} 
                  disabled={isLoading} 
                  variant="outline"
                  className="rounded-xl border-zinc-700 bg-zinc-800 hover:bg-zinc-700 hover:text-emerald-400 text-zinc-300 px-4 py-3.5 h-auto font-bold flex items-center gap-2"
                  title="Langsung hentikan obrolan dan minta AI buatkan catatan sekarang"
                >
                  <FiCheckCircle size={16} />
                  <span className="hidden lg:inline">Selesai & Buat Catatan</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}