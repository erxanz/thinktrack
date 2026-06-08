"use client";

import { useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";

export default function CreateTopicButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");

  const handleSubmit = async () => {
    if (!title.trim()) return;

    try {
      const response = await fetch("/api/topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal membuat topik");
      }

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Gagal membuat topik");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-900/20">
        <FiPlus size={16} />
        Materi Baru
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">
                Dekomposisi Materi Baru
              </h2>

              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white">
                <FiX />
              </button>
            </div>

            <input
              type="text"
              placeholder="Contoh: Belajar Python"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500"
            />

            <button
              onClick={handleSubmit}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium">
              Buat Roadmap AI
            </button>
          </div>
        </div>
      )}
    </>
  );
}
