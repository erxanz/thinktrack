"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import LatexRenderer from "@/components/ui/LatexRenderer";

// Import MathKeyboard secara dinamis untuk menghindari SSR error
const MathKeyboard = dynamic(() => import("@/components/input/MathKeyboard"), {
  ssr: false,
  loading: () => (
    <div className="h-24 bg-slate-100 fixed bottom-0 w-full animate-pulse" />
  ),
});

export default function LatihanSoalPage() {
  // State untuk menyimpan daftar langkah yang sudah disubmit siswa
  const [steps, setSteps] = useState<string[]>([]);
  // State untuk teks yang sedang diketik di keyboard saat ini
  const [currentInput, setCurrentInput] = useState("");

  const handleAddStep = () => {
    if (currentInput.trim() !== "") {
      setSteps([...steps, currentInput]);
      // Catatan: Idealnya kita mengosongkan keyboard di sini,
      // namun karena mathlive dikelola via DOM internal, kita biarkan siswa melanjutkannya
    }
  };

  const handleSubmitKeAI = () => {
    alert(
      "Mengirim data langkah berikut ke AI untuk dianalisis:\n" +
        JSON.stringify(steps, null, 2),
    );
    // Nanti di sini kita panggil endpoint API Claude Anda
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-40">
      {/* Header Soal */}
      <div className="bg-white p-6 rounded-b-3xl shadow-sm mb-6">
        <h1 className="text-gray-500 text-sm font-medium mb-2">
          Petunjuk: Selesaikan persamaan berikut.
        </h1>
        <div className="text-2xl font-bold text-center my-4">
          <LatexRenderer content="2x + 4 = 10" />
        </div>
        <p className="text-xs text-gray-400 text-center">
          Tuliskan setiap langkah penyelesaianmu secara berurutan.
        </p>
      </div>

      {/* Daftar Langkah (Thinking Trace) */}
      <div className="px-4 space-y-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative">
            <span className="absolute top-2 left-3 text-xs font-bold text-blue-600">
              Step {index + 1}
            </span>
            <div className="mt-4 flex justify-center text-lg">
              <LatexRenderer content={step} />
            </div>
          </div>
        ))}
      </div>

      {/* Tombol Tambah Langkah & Submit */}
      <div className="px-4 mt-6 flex flex-col gap-3">
        <button
          onClick={handleAddStep}
          className="w-full py-3 bg-blue-50 text-blue-600 font-semibold rounded-xl border border-blue-200 active:bg-blue-100 transition">
          + Tambah Langkah Baru
        </button>

        {steps.length > 0 && (
          <button
            onClick={handleSubmitKeAI}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-md active:scale-[0.98] transition">
            Kirim ke AI untuk Dianalisis
          </button>
        )}
      </div>

      {/* Keyboard Virtual di bawah layar */}
      <MathKeyboard onInput={(latex) => setCurrentInput(latex)} />
    </div>
  );
}
