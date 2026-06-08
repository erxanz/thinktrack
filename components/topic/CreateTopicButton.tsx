"use client";

import { useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";

export default function CreateTopicButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/topics/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
        }),
      });

      if (!response.ok) {
        let detail: unknown = null;

        try {
          detail = await response.json();
        } catch {
          // ignore
        }

        const msg =
          (typeof detail === "object" && detail !== null
            ? (detail as { error?: string }).error
            : undefined) ||
          (typeof detail === "object" && detail !== null
            ? (detail as { aiError?: string }).aiError
            : undefined) ||
          (typeof detail === "object" && detail !== null
            ? (detail as { hint?: string }).hint
            : undefined) ||
          "Gagal membuat topik";

        throw new Error(msg);
      }

      setIsOpen(false);
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Gagal membuat topik");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-900/20"
        disabled={isSubmitting}
      >
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
                onClick={() => {
                  if (!isSubmitting) setIsOpen(false);
                }}
                className="text-zinc-400 hover:text-white disabled:opacity-60"
                disabled={isSubmitting}
              >
                <FiX />
              </button>
            </div>

            <input
              type="text"
              placeholder="Contoh: Belajar Python"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 disabled:opacity-60"
              disabled={isSubmitting}
            />

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Membuat..." : "Buat Materi + Latihan"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
