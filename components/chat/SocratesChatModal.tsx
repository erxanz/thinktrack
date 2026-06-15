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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/40 backdrop-blur-md p-0 md:p-6 md:items-center font-sans">
      <div className="w-full md:max-w-4xl bg-[#FAFAFC] border border-gray-100 md:rounded-[32px] rounded-t-[32px] shadow-[0_20px_80px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col h-[85vh] md:h-[85vh] animate-in slide-in-from-bottom-10 duration-500">
        
        {/* HEADER MODAL */}
        <div className="bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] px-6 py-5 md:py-6 text-white flex justify-between items-center shadow-md shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[40px] rounded-full pointer-events-none"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
              <FiCpu size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-extrabold font-heading text-xl md:text-2xl tracking-tight text-white drop-shadow-sm">Socrates AI Tutor</h3>
              <p className="text-xs md:text-sm opacity-90 text-violet-100 mt-0.5 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Resolusi Aktif: <span className="font-bold truncate max-w-[200px] md:max-w-md">{bugData.cognitiveBug}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 bg-black/10 rounded-xl hover:bg-black/20 text-white transition-all border border-white/10 relative z-10">
            <FiX size={22} />
          </button>
        </div>

        {/* AREA CHAT */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#FAFAFC] space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 md:gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-10 h-10 rounded-[14px] bg-white border border-gray-100 flex items-center justify-center text-[#6D28D9] shrink-0 mt-1 shadow-sm">
                  <FiCpu size={20} />
                </div>
              )}
              
              <div className={`max-w-[80%] md:max-w-[70%] p-5 text-sm md:text-base leading-relaxed shadow-[0_4px_20px_rgb(0,0,0,0.03)] ${
                msg.role === "user" 
                  ? "bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] text-white rounded-[24px] rounded-tr-sm font-medium shadow-[0_8px_30px_rgba(109,40,217,0.15)]" 
                  : "bg-white text-gray-800 border border-gray-100 rounded-[24px] rounded-tl-sm"
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>

              {msg.role === "user" && (
                <div className="w-10 h-10 rounded-[14px] bg-[#6D28D9]/10 border border-[#6D28D9]/20 flex items-center justify-center text-[#6D28D9] shrink-0 mt-1">
                  <FiUser size={20} />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
             <div className="flex gap-4 justify-start animate-in fade-in">
               <div className="w-10 h-10 rounded-[14px] bg-white border border-gray-100 flex items-center justify-center text-[#6D28D9] shrink-0 shadow-sm">
                 <FiCpu size={20} />
               </div>
               <div className="bg-white border border-gray-100 px-6 py-5 rounded-[24px] rounded-tl-sm shadow-sm flex gap-2 items-center">
                 <div className="w-2.5 h-2.5 bg-[#6D28D9]/40 rounded-full animate-bounce" />
                 <div className="w-2.5 h-2.5 bg-[#6D28D9]/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                 <div className="w-2.5 h-2.5 bg-[#6D28D9] rounded-full animate-bounce [animation-delay:0.4s]" />
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        <div className="p-4 md:p-6 bg-white border-t border-gray-100 shrink-0 shadow-[0_-10px_40px_rgb(0,0,0,0.02)]">
          {/* JIKA AI SUDAH MENYATAKAN SELESAI (ISRESOLVED = TRUE) */}
          {isResolved ? (
            <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-[24px] text-center max-w-2xl mx-auto animate-in zoom-in-95 shadow-sm">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-50">
                <FiCheckCircle className="text-emerald-500" size={32} />
              </div>
              <h4 className="text-emerald-700 font-extrabold font-heading text-xl mb-2">Pemahaman Kognitif Tercapai!</h4>
              <p className="text-sm text-emerald-600/80 mb-6 max-w-md mx-auto">
                AI telah selesai memvalidasi logikamu dan menyusun catatan ringkasnya di database. Klik tombol di bawah untuk menyematkannya di AI Pocket Book Anda.
              </p>
              <Button 
                onClick={() => { 
                  onComplete(); 
                  onClose();    
                }} 
                className="w-full max-w-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-6 rounded-[16px] shadow-[0_10px_30px_rgba(16,185,129,0.2)] transition-all hover:scale-105 text-lg"
              >
                💾 Klaim Catatan Personal AI
              </Button>
            </div>
          ) : (
            /* JIKA MASIH DISKUSI (KOLOM INPUT) */
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Balas AI Tutor di sini..."
                className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-[16px] px-6 py-4 text-sm md:text-base focus:outline-none focus:border-[#6D28D9] focus:ring-1 focus:ring-[#6D28D9] focus:bg-white transition-all"
                disabled={isLoading}
              />
              
              <div className="flex gap-2 shrink-0">
                <Button 
                  onClick={() => handleSend()} 
                  disabled={isLoading || !input.trim()} 
                  className="rounded-[16px] bg-[#FF7849] hover:bg-[#e06336] text-white px-6 py-6 h-auto font-bold flex items-center gap-2 shadow-[0_8px_20px_rgba(255,120,73,0.25)] transition-all"
                  title="Kirim Balasan ke AI"
                >
                  <span className="hidden md:inline">Kirim</span>
                  <FiSend size={18} />
                </Button>
                
                {/* TOMBOL MEMAKSA AI MENGAKHIRI CHAT */}
                <Button 
                  onClick={() => handleSend("Paksa Selesai")} 
                  disabled={isLoading} 
                  variant="outline"
                  className="rounded-[16px] border-gray-200 bg-white hover:bg-[#FF7849]/5 hover:border-[#FF7849]/30 hover:text-[#FF7849] text-gray-600 px-5 py-6 h-auto font-bold flex items-center gap-2 transition-all shadow-sm"
                  title="Langsung hentikan obrolan dan minta AI buatkan catatan sekarang"
                >
                  <FiCheckCircle size={18} />
                  <span className="hidden lg:inline">Buat Catatan</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}