"use client";

import Link from "next/link";
import { FiExternalLink, FiTrash2, FiX } from "react-icons/fi";
import type { CalendarNote } from "./types";

interface CreateNoteModalProps {
  open: boolean;
  mode: "create" | "edit";
  title: string;
  content: string;
  scheduledAt: string;
  selectedDateLabel: string;
  notesForDate: CalendarNote[];
  isSaving: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onDelete: () => void;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onScheduledAtChange: (value: string) => void;
  onEditExisting: (note: CalendarNote) => void;
  onDeleteExisting: (note: CalendarNote) => void;
}

export default function CreateNoteModal({
  open,
  mode,
  title,
  content,
  scheduledAt,
  selectedDateLabel,
  notesForDate,
  isSaving,
  isDeleting,
  onClose,
  onSubmit,
  onDelete,
  onTitleChange,
  onContentChange,
  onScheduledAtChange,
  onEditExisting,
  onDeleteExisting,
}: CreateNoteModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 pt-20 pb-4 px-4 backdrop-blur-sm sm:items-center sm:pt-4">
      {/* Modal Container */}
      <div className="w-full max-w-4xl overflow-hidden rounded-md border border-[#333333] bg-[#252526] shadow-2xl font-sans">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-[#333333] bg-[#252526] px-5 py-3.5">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#858585]">
              {mode === "create" ? "New File / Note" : "Edit File / Note"}
            </p>
            <h2 className="truncate text-[14px] font-medium text-[#f3f3f3] mt-0.5">
              {selectedDateLabel}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#858585] transition-colors hover:bg-[#333333] hover:text-white"
            aria-label="Tutup modal">
            <FiX size={16} />
          </button>
        </div>

        <div className="grid md:grid-cols-[minmax(0,1fr)_280px]">
          {/* Bagian Form (Kiri) */}
          <div className="flex flex-col p-5 bg-[#1e1e1e]">
            <div className="space-y-4 flex-1">
              {/* Input Judul */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-[#cccccc]">
                  Judul
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => onTitleChange(event.target.value)}
                  placeholder="Masukkan judul catatan..."
                  className="w-full rounded-sm border border-[#3c3c3c] bg-[#3c3c3c] px-3 py-2 text-[13px] text-[#cccccc] outline-none transition-colors placeholder:text-[#858585] focus:border-[#007fd4] focus:bg-[#1e1e1e]"
                />
              </div>

              {/* Input Tanggal */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-[#cccccc]">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={scheduledAt}
                  onChange={(event) => onScheduledAtChange(event.target.value)}
                  className="w-full rounded-sm border border-[#3c3c3c] bg-[#3c3c3c] px-3 py-2 text-[13px] text-[#cccccc] outline-none transition-colors focus:border-[#007fd4] focus:bg-[#1e1e1e] scheme-dark"
                />
              </div>

              {/* Input Konten */}
              <div className="space-y-1.5 h-full">
                <label className="text-[11px] font-medium text-[#cccccc]">
                  Konten
                </label>
                <textarea
                  value={content}
                  onChange={(event) => onContentChange(event.target.value)}
                  placeholder="Tulis detail catatan di sini..."
                  rows={8}
                  className="w-full resize-none rounded-sm border border-[#3c3c3c] bg-[#3c3c3c] px-3 py-2 text-[13px] leading-6 text-[#cccccc] outline-none transition-colors placeholder:text-[#858585] focus:border-[#007fd4] focus:bg-[#1e1e1e]"
                />
              </div>
            </div>

            {/* Actions (Bawah Form) */}
            <div className="mt-6 flex flex-col gap-3 border-t border-[#333333] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-[#858585]">
                {mode === "create"
                  ? "Catatan ini akan tersimpan di Workspace."
                  : "Mengubah tanggal akan memindahkan catatan."}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {mode === "edit" && (
                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-[12px] font-medium text-[#c74e4e] transition-colors hover:bg-[#333333] disabled:opacity-50">
                    <FiTrash2 size={14} />
                    {isDeleting ? "Menghapus..." : "Hapus"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-sm border border-[#3c3c3c] bg-[#333333] px-4 py-1.5 text-[12px] font-medium text-[#cccccc] transition-colors hover:bg-[#444444]">
                  Batal
                </button>

                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={isSaving}
                  className="rounded-sm bg-[#007fd4] px-4 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-[#006eb8] disabled:opacity-60">
                  {isSaving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar (Kanan): Daftar Catatan di Hari yang Sama */}
          <aside className="flex flex-col border-t border-[#333333] bg-[#252526] md:border-l md:border-t-0 max-h-125 overflow-hidden">
            <div className="border-b border-[#333333] px-4 py-3 bg-[#252526]">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#858585]">
                Agenda Explorer
              </p>
              <h3 className="mt-0.5 text-[12px] font-medium text-[#cccccc]">
                {notesForDate.length} item pada hari ini
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto">
              {notesForDate.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 text-center text-[#858585]">
                  <p className="text-[12px]">Tidak ada catatan lain.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {notesForDate.map((note) => (
                    <div
                      key={note.id}
                      className="group flex flex-col border-b border-[#333333] p-3 transition-colors hover:bg-[#2a2d2e] last:border-b-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium text-[#d4d4d4] group-hover:text-white">
                            {note.title}
                          </p>
                          <p className="mt-0.5 line-clamp-1 text-[11px] text-[#858585]">
                            {note.content || "Tidak ada detail konten."}
                          </p>
                        </div>

                        {/* Action List (Muncul saat hover di desktop) */}
                        <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => onEditExisting(note)}
                            title="Edit Catatan"
                            className="flex h-6 w-6 items-center justify-center rounded-sm text-[#858585] transition-colors hover:bg-[#333333] hover:text-[#cccccc]">
                            <FiX className="rotate-45" size={12} />{" "}
                            {/* Alternatif ikon edit tipis */}
                          </button>

                          <Link
                            href={`/dashboard/${note.id}`}
                            onClick={(event) => event.stopPropagation()}
                            title="Buka di Editor"
                            className="flex h-6 w-6 items-center justify-center rounded-sm text-[#858585] transition-colors hover:bg-[#333333] hover:text-[#007fd4]">
                            <FiExternalLink size={12} />
                          </Link>

                          <button
                            type="button"
                            onClick={() => onDeleteExisting(note)}
                            title="Hapus"
                            className="flex h-6 w-6 items-center justify-center rounded-sm text-[#858585] transition-colors hover:bg-[#333333] hover:text-[#c74e4e]">
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
